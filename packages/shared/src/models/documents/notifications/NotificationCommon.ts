export enum SubscriptionNotificationTrigger {
  PaymentRequiredAction = 'payment_required_action',
  SubscriptionEnd = 'subscription_end',
}

export enum BroadcastMessageTrigger {
  Announcement = 'announcement',
}

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export enum NotificationType {
  SubscriptionInfo = 'subscription_info',
  BroadcastMessage = 'broadcast_message',
}

export type TypeTriggerMap = {
  [NotificationType.SubscriptionInfo]: SubscriptionNotificationTrigger;
  [NotificationType.BroadcastMessage]: BroadcastMessageTrigger;
};

export interface NotificationDocument<T = object> {
  type: NotificationType;
  eventDate: string;
  data?: T;
  status: NotificationStatus;
  timestamp: Date;
  eventTimestamp: Date;
  connectedClientEmail?: string | null;
}

export interface GenericNotification<
  Type extends NotificationType = NotificationType,
  Trigger extends TypeTriggerMap[Type] = TypeTriggerMap[Type],
  Data = { [key: string]: any },
> extends NotificationDocument {
  type: Type;
  data: {
    action: Trigger;
    payload: Data;
  };
}

export type WithId<T extends object> = T & { id: string };
