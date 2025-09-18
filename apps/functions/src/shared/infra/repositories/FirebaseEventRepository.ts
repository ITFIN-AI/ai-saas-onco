import { Firestore } from 'firebase-admin/firestore';
import { BaseRepository } from './BaseRepository';
import { BusinessEvent, COLLECTION } from '@akademiasaas/shared';
import { DiscriminateUnion, EventRepository } from '../../domain/repositories';

interface Dependencies {
  db: Firestore;
}

export class FirebaseEventRepository extends BaseRepository implements EventRepository {
  constructor(private dependencies: Dependencies) {
    super();
  }

  public async saveEvent(event: BusinessEvent) {
    await this.dependencies.db.collection(COLLECTION.BUSINESS_EVENTS).doc(event.eventId).set(event);
  }

  public async getEventsByType<T extends BusinessEvent['eventName']>(
    eventType: T
  ): Promise<DiscriminateUnion<BusinessEvent, 'eventName', T>[]> {
    const res = await this.dependencies.db
      .collection(COLLECTION.BUSINESS_EVENTS)
      .where('eventName', '==', eventType)
      .withConverter(this.getDocumentConverter<BusinessEvent>());

    const snapshot = await res.get();

    return snapshot.docs.map(
      (doc) => doc.data() as DiscriminateUnion<BusinessEvent, 'eventName', T>
    );
  }
}
