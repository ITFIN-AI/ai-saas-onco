import {
  SubscriptionNotification,
  SubscriptionNotificationDto,
} from './SubscriptionNotificationDocument';
import { BroadcastNotification, BroadcastNotificationDto } from './BroadcastNotificationDocument';
export * from './NotificationCommon';
export * from './SubscriptionNotificationDocument';
export * from './BroadcastNotificationDocument';

export type Notification = SubscriptionNotification | BroadcastNotification;
export type NotificationDto = SubscriptionNotificationDto | BroadcastNotificationDto;
