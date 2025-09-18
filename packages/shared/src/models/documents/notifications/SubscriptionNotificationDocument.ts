import {
  GenericNotification,
  NotificationType,
  SubscriptionNotificationTrigger,
  WithId,
} from './NotificationCommon';
import { RequiresAction } from '../OrderDocument';

export interface SubscriptionPaymentRequiredActionPayload {
  productId: string;
  productName: string;
  authorName: string;
  authorEmail: string;
  authorId: string;
  action: RequiresAction;
}

export interface SubscriptionEndPayload {
  productId: string;
  productName: string;
  authorName: string;
  authorEmail: string;
  authorId: string;
  endAt: number;
}

// notifications DTO
export type SubscriptionPaymentRequiredActionNotificationDto = {
  action: SubscriptionNotificationTrigger.PaymentRequiredAction;
  payload: SubscriptionPaymentRequiredActionPayload;
};

export type SubscriptionEndNotificationDto = {
  action: SubscriptionNotificationTrigger.SubscriptionEnd;
  payload: SubscriptionEndPayload;
};

// notifications
export type SubscriptionPaymentRequiredActionNotification = GenericNotification<
  NotificationType.SubscriptionInfo,
  SubscriptionNotificationTrigger.PaymentRequiredAction,
  SubscriptionPaymentRequiredActionPayload
>;

export type SubscriptionEndNotification = GenericNotification<
  NotificationType.SubscriptionInfo,
  SubscriptionNotificationTrigger.SubscriptionEnd,
  SubscriptionEndPayload
>;

export type SubscriptionNotificationDto =
  | SubscriptionPaymentRequiredActionNotificationDto
  | SubscriptionEndNotificationDto;

export type SubscriptionNotification =
  | WithId<SubscriptionPaymentRequiredActionNotification>
  | WithId<SubscriptionEndNotification>;
