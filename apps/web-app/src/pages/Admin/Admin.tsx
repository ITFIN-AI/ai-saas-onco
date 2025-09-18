import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Card, Grid, Tabs, Typography } from 'antd';
import { TFunction, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useHistory, useParams } from 'react-router-dom';
import BroadcastMessageForm from './components/BroadcastMessageForm';

const { Title } = Typography;

interface OwnProps {}

type Props = OwnProps;

const tabs = (t: TFunction<'admin'>) => [
  {
    key: 'notifications',
    label: t<string>('tabs.notifications'),
    children: <BroadcastMessageForm />,
  },
  {
    key: 'users',
    label: t<string>('tabs.users'),
    children: <div>{/* Users management component will go here */}</div>,
  },
];

const Admin: FunctionComponent<Props> = () => {
  const { t } = useTranslation('admin');
  const location = useLocation();
  const history = useHistory();
  const { tab } = useParams<{ tab: string }>();

  const { lg } = Grid.useBreakpoint();

  const handleTabChange = useCallback(
    (key: string, query?: URLSearchParams) => {
      history.push({ pathname: `/admin/${key}`, search: query?.toString() });
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
      <Card>
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

export default Admin;
