import { Firestore } from 'firebase-admin/firestore';
import { BaseRepository } from './BaseRepository';
import { NotificationsRepository } from '../../domain/repositories';
import {
  COLLECTION,
  GenericNotification,
  NotificationStatus,
  NotificationDto,
  NotificationType,
  splitIntoChunks,
} from '@akademiasaas/shared';
import dayjs from 'dayjs';

interface Dependencies {
  db: Firestore;
}

export class FirebaseNotificationRepository
  extends BaseRepository
  implements NotificationsRepository
{
  constructor(private dependencies: Dependencies) {
    super();
  }

  public async sendAppNotification(
    userId: string,
    notificationPayload: NotificationDto,
    type: NotificationType
  ) {
    const { db } = this.dependencies;
    const ref = db.collection(COLLECTION.USERS).doc(userId).collection(COLLECTION.NOTIFICATIONS);

    const notification: GenericNotification = {
      status: NotificationStatus.UNREAD,
      type,
      timestamp: new Date(),
      eventTimestamp: new Date(),
      eventDate: dayjs().format('YYYY-MM-DD'),
      data: notificationPayload,
    };

    const res = await ref.add(notification);

    return res.id;
  }

  public async broadcastAppNotification(
    userIds: string[],
    notificationPayload: NotificationDto,
    type: NotificationType
  ) {
    const { db } = this.dependencies;

    const notification: GenericNotification = {
      status: NotificationStatus.UNREAD,
      type,
      timestamp: new Date(),
      eventTimestamp: new Date(),
      eventDate: dayjs().format('YYYY-MM-DD'),
      data: notificationPayload,
    };

    const MAX_BATCH_SIZE = 500;

    const userIdChunks = splitIntoChunks(userIds, MAX_BATCH_SIZE);

    for (const chunk of userIdChunks) {
      const batch = db.batch();

      for (const userId of chunk) {
        const notificationRef = db
          .collection(COLLECTION.USERS)
          .doc(userId)
          .collection(COLLECTION.NOTIFICATIONS)
          .doc();

        batch.set(notificationRef, notification);
      }

      await batch.commit();
    }
  }
}
