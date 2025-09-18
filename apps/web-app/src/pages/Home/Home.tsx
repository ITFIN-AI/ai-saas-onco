import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Avatar } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const Home: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockActivity: ActivityItem[] = [
      {
        id: '1',
        user: 'John Doe',
        action: 'Created a new report',
        time: '2 minutes ago',
        type: 'success',
      },
      {
        id: '2',
        user: 'Jane Smith',
        action: 'Updated user profile',
        time: '10 minutes ago',
        type: 'info',
      },
      {
        id: '3',
        user: 'Robert Brown',
        action: 'Subscription payment failed',
        time: '1 hour ago',
        type: 'error',
      },
      {
        id: '4',
        user: 'Sarah Williams',
        action: 'Invited new team member',
        time: '3 hours ago',
        type: 'info',
      },
      {
        id: '5',
        user: 'Thomas Wilson',
        action: 'Completed onboarding',
        time: '5 hours ago',
        type: 'success',
      },
    ];
    setActivityData(mockActivity);
  }, []);

  return (
    <>
      <Title level={2}>{t('dashboard:home.welcomeMessage')}</Title>
      <Paragraph className="mb-8">{t('dashboard:home.dashboardOverview')}</Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title={t('dashboard:home.stats.totalUsers')}
              value={128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2">
              <Tag color="green">
                <RiseOutlined /> 12% {t('dashboard:home.stats.fromLastMonth')}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title={t('dashboard:home.stats.activeSubscriptions')}
              value={98}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2">
              <Tag color="green">
                <RiseOutlined /> 5% {t('dashboard:home.stats.fromLastMonth')}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title={t('dashboard:home.stats.documentsCreated')}
              value={256}
              prefix={<FileTextOutlined />}
            />
            <div className="mt-2">
              <Tag color="blue">
                <RiseOutlined /> 25% {t('dashboard:home.stats.fromLastMonth')}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title={t('dashboard:home.stats.averageSessionTime')}
              value="15:42"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div className="mt-2">
              <Tag color="red">
                <FallOutlined /> 3% {t('dashboard:home.stats.fromLastMonth')}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={16}>
          <Card title={t('dashboard:home.recentActivity')} bordered={false} className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={activityData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.user}
                    description={
                      <>
                        <span>{item.action}</span>
                        <div>
                          <Tag
                            color={
                              item.type === 'success'
                                ? 'green'
                                : item.type === 'error'
                                  ? 'red'
                                  : item.type === 'warning'
                                    ? 'orange'
                                    : 'blue'
                            }
                          >
                            {t(`common:${item.type}`)}
                          </Tag>
                          <span className="text-gray-400 ml-2">
                            <ClockCircleOutlined className="mr-1" />
                            {item.time}
                          </span>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title={t('dashboard:home.quickActions')} bordered={false} className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: t('dashboard:home.actions.addNewUser'), link: '/users/new' },
                { title: t('dashboard:home.actions.createReport'), link: '/reports/new' },
                { title: t('dashboard:home.actions.manageSubscription'), link: '/subscription' },
                { title: t('dashboard:home.actions.updateProfile'), link: '/settings/profile' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <a href={item.link} className="block w-full">
                    {item.title}
                  </a>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Home;
