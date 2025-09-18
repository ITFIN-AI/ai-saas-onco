import { RequestStatus } from '../../../enums/requestStatus';
import { Notification } from '../../../models/documents/notifications';
export const NOTIFICATIONS_REDUCER_NAME = 'Notifications';

export enum NotificationAction {
  MarkAsRead = 'MARK_AS_READ',
}

export interface NotificationsReducer {
  notifications: Notification[];
  listStatus: null | RequestStatus;
  totalUnread: number;
  filter: 'all' | 'unread';
  performingAction: null | {
    action: NotificationAction;
    notificationId?: string;
  };
}
