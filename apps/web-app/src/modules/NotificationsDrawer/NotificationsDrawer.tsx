import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, Badge, Button, Drawer, List, message, Switch } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import * as styles from './NotificationsDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import NotificationItem from './components/NotificationItem/NotificationItem';
import { AppStore, notificationsActions, RequestStatus } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {
  isOpen: boolean;
  toggleDrawer: () => void;
}

type Props = OwnProps;

const NotificationsDrawer: FunctionComponent<Props> = ({ toggleDrawer, isOpen }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const dispatch = useAppDispatch();

  const { totalUnread, listStatus, notifications, filter } = useSelector(
    (store: AppStore) => store.notifications
  );

  const [checked, toggleChecked] = useState(filter === 'unread');

  useEffect(() => {
    dispatch(notificationsActions.subscribeToNotifications());

    return () => {
      dispatch(notificationsActions.unsubscribeFromNotifications());
    };
  }, [dispatch]);

  useEffect(() => {
    const checkedState = checked ? 'unread' : 'all';
    if (checkedState !== filter) {
      dispatch(notificationsActions.subscribeToNotifications(checked));
    }
  }, [dispatch, checked, filter]);

  const markAllAsRead = async () => {
    message.loading(t<string>('common:messages.loading.default'));
    try {
      await dispatch(notificationsActions.markAllAsRead()).unwrap();
      message.destroy();
      message.success(t<string>('common:messages.success.default'));
    } catch (e) {
      message.destroy();
      message.error(t<string>('common:messages.error.default'));
    }
  };

  const renderContent = () => {
    if (listStatus === RequestStatus.FAILED) {
      return (
        <div className="my-2">
          <Alert type="error" showIcon message={t<string>('errors.cannotFetchNotificationsList')} />
        </div>
      );
    }

    return (
      <>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          loading={listStatus === RequestStatus.SUBSCRIBING}
          renderItem={(notification) => (
            <NotificationItem notification={notification} closeDrawer={toggleDrawer} />
          )}
          locale={{ emptyText: t<string>('notificationsDrawer.emptyState') }}
        />
      </>
    );
  };

  return (
    <Drawer
      title={
        <div>
          <p className={styles.drawerTitleContainer}>
            <BellOutlined className={styles.icon} />
            <span className={styles.drawerTitle}>{t<string>('notifications')}</span>
            <Badge count={totalUnread} overflowCount={150} />
          </p>
          <div className="flex flex-col lg:flex-row justify-between items-end">
            <div className={styles.switch}>
              <Switch
                size="small"
                checked={checked}
                onChange={(checked) => toggleChecked(checked)}
              />
              <span className={styles.switchLabel}>
                {t<string>('notificationsDrawer.showOnlyUnread')}
              </span>
            </div>
            {totalUnread > 0 && (
              <Button size="small" className="mt-4" onClick={markAllAsRead}>
                {t<string>('notificationsDrawer.markAllAsRead')}
              </Button>
            )}
          </div>
        </div>
      }
      placement="right"
      onClose={toggleDrawer}
      open={isOpen}
      width={600}
      styles={{
        body: { padding: 12, height: 'auto' },
      }}
      className="max-w-full"
    >
      {renderContent()}
    </Drawer>
  );
};

export default NotificationsDrawer;
