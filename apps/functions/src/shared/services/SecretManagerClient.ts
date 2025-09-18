import { UserSettingsDocument } from '@akademiasaas/shared';

export interface SecretManagerClient {
  createSecret: (payload: string, userId: string) => Promise<string>;
  createSecrets: (payload: string[], userId: string) => Promise<string[]>;
  decryptSecret: (key: string, userId: string) => Promise<string | null>;
  decryptSecrets: (keys: string[], userId: string) => Promise<string[] | null>;
  removeSecrets: (keys: string[], userId: string) => Promise<void>;
  createSharedSecret: (payload: string, userId: string) => Promise<string>;
  getUserSettings: (userId: string) => Promise<null | UserSettingsDocument>;
  removeUserSecretFromSecretManager: (secretPath: string, userId: string) => Promise<void>;
}
