import {
  BroadcastMessageTrigger,
  GenericNotification,
  NotificationType,
  WithId,
} from './NotificationCommon';

export interface AnnouncementMessagePayload {
  title: string;
  message: string;
  url?: string;
  emojiIcon?: string;
}

export type AnnouncementMessageNotificationDto = {
  action: BroadcastMessageTrigger.Announcement;
  payload: AnnouncementMessagePayload;
};

export type BroadcastNotificationDto = AnnouncementMessageNotificationDto;

export type AnnouncementBroadcastNotification = GenericNotification<
  NotificationType.BroadcastMessage,
  BroadcastMessageTrigger.Announcement,
  AnnouncementMessagePayload
>;

export type BroadcastNotification = WithId<AnnouncementBroadcastNotification>;
