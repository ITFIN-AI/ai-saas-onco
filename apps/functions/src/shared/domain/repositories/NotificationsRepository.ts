import { NotificationDto, NotificationType } from '@akademiasaas/shared';

export type UserId = string;
export type NotificationId = string;

export interface NotificationsRepository {
  sendAppNotification: (
    userId: string,
    notificationPayload: NotificationDto,
    type: NotificationType
  ) => Promise<string>;

  broadcastAppNotification: (
    userIds: string[],
    notificationPayload: NotificationDto,
    type: NotificationType
  ) => Promise<void>;
}
