import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Card, Grid, Tabs, Typography, TabsProps } from 'antd';
import { TFunction, useTranslation } from 'react-i18next';
import { integrationApiTokensActions, RequestStatus } from '@akademiasaas/shared';
import SetPasswordForm from '~/components/SetPasswordForm/SetPasswordForm';
import SetContactEmail from '~/components/SetContactEmail/SetContactEmail';
import AdditionalIntegrations from '~/pages/Settings/AdditionalIntegrations/AdditionalIntegrations';
import { useAppDispatch } from '~/initializeStore';
import { useLocation } from 'react-router';
import { useHistory, useParams } from 'react-router-dom';

const { Title } = Typography;

interface OwnProps {}

type Props = OwnProps;

const tabs = (t: TFunction<'settings'>): NonNullable<TabsProps['items']> => [
  {
    key: 'integrations',
    label: t<string>('additionalIntegrations.title'),
    children: <AdditionalIntegrations />,
  },
  {
    key: 'account',
    label: t<string>('account.title'),
    children: (
      <>
        <SetContactEmail />
        <SetPasswordForm />
      </>
    ),
  },
];

const Settings: FunctionComponent<Props> = () => {
  const { t } = useTranslation('settings');
  const location = useLocation();
  const history = useHistory();
  const { tab } = useParams<{ tab: string }>();

  const { lg } = Grid.useBreakpoint();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(integrationApiTokensActions.subscribeToApiTokens());
  }, [dispatch]);

  const handleTabChange = useCallback(
    (key: string, query?: URLSearchParams) => {
      history.push({ pathname: `/settings/${key}`, search: query?.toString() });
    },
    [history]
  );

  useEffect(() => {
    if (!tab || tab.includes(':')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- first tab key should be always present
      return handleTabChange(tabs(t)[0].key!);
    }
  }, [tab, handleTabChange, location.search, t]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>{t<string>('title')}</Title>
      </div>
      <Card loading={status === RequestStatus.SUBSCRIBING}>
        <Tabs
          tabPosition={lg ? 'left' : 'top'}
          activeKey={tab}
          onChange={handleTabChange}
          items={tabs(t)}
        />
      </Card>
    </>
  );
};

export default Settings;
