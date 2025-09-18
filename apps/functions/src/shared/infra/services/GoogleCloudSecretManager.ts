import * as functions from 'firebase-functions';
import { v4 as uuid } from 'uuid';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { SecretManagerClient } from '../../services/SecretManagerClient';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { COLLECTION, DOCUMENT, UserSettingsDocument } from '@akademiasaas/shared';

const crypto = require('crypto');

interface Dependencies {
  logger: typeof functions.logger;
  secretProjectManagerId: string;
  db: Firestore;
}

export class GoogleCloudSecretManager implements SecretManagerClient {
  client = new SecretManagerServiceClient();
  algorithm = 'aes-256-ctr';

  constructor(private dependencies: Dependencies) {}

  public async getUserSettings(userId: string) {
    const { db } = this.dependencies;

    const doc = await db.collection(COLLECTION.SETTINGS).doc(userId).get();

    return doc.data() as UserSettingsDocument | null;
  }

  public async createSharedSecret(payload: string, userId: string) {
    const { db } = this.dependencies;
    const sharedSecret = await db.collection(COLLECTION.SETTINGS).doc(DOCUMENT.SHARED_KEYS).get();
    let key: null | string = '';

    if (sharedSecret.exists) {
      const data = sharedSecret.data() as UserSettingsDocument;
      if (data.pathToKey) {
        key = await this.retrieveSecretVersion(data.pathToKey);
      }
    }

    if (!key) {
      key = crypto.createHash('sha256').update(uuid()).digest('base64').substr(0, 32) as string;
      const path = await this.createUserSecret(key);

      await db.collection(COLLECTION.SETTINGS).doc(DOCUMENT.SHARED_KEYS).set(
        {
          pathToKey: path,
          id: DOCUMENT.SHARED_KEYS,
          keys: {},
        },
        { merge: true }
      );
    }

    const ivInBytes: Buffer = crypto.randomBytes(16);
    const encrypted = this.encrypt(payload, key, ivInBytes);
    const keyId = uuid();

    try {
      await db
        .collection(COLLECTION.SETTINGS)
        .doc(userId)
        .update({
          [`keys.${keyId}`]: { iv: encrypted.iv, key: encrypted.content, shared: true },
        });
    } catch {
      // fallback when not exists
      await db
        .collection(COLLECTION.SETTINGS)
        .doc(userId)
        .set(
          {
            pathToKey: null,
            id: userId,
            keys: {
              [keyId]: { iv: encrypted.iv, key: encrypted.content, shared: true },
            },
          },
          { merge: true }
        );
    }

    return keyId;
  }

  public async createSecret(payload: string, userId: string) {
    const { db } = this.dependencies;
    const userSecret = await db.collection(COLLECTION.SETTINGS).doc(userId).get();
    let key: null | string = '';

    const data = userSecret.data() as UserSettingsDocument;

    if (userSecret.exists) {
      if (data.pathToKey) {
        key = await this.retrieveSecretVersion(data.pathToKey);
      }
    }

    if (!key) {
      key = crypto.createHash('sha256').update(uuid()).digest('base64').substr(0, 32) as string;
      const path = await this.createUserSecret(key);

      await db
        .collection(COLLECTION.SETTINGS)
        .doc(userId)
        .set(
          {
            pathToKey: path,
            id: userId,
            keys: {
              ...(data?.keys || {}),
            },
          },
          { merge: true }
        );
    }

    const ivInBytes: Buffer = crypto.randomBytes(16);
    const encrypted = this.encrypt(payload, key, ivInBytes);
    const keyId = uuid();

    await db
      .collection(COLLECTION.SETTINGS)
      .doc(userId)
      .update({
        [`keys.${keyId}`]: { iv: encrypted.iv, key: encrypted.content },
      });

    return keyId;
  }

  public async createSecrets(payload: string[], userId: string) {
    const { db } = this.dependencies;
    const userSecret = await db.collection(COLLECTION.SETTINGS).doc(userId).get();
    let key: null | string = '';

    if (userSecret.exists) {
      const data = userSecret.data() as UserSettingsDocument;
      if (data.pathToKey) {
        key = await this.retrieveSecretVersion(data.pathToKey);
      }
    }

    if (!key) {
      key = crypto.createHash('sha256').update(uuid()).digest('base64').substr(0, 32) as string;
      const path = await this.createUserSecret(key);

      await db.collection(COLLECTION.SETTINGS).doc(userId).set(
        {
          pathToKey: path,
          id: userId,
          keys: {},
        },
        { merge: true }
      );
    }

    const ref = db.collection(COLLECTION.SETTINGS).doc(userId);

    const encryptedKeys: string[] = [];

    const batch = db.batch();

    payload.forEach((text) => {
      if (!text) {
        encryptedKeys.push('');

        return;
      }
      const ivInBytes = crypto.randomBytes(16);
      const { iv, content } = this.encrypt(text, key!, ivInBytes);
      const keyId = uuid();
      batch.update(ref, {
        [`keys.${keyId}`]: { iv, key: content },
      });

      encryptedKeys.push(content);
    });

    await batch.commit();

    return encryptedKeys;
  }

