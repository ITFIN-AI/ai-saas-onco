import { COLLECTION, DOCUMENT } from '@akademiasaas/shared';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { BaseRepository } from './BaseRepository';
import { CreatorStatsDocument, AppStatsDocument } from '@akademiasaas/shared';

interface Dependencies {
  db: Firestore;
}

export class FirebaseReportsRepository extends BaseRepository {
  constructor(private dependencies: Dependencies) {
    super();
  }

  public async updateAppStatistics(data: Partial<AppStatsDocument>) {
    const ref = this.dependencies.db.collection(COLLECTION.REPORTS).doc(DOCUMENT.APP_STATS);

    await ref.update(data);
  }

  public async updateCreatorStatistics(creatorId: string, data: Partial<CreatorStatsDocument>) {
    const ref = this.dependencies.db.collection(COLLECTION.REPORTS).doc(creatorId);

    await ref.update(data);
  }

  public async upsertAppStatistics(data: Partial<AppStatsDocument>) {
    const ref = this.dependencies.db.collection(COLLECTION.REPORTS).doc(DOCUMENT.APP_STATS);

    await this.dependencies.db.runTransaction(async (transaction) => {
      const stats = await transaction.get(ref);

      if (!stats.exists) {
        return transaction.set(ref, {
          totalNumberOfUsers: 0,
          totalNumberOfCreators: 0,
          totalNumberOfSubscribers: 0,
          totalNumberOfFreeSubscribers: 0,
          totalNumberOfPaidSubscribers: 0,
          totalNumberOfImportedFreeSubscribers: 0,
          totalNumberOfImportedPaidSubscribers: 0,
          totalNumberOfArchivedSubscribers: 0,
          totalNumberOfMailings: 0,
          totalNumberOfFreeMailings: 0,
          totalNumberOfPaidMailings: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        } as AppStatsDocument);
      }

      const previousDataDocument = stats.data() as AppStatsDocument;

      return transaction.update(ref, {
        updatedAt: new Date(),
        totalNumberOfUsers: this.updateNumberField(
          previousDataDocument.totalNumberOfUsers,
          data.totalNumberOfUsers
        ),
        totalNumberOfFreeSubscribers: this.updateNumberField(
          previousDataDocument.totalNumberOfFreeSubscribers,
          data.totalNumberOfFreeSubscribers
        ),
        totalNumberOfPaidSubscribers: this.updateNumberField(
          previousDataDocument.totalNumberOfPaidSubscribers,
          data.totalNumberOfPaidSubscribers
        ),
        totalNumberOfImportedFreeSubscribers: this.updateNumberField(
          previousDataDocument.totalNumberOfImportedFreeSubscribers,
          data.totalNumberOfImportedFreeSubscribers
        ),
        totalNumberOfImportedPaidSubscribers: this.updateNumberField(
          previousDataDocument.totalNumberOfImportedPaidSubscribers,
          data.totalNumberOfImportedPaidSubscribers
        ),
        totalNumberOfArchivedSubscribers: this.updateNumberField(
          previousDataDocument.totalNumberOfArchivedSubscribers,
          data.totalNumberOfArchivedSubscribers
        ),
        totalNumberOfMailings: this.updateNumberField(
          previousDataDocument.totalNumberOfMailings,
          data.totalNumberOfMailings
        ),
        totalNumberOfFreeMailings: this.updateNumberField(
          previousDataDocument.totalNumberOfFreeMailings,
          data.totalNumberOfFreeMailings
        ),
        totalNumberOfPaidMailings: this.updateNumberField(
          previousDataDocument.totalNumberOfPaidMailings,
          data.totalNumberOfPaidMailings
        ),
      });
    });
  }

  private updateNumberField(previousValue?: number, newValue?: number) {
    return newValue
      ? previousValue === undefined
        ? newValue
        : FieldValue.increment(newValue)
      : (previousValue ?? 0);
  }
}
