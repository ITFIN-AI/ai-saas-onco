import React, { Fragment, FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { Alert, Avatar, Badge, Button, Layout, Menu, Select, Space, Tooltip } from 'antd';
import {
  BellOutlined,
  CloseOutlined,
  DollarOutlined,
  HomeOutlined,
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  LockOutlined,
} from '@ant-design/icons';
import * as styles from './Dashboard.module.scss';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useHistory, Redirect } from 'react-router-dom';
import {
  APP_NAME,
  AppStore,
  getUserInitial,
  HELP_PAGE_URL,
  integrationApiTokensActions,
  Language,
  userActions,
} from '@akademiasaas/shared';
import Settings from '~/pages/Settings/Settings';
import NotificationsDrawer from '~/modules/NotificationsDrawer/NotificationsDrawer';
import ProfileDrawer from '~/pages/Dashboard/ProfileDrawer/ProfileDrawer';
import Subscription from '~/pages/Subscription/Subscription';
import dayjs from 'dayjs';
import { getUserIp } from '~/pages/Auth/helpers/checkUserIp';
import { useAppDispatch } from '~/initializeStore';

// Import the new components
import Home from '~/pages/Home/Home';
import Users from '~/pages/Users/Users';
import Reports from '~/pages/Reports/Reports';
import Admin from '~/pages/Admin/Admin';

import logoWhite from '../../assets/icons/logo-white.png';

const { Content, Footer } = Layout;

type MenuItem = {
  name: string;
  path: string;
  component: FunctionComponent;
  icon: React.ReactElement;
  inMenu: boolean;
  exact: boolean;
  onlyForAdmin?: boolean;
  label: string;
};

const routes: MenuItem[] = [
  {
    name: 'home',
    path: '/home',
    component: Home,
    exact: true,
    icon: <HomeOutlined />,
    label: 'menu.home',
    inMenu: true,
  },
  {
    name: 'users',
    path: '/users',
    component: Users,
    exact: false,
    icon: <TeamOutlined />,
    label: 'menu.users',
    inMenu: true,
  },
  {
    name: 'reports',
    path: '/reports',
    component: Reports,
    exact: false,
    icon: <BarChartOutlined />,
    label: 'menu.reports',
    inMenu: true,
  },
  {
    name: 'subscription',
    path: '/subscription',
    component: Subscription,
    exact: false,
    icon: <DollarOutlined />,
    label: 'menu.subscription',
    inMenu: true,
  },
  {
    name: 'settings',
    path: '/settings/:tab?',
    component: Settings,
    exact: false,
    icon: <SettingOutlined />,
    label: 'menu.settings',
    inMenu: true,
  },
  {
    name: 'admin',
    path: '/admin',
    component: Admin,
    exact: false,
    icon: <LockOutlined />,
    label: 'menu.admin',
    inMenu: true,
    onlyForAdmin: true,
  },
];