  public async decryptSecret(secret: string, userId: string) {
    const { db, logger } = this.dependencies;
    const userSecret = await db.collection(COLLECTION.SETTINGS).doc(userId).get();

    const data = userSecret.data() as UserSettingsDocument;

    if (!userSecret.exists) {
      logger.warn("Secret key path doesn't exist");

      return null;
    }

    const secretData = data.keys[secret];

    if (typeof secretData === 'string') {
      const key = await this.retrieveSecretVersion(data.pathToKey);

      if (!key) {
        logger.warn("Secret key doesn't exist in secret manager");

        return null;
      }

      return this.decrypt(secret, key, secretData);
    }

    if (secretData?.shared) {
      const sharedSecretDoc = await db
        .collection(COLLECTION.SETTINGS)
        .doc(DOCUMENT.SHARED_KEYS)
        .get();
      if (!sharedSecretDoc.exists) {
        logger.warn("Shared secret doc key path doesn't exist");

        return null;
      }

      const sharedData = sharedSecretDoc.data() as UserSettingsDocument;

      return this.decryptByKey(secretData, sharedData.pathToKey);
    }

    return this.decryptByKey(secretData, data.pathToKey);
  }

  public async decryptSecrets(secrets: string[], userId: string) {
    const { db, logger } = this.dependencies;
    const userSecret = await db.collection(COLLECTION.SETTINGS).doc(userId).get();

    if (!userSecret.exists) {
      logger.warn("Secret key path doesn't exist");

      return null;
    }

    const data = userSecret.data() as UserSettingsDocument;

    const key = await this.retrieveSecretVersion(data.pathToKey);

    if (!key) {
      logger.warn("Secret key doesn't exist in secret manager");

      return null;
    }

    return secrets.map((secret) => {
      if (!secret) {
        return '';
      }

      const secretData = data.keys[secret];

      if (typeof secretData === 'string') {
        return this.decrypt(secret, key, secretData);
      }

      return this.decrypt(secretData.key, key, secretData.iv);
    });
  }

  private async createUserSecret(payload: string, defaultSecretId?: string) {
    const { logger, secretProjectManagerId } = this.dependencies;

    const secretId = defaultSecretId ?? uuid();

    const [secret] = await this.client.createSecret({
      parent: secretProjectManagerId,
      secret: {
        name: secretId,
        replication: {
          automatic: {},
        },
      },
      secretId,
    });

    logger.info(`Created secret ${secret.name}`);

    const [version] = await this.client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload, 'utf8'),
      },
    });

    if (!version.name) {
      throw new Error('Cannot create secret');
    }

    logger.info(`Added new secret version ${version}`);

    return version.name;
  }

  public async removeSecrets(secrets: string[], userId: string) {
    const { logger, db } = this.dependencies;

    const userSecretDocRef = await db.collection(COLLECTION.SETTINGS).doc(userId);

    const batch = db.batch();

    secrets
      .filter((secret) => secret)
      .forEach((secret) => {
        batch.update(userSecretDocRef, {
          [`keys.${secret}`]: FieldValue.delete(),
        });
      });

    await batch.commit();

    logger.info(`Removed secrets ${secrets.join(', ')}`);
  }

  public async removeUserSecretFromSecretManager(secretPath: string, userId: string) {
    const { logger, db } = this.dependencies;
    try {
      await this.removeSecretFromSecretManager(secretPath);
      await db.collection(COLLECTION.SETTINGS).doc(userId).update({
        pathToKey: null,
      });
    } catch (e) {
      logger.error(`Error when trying remove secret: ${e.message} for user ${userId}`, {
        error: e,
      });
    }
  }

  private async removeSecretFromSecretManager(secretId: string) {
    const { logger } = this.dependencies;

    const stringToArr = secretId.split('/');
    stringToArr.splice(-2, 2);

    await this.client.deleteSecret({
      name: stringToArr.join('/'),
    });

    logger.info(`Removed secret ${secretId}`);
  }

  private async retrieveSecretVersion(versionName: string | null) {
    if (!versionName) {
      this.dependencies.logger.warn('Path is empty');

      return null;
    }
    const [accessResponse] = await this.client.accessSecretVersion({
      name: versionName,
    });

    if (!accessResponse) {
      this.dependencies.logger.warn('Secret is empty');

      return null;
    }

    const responsePayload = accessResponse.payload?.data?.toString();

    return responsePayload ?? null;
  }

  private encrypt(text: string, secretKey: string, iv: Buffer) {
    const cipher = crypto.createCipheriv(this.algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  }

  private decrypt(content: string, secretKey: string, iv: string) {
    const decipher = crypto.createDecipheriv(this.algorithm, secretKey, Buffer.from(iv, 'hex'));

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(content, 'hex')),
      decipher.final(),
    ]);

    return decrpyted.toString();
  }

  private async decryptByKey(
    secretData: { key: string; iv: string; shared?: boolean },
    pathToSecret: string | null
  ) {
    if (!pathToSecret) {
      this.dependencies.logger.warn('Secret key path not passed');

      return null;
    }

    const key = await this.retrieveSecretVersion(pathToSecret);

    if (!key) {
      this.dependencies.logger.warn("Secret key doesn't exist in secret manager");

      return null;
    }

    return this.decrypt(secretData.key, key, secretData.iv);
  }
}
