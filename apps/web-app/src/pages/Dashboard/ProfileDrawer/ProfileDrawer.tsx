import React, { FunctionComponent } from 'react';
import { Avatar, Badge, Button, Divider, Drawer } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import * as styles from './ProfileDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppStore, getUserInitial, userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {
  isOpen: boolean;
  toggleDrawer: () => void;
}

type Props = OwnProps;

const ProfileDrawer: FunctionComponent<Props> = ({ toggleDrawer, isOpen }) => {
  const { t } = useTranslation('dashboard');
  const { details } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();

  const logoutUser = async () => {
    dispatch(userActions.logOutUser());
  };

  return (
    <Drawer
      title={
        <p className={styles.drawerTitleContainer}>
          <UserOutlined className={styles.icon} />
          <span className={styles.drawerTitle}>{t<string>('profileDrawer.title')}</span>
          <Badge count={0} />
        </p>
      }
      placement="right"
      onClose={toggleDrawer}
      open={isOpen}
      width={350}
      styles={{
        body: { padding: 24, height: 'auto' },
      }}
      className="max-w-full"
    >
      <div className={styles.drawerHeader}>
        <div>
          <Badge dot status="success">
            <Avatar shape="square" size={100} className={styles.avatar}>
              {getUserInitial(`${details?.firstName} ${details?.lastName}`)}
            </Avatar>
          </Badge>
        </div>
        <div className={styles.userData}>
          <h4>
            {details?.firstName || ''} {details?.lastName || ''}
          </h4>
          <p className={styles.email}>{details?.email}</p>
          <Button onClick={logoutUser} danger size="small">
            {t<string>('logout')}
          </Button>
        </div>
      </div>
      <Divider dashed />
    </Drawer>
  );
};

export default ProfileDrawer;
