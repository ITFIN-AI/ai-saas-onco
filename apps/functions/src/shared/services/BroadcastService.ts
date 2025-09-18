import {
  AnnouncementMessageNotificationDto,
  BroadcastMessageTrigger,
  NotificationType,
} from '@akademiasaas/shared';
import { NotificationsRepository, UsersRepository } from 'shared/domain/repositories';
interface Dependencies {
  notificationsRepository: NotificationsRepository;
  usersRepository: UsersRepository;
}

export class BroadcastService {
  constructor(private dependencies: Dependencies) {}

  public async broadcastAnnouncement(
    title: string,
    message: string,
    options?: {
      url?: string;
      emojiIcon?: string;
      targetUserIds?: string[];
    }
  ): Promise<void> {
    const { notificationsRepository, usersRepository } = this.dependencies;

    const notificationPayload: AnnouncementMessageNotificationDto = {
      action: BroadcastMessageTrigger.Announcement,
      payload: {
        title,
        message,
        url: options?.url,
        emojiIcon: options?.emojiIcon,
      },
    };

    if (options?.targetUserIds !== undefined) {
      await notificationsRepository.broadcastAppNotification(
        options.targetUserIds,
        notificationPayload,
        NotificationType.BroadcastMessage
      );

      return;
    }

    const userIds = await usersRepository.getAllUserIds();

    await notificationsRepository.broadcastAppNotification(
      userIds,
      notificationPayload,
      NotificationType.BroadcastMessage
    );
  }
}