export const Dashboard = () => {
  const { details, data } = useSelector((store: AppStore) => store.user);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation(['dashboard', 'auth', 'subscription']);
  const [collapsed, onCollapse] = useState(false);
  const trySaveIp = useRef(0);
  const totalNotificationsUnread = useSelector(
    (store: AppStore) => store.notifications.totalUnread
  );
  const [isOpenProfileDrawer, toggleProfileDrawer] = useState(false);
  const [isOpenNotificationsDrawer, toggleNotificationsDrawer] = useState(false);
  const currentPathWithoutNestedRoute = history.location.pathname.split('/').splice(0, 2).join('');
  const [showSubscriptionBanner, hideSubscriptionBanner] = useState(true);

  const appVersion = import.meta.env.APP_VERSION;

  const { isImpersonated } = useSelector((store: AppStore) => store.user);

  useEffect(() => {
    if (details?.lang && details?.lang !== i18n.language) {
      i18n.changeLanguage(details.lang);
    }
  }, [details, i18n]);

  useEffect(() => {
    async function saveIp(uid: string) {
      const ip = await getUserIp();
      await dispatch(userActions.updateUserData({ ip, uid }));
    }

    if (details && !details.ip === undefined) {
      saveIp(details.uid);
    }
    // avoid infinite loop when public API for IPs is not available
    if (details && details.ip === null && trySaveIp.current === 0) {
      saveIp(details.uid);
      trySaveIp.current = 1;
    }
  }, [details, dispatch]);

  useEffect(() => {
    if (data) {
      dispatch(
        userActions.updateUserData({
          uid: data.uid,
        })
      );
    }
  }, [dispatch, data]);

  useEffect(() => {
    return () => {
      dispatch(integrationApiTokensActions.unsubscribeFromApiTokens());
    };
  }, [dispatch]);

  const closeBanner = async (uid?: string) => {
    if (!uid) {
      return;
    }
    dispatch(
      userActions.updateUserData({
        uid,
        onboarding: {
          loginOnlyByLink: true,
          showPasswordBanner: false,
        },
      })
    );
  };

  const handleBannerClick = async () => {
    if (!details) {
      return;
    }
    closeBanner(details.uid);
    history.push('/settings/account');
  };

  const goToSubscription = () => {
    hideSubscriptionBanner(false);
    history.push('/subscription');
  };

  const onLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (data) {
      dispatch(
        userActions.updateUserData({
          uid: data.uid,
          lang: lang as Language,
        })
      );
    }
  };

  const showBannerAboutAddingPaymentMethod = () => {
    if (!details?.subscription || details.subscription.status !== 'trialing') {
      return false;
    }

    if (details.subscription.defaultPaymentMethod) {
      return false;
    }

    const diff = Math.abs(dayjs.unix(details.subscription.currentPeriodEnd).diff(dayjs(), 'day'));
    const DAYS_LIMIT_TO_SHOW_WARNING = 3;

    return diff < DAYS_LIMIT_TO_SHOW_WARNING;
  };

  const nextPlan =
    details?.subscription?.requiresAction?.status === 'reached_limit'
      ? details.subscription.requiresAction.shouldUpgradeTo
      : null;

  const showBannerAboutSubscription =
    details?.subscription?.status &&
    ['unpaid', 'incomplete', 'past_due'].includes(details.subscription.status);

  const systemRole = details?.systemRole;
  const menuToRender = useMemo(() => {
    return routes.filter(
      (item) => !item.onlyForAdmin || (item.onlyForAdmin && systemRole === 'admin')
    );
  }, [systemRole]);

  return (
    <>
      <div className="min-h-full flex">
        <Transition.Root show={collapsed} as={Fragment}>
          <Dialog className="fixed inset-0 flex z-40 lg:hidden" onClose={() => onCollapse(false)}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div
                className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4"
                style={{ backgroundColor: '#001529' }}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 mt-6 mr-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-6 w-6 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => onCollapse(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <CloseOutlined style={{ fontSize: 16, color: '#fff' }} />
                    </button>
                  </div>
                </Transition.Child>
                <div
                  className="flex-shrink-0 flex items-center px-4 cursor-pointer"
                  onClick={() => {
                    history.push('/');
                    onCollapse(false);
                  }}
                >
                  <img className="h-8 w-auto" src={logoWhite} alt="Workflow" />
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav>
                    <div className="space-y-1">
                      <Menu
                        theme="dark"
                        selectedKeys={[currentPathWithoutNestedRoute]}
                        mode="inline"
                        items={menuToRender.map((menuItem) => ({
                          key: menuItem.name,
                          icon: menuItem.icon,
                          label: t<string>(menuItem.label),
                          onClick: () => {
                            history.push(menuItem.path);
                            onCollapse(false);
                          },
                        }))}
                      />
                    </div>
                  </nav>
                </div>
                <Space size={18} direction="vertical" className={styles.footer}>
                  <div>
                    <Select
                      value={details?.lang || i18n.language}
                      onChange={onLangChange}
                      popupMatchSelectWidth={false}
                    >
                      <Select.Option value="en" key="en">
                        <span className="flag-icon flag-icon-gb" />
                        🇺🇸 EN
                      </Select.Option>
                      <Select.Option value="pl" key="pl">
                        <span className="flag-icon flag-icon-pl" />
                        🇵🇱 PL
                      </Select.Option>
                    </Select>
                  </div>
                  <div className="text-xs">
                    <a href={HELP_PAGE_URL} target="_blank" rel="noreferrer">
                      {t<string>('help')}
                    </a>
                  </div>
                  <div className="text-xs xl:text-sm">
                    {t<string>('appVersion')} {appVersion}
                  </div>
                  <div className="text-xs xl:text-sm">
                    &reg; {t<string>('auth:copyright')} {new Date().getFullYear()}
                  </div>
                </Space>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        <div
          className="hidden lg:flex lg:w-56 lg:fixed lg:inset-y-0"
          style={{
            backgroundColor: '#001529',
          }}
        >
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="flex items-center h-16 flex-shrink-0 px-4 cursor-pointer"
              onClick={() => history.push('/')}
            >
              <img className="h-10 w-auto mx-auto" src={logoWhite} alt={APP_NAME} />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 py-4">
                <div className="space-y-1">
                  <Menu
                    theme="dark"
                    selectedKeys={[currentPathWithoutNestedRoute]}
                    mode="inline"
                    items={menuToRender.map((menuItem) => ({
                      key: menuItem.name,
                      icon: menuItem.icon,
                      label: t<string>(menuItem.label),
                      onClick: () => history.push(menuItem.path),
                    }))}
                  />
                </div>
              </nav>
              <Footer
                className={styles.footer}
                style={{
                  backgroundColor: '#001529',
                  color: '#fff',
                }}
              >
                <Space size={18} direction="vertical">
                  <div className="text-xs">
                    <a href={HELP_PAGE_URL} target="_blank" rel="noreferrer">
                      {t<string>('help')}
                    </a>
                  </div>
                  <div className="text-xs">
                    {t<string>('appVersion')} {appVersion}
                  </div>
                  <div className="text-xs">
                    &reg; {t<string>('auth:copyright')} {new Date().getFullYear()}
                  </div>
                </Space>
              </Footer>
            </div>
          </div>
        </div>
        <div className="lg:pl-56 flex flex-col w-0 flex-1">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900 lg:hidden"
              onClick={() => onCollapse(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuOutlined />
            </button>
            <div className="flex-1 px-8 pl-4 lg:pl-8 flex justify-between">
              <div className="justify-end flex-1 sm:flex-0 ml-4 flex sm:items-center lg:ml-6">
                <div className="hidden sm:block">
                  <Select
                    value={details?.lang || i18n.language}
                    onChange={onLangChange}
                    popupMatchSelectWidth={false}
                  >
                    <Select.Option value="en" key="en">
                      <span className="flag-icon flag-icon-gb" />
                      🇺🇸 EN
                    </Select.Option>
                    <Select.Option value="pl" key="pl">
                      <span className="flag-icon flag-icon-pl" />
                      🇵🇱 PL
                    </Select.Option>
                  </Select>
                </div>
                <div
                  className={styles.notifications}
                  role="button"
                  onClick={() => toggleNotificationsDrawer((prev) => !prev)}
                >
                  <Badge count={totalNotificationsUnread} overflowCount={150}>
                    <BellOutlined className={styles.notificationIcon} />
                  </Badge>
                </div>
                <div
                  className={styles.notifications}
                  role="button"
                  onClick={() => toggleProfileDrawer((prev) => !prev)}
                >
                  <Badge count={0} overflowCount={50}>
                    <Tooltip title={t<string>('tooltip.seeProfile')}>
                      <Avatar shape="square" size={36} className={styles.avatar}>
                        {getUserInitial(`${details?.firstName} ${details?.lastName}`)}
                      </Avatar>
                    </Tooltip>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Content>
            <div className={styles.alerts}>
              {nextPlan && (
                <Alert
                  message={t<string>('subscription:limitIsReached', {
                    nextPlan: t<string>(`subscription:plan.${nextPlan}`),
                  })}
                  type="warning"
                  banner
                  closable={false}
                  action={
                    <Button size="small" type="dashed" onClick={goToSubscription}>
                      {t<string>('button.goToSubscriptionSettings')}
                    </Button>
                  }
                />
              )}
              {showBannerAboutAddingPaymentMethod() && showSubscriptionBanner ? (
                <Alert
                  message={t<string>('setPaymentMethod')}
                  type="warning"
                  banner
                  onClose={() => hideSubscriptionBanner(false)}
                  action={
                    <Button size="small" type="dashed" onClick={goToSubscription}>
                      {t<string>('button.goToSubscriptionSettings')}
                    </Button>
                  }
                  closable
                />
              ) : null}
              {isImpersonated ? (
                <Alert
                  message={t<string>('dashboard:impersonation.banner')}
                  type="warning"
                  showIcon
                  banner
                />
              ) : null}
              {details?.onboarding?.showPasswordBanner ? (
                <Alert
                  message={t<string>('setPasswordInfo')}
                  type="info"
                  banner
                  onClose={() => closeBanner(details?.uid)}
                  action={
                    <Button size="small" type="dashed" onClick={handleBannerClick}>
                      {t<string>('button.setPassword')}
                    </Button>
                  }
                  closable
                />
              ) : null}
              {showBannerAboutSubscription && showSubscriptionBanner ? (
                <Alert
                  message={t<string>(`subscriptionWarn.${details?.subscription?.status}`)}
                  type="warning"
                  onClose={() => hideSubscriptionBanner(false)}
                  banner
                  action={
                    <Button size="small" type="dashed" onClick={goToSubscription}>
                      {t<string>('button.goToSubscriptionSettings')}
                    </Button>
                  }
                  closable
                />
              ) : null}
            </div>
            <div className="px-8 py-6 min-h-screen relative bg-[#f0f2f5]">
              <Switch>
                {routes.map((route) => (
                  <Route
                    path={route.path}
                    component={route.component}
                    exact={route.exact}
                    key={route.path}
                  />
                ))}
                <Redirect from="/" exact to="/home" />
              </Switch>
            </div>
          </Content>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={isOpenNotificationsDrawer}
        toggleDrawer={() => toggleNotificationsDrawer(!isOpenNotificationsDrawer)}
      />
      <ProfileDrawer
        isOpen={isOpenProfileDrawer}
        toggleDrawer={() => toggleProfileDrawer((prev) => !prev)}
      />
    </>
  );
};

export default Dashboard;
