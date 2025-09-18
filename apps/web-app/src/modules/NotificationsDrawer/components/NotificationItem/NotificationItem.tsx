import React, { FunctionComponent } from 'react';
import { Alert, Badge, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  AppStore,
  notificationsActions,
  NotificationStatus,
  Notification,
  NotificationType,
  BroadcastMessageTrigger,
} from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {
  notification: Notification;
  closeDrawer: () => void;
}

type Props = OwnProps;

const NotificationItem: FunctionComponent<Props> = ({ notification, closeDrawer }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const performingAction = useSelector((store: AppStore) => store.notifications.performingAction);
  const dispatch = useAppDispatch();

  const redirectToNotification = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement &&
      notification.data.payload.url
    ) {
      window.open(notification.data.payload.url, '_blank');
    }
    closeDrawer();
  };

  const getAlertType = () => {
    if (notification.type === NotificationType.BroadcastMessage) {
      return 'info';
    }

    return 'warning';
  };

  const getMessage = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement
    ) {
      return notification.data.payload.title;
    }

    return t<string>(`notificationsDrawer.notificationType.${notification.data.action}`);
  };

  const getIcon = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement &&
      notification.data.payload.emojiIcon
    ) {
      return (
        <span className="text-3xl flex h-full mt-3">{notification.data.payload.emojiIcon}</span>
      );
    }

    return undefined; // This will show the default Alert icon
  };

  const getDescription = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement
    ) {
      return (
        <div className="flex flex-col">
          <span className="whitespace-pre-line">{notification.data.payload.message}</span>
          <div className="flex justify-end items-center mt-1">
            <Space size={4}>
              <ClockCircleOutlined />
              <span>{dayjs(notification.timestamp).format('DD.MM HH:mm')}</span>
            </Space>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end items-center">
        <Space size={4}>
          <ClockCircleOutlined />
          <span>{dayjs(notification.timestamp).format('DD.MM HH:mm')}</span>
        </Space>
      </div>
    );
  };

  return (
    <Badge.Ribbon
      text={t<string>('notificationsDrawer.unread')}
      color="#ff4d4f"
      placement="start"
      className="-top-2"
      style={{
        display: notification.status === NotificationStatus.UNREAD ? 'block' : 'none',
      }}
    >
      <div
        onClick={(e) => {
          // Prevent click if clicking on action buttons
          if ((e.target as HTMLElement).closest('.ant-alert-action')) {
            return;
          }
          redirectToNotification();
        }}
        style={{ cursor: 'pointer' }}
      >
        <Alert
          className="mb-6"
          message={getMessage()}
          type={getAlertType()}
          description={getDescription()}
          showIcon
          icon={getIcon()}
          action={
            <Space direction="vertical">
              {notification.status === NotificationStatus.UNREAD && (
                <Button
                  size="small"
                  loading={performingAction?.notificationId === notification.id}
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(notificationsActions.markAsRead(notification.id));
                  }}
                />
              )}
              <Button
                size="small"
                icon={<RightOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  redirectToNotification();
                }}
              />
            </Space>
          }
        />
      </div>
    </Badge.Ribbon>
  );
};

export default NotificationItem;
