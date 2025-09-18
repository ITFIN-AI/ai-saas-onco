import { Firestore } from 'firebase-admin/firestore';
import { COLLECTION } from 'shared/collectionNames';
import { DOCUMENT } from 'shared/documentNames';
import { BaseRepository } from './BaseRepository';
import { ApiTokenDocument } from '@akademiasaas/shared';
import { ApiTokensRepository } from 'shared/domain/repositories';

interface Dependencies {
  db: Firestore;
}

export class FirebaseApiTokensRepository extends BaseRepository implements ApiTokensRepository {
  private db: Firestore;
  constructor(dependencies: Dependencies) {
    super();
    this.db = dependencies.db;
  }

  public async findApiTokenById(uid: string, tokenId: string): Promise<ApiTokenDocument | null> {
    const ref = this.db
      .collection(COLLECTION.USERS)
      .doc(uid)
      .collection(COLLECTION.SETTINGS)
      .doc(DOCUMENT.INTEGRATION_CONFIG)
      .collection(COLLECTION.API_TOKENS)
      .doc(tokenId)
      .withConverter(this.getDocumentConverter<ApiTokenDocument>());

    const doc = await ref.get();

    return doc.data() || null;
  }

  public async saveApiToken(uid: string, token: ApiTokenDocument): Promise<void> {
    const ref = this.db
      .collection(COLLECTION.USERS)
      .doc(uid)
      .collection(COLLECTION.SETTINGS)
      .doc(DOCUMENT.INTEGRATION_CONFIG)
      .collection(COLLECTION.API_TOKENS)
      .doc(token.id);

    await ref.set(token);
  }

  public async deleteApiToken(uid: string, tokenId: string): Promise<void> {
    const ref = this.db
      .collection(COLLECTION.USERS)
      .doc(uid)
      .collection(COLLECTION.SETTINGS)
      .doc(DOCUMENT.INTEGRATION_CONFIG)
      .collection(COLLECTION.API_TOKENS)
      .doc(tokenId);

    await ref.delete();
  }
}
