import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tabs,
  DatePicker,
  Button,
  Table,
  Select,
  Space,
  Statistic,
  Progress,
  TabsProps,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation, TFunction } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import { Line, Column, Pie } from '@ant-design/charts';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for charts - In real application this would come from API
const userEngagementData = [
  { key: '1', day: 'Monday', usersCount: 120, sessionTime: 15.2, pagesViewed: 8.5 },
  { key: '2', day: 'Tuesday', usersCount: 132, sessionTime: 17.8, pagesViewed: 10.2 },
  { key: '3', day: 'Wednesday', usersCount: 101, sessionTime: 14.3, pagesViewed: 7.8 },
  { key: '4', day: 'Thursday', usersCount: 134, sessionTime: 16.9, pagesViewed: 9.6 },
  { key: '5', day: 'Friday', usersCount: 90, sessionTime: 12.1, pagesViewed: 6.3 },
  { key: '6', day: 'Saturday', usersCount: 85, sessionTime: 10.5, pagesViewed: 5.2 },
  { key: '7', day: 'Sunday', usersCount: 93, sessionTime: 11.2, pagesViewed: 5.8 },
];

// Prepare user engagement data for charts
const userEngagementChartData = [
  ...userEngagementData.map((item) => ({ day: item.day, value: item.usersCount, type: 'Users' })),
  ...userEngagementData.map((item) => ({
    day: item.day,
    value: item.sessionTime,
    type: 'Session Time (mins)',
  })),
  ...userEngagementData.map((item) => ({
    day: item.day,
    value: item.pagesViewed,
    type: 'Pages Viewed',
  })),
];

const revenueData = [
  { key: '1', month: 'January', revenue: 12500, users: 150, averageRevenue: 83.33 },
  { key: '2', month: 'February', revenue: 15000, users: 175, averageRevenue: 85.71 },
  { key: '3', month: 'March', revenue: 18500, users: 200, averageRevenue: 92.5 },
  { key: '4', month: 'April', revenue: 22000, users: 220, averageRevenue: 100.0 },
  { key: '5', month: 'May', revenue: 24500, users: 240, averageRevenue: 102.08 },
  { key: '6', month: 'June', revenue: 21000, users: 210, averageRevenue: 100.0 },
];

const topUsersByActivity = [
  {
    key: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    sessions: 45,
    averageTime: '25:42',
    documentsCreated: 28,
  },
  {
    key: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    sessions: 38,
    averageTime: '20:15',
    documentsCreated: 22,
  },
  {
    key: '3',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    sessions: 32,
    averageTime: '18:30',
    documentsCreated: 18,
  },
  {
    key: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    sessions: 30,
    averageTime: '22:10',
    documentsCreated: 15,
  },
  {
    key: '5',
    name: 'Thomas Wilson',
    email: 'thomas.wilson@example.com',
    sessions: 25,
    averageTime: '15:45',
    documentsCreated: 12,
  },
];

const topUsersChartData = topUsersByActivity.map((user) => ({
  type: user.name,
  value: user.sessions,
}));

// Main component
const Reports: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [_dateRange_, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('userActivity');

  const handleDateRangeChange = (
    dates: RangePickerProps['value'],
    _dateStrings: [string, string]
  ) => {
    setDateRange(dates as [Dayjs, Dayjs] | null);
  };

  const handleReportTypeChange = (value: string) => {
    setSelectedReport(value);
  };

  const handleDownloadReport = () => {
    // In a real application, this would trigger a report download
    // eslint-disable-next-line no-console -- console.log is used for demonstration purposes
    console.log('Downloading report:', selectedReport);
  };

  // Define interfaces for table data types
  interface UserEngagementData {
    day: string;
    usersCount: number;
    sessionTime: number;
    pagesViewed: number;
    key: string;
  }

  interface RevenueData {
    month: string;
    revenue: number;
    users: number;
    averageRevenue: number;
    key: string;
  }

  interface TopUserData {
    name: string;
    email: string;
    sessions: number;
    averageTime: string;
    documentsCreated: number;
    key: string;
  }

  // User engagement columns
  const userEngagementColumns = [
    {
      title: t('dashboard:reports.userEngagement.day', 'Day'),
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: t('dashboard:reports.userEngagement.usersCount', 'Users'),
      dataIndex: 'usersCount',
      key: 'usersCount',
      sorter: (a: UserEngagementData, b: UserEngagementData) => a.usersCount - b.usersCount,
    },
    {
      title: t('dashboard:reports.userEngagement.sessionTime', 'Avg. Session Time (mins)'),
      dataIndex: 'sessionTime',
      key: 'sessionTime',
      sorter: (a: UserEngagementData, b: UserEngagementData) => a.sessionTime - b.sessionTime,
    },
    {
      title: t('dashboard:reports.userEngagement.pagesViewed', 'Avg. Pages Viewed'),
      dataIndex: 'pagesViewed',
      key: 'pagesViewed',
      sorter: (a: UserEngagementData, b: UserEngagementData) => a.pagesViewed - b.pagesViewed,
    },
  ];

  // Revenue columns
  const revenueColumns = [
    {
      title: t('dashboard:reports.revenue.month', 'Month'),
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: t('dashboard:reports.revenue.revenue', 'Revenue ($)'),
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: RevenueData, b: RevenueData) => a.revenue - b.revenue,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: t('dashboard:reports.revenue.users', 'Users'),
      dataIndex: 'users',
      key: 'users',
      sorter: (a: RevenueData, b: RevenueData) => a.users - b.users,
    },
    {
      title: t('dashboard:reports.revenue.averageRevenue', 'Avg. Revenue per User ($)'),
      dataIndex: 'averageRevenue',
      key: 'averageRevenue',
      sorter: (a: RevenueData, b: RevenueData) => a.averageRevenue - b.averageRevenue,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  // Top users columns
  const topUsersColumns = [
    {
      title: t('common:name', 'Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common:email', 'Email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('dashboard:reports.topUsers.sessions', 'Sessions'),
      dataIndex: 'sessions',
      key: 'sessions',
      sorter: (a: TopUserData, b: TopUserData) => a.sessions - b.sessions,
    },
    {
      title: t('dashboard:reports.topUsers.averageTime', 'Avg. Session Time'),
      dataIndex: 'averageTime',
      key: 'averageTime',
    },
    {
      title: t('dashboard:reports.topUsers.documentsCreated', 'Documents Created'),
      dataIndex: 'documentsCreated',
      key: 'documentsCreated',
      sorter: (a: TopUserData, b: TopUserData) => a.documentsCreated - b.documentsCreated,
    },
  ];

  const tabs = (t: TFunction<'dashboard'>): NonNullable<TabsProps['items']> => [
    {
      key: 'userEngagement',
      label: (
        <span>
          <LineChartOutlined />
          {t('dashboard:reports.tabs.userEngagement', 'User Engagement')}
        </span>
      ),
      children: (
        <>
          <div className="mb-4 flex justify-between items-center">
            <Title level={4}>
              {t('dashboard:reports.userEngagement.title', 'Weekly User Activity')}
            </Title>
            <Button icon={<FilterOutlined />}>{t('common:filter', 'Filter')}</Button>
          </div>

          {/* User Engagement Chart */}
          <Card className="mb-4" bordered={false}>
            <div style={{ height: 400 }}>
              <Line data={userEngagementChartData} xField="day" yField="value" seriesField="type" />
            </div>
          </Card>

          <Table
            dataSource={userEngagementData}
            columns={userEngagementColumns}
            pagination={false}
          />
        </>
      ),
    },
    {
      key: 'revenueAnalysis',
      label: (
        <span>
          <BarChartOutlined />
          {t('dashboard:reports.tabs.revenueAnalysis', 'Revenue Analysis')}
        </span>
      ),
      children: (
        <>
          <div className="mb-4 flex justify-between items-center">
            <Title level={4}>{t('dashboard:reports.revenue.title', 'Monthly Revenue')}</Title>
            <Button icon={<FilterOutlined />}>{t('common:filter', 'Filter')}</Button>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-4" bordered={false}>
            <div style={{ height: 400 }}>
              <Column data={revenueData} xField="month" yField="revenue" />
            </div>
          </Card>

          <Table dataSource={revenueData} columns={revenueColumns} pagination={false} />
        </>
      ),
    },
    {
      key: 'topUsers',
      label: (
        <span>
          <PieChartOutlined />
          {t('dashboard:reports.tabs.topUsers', 'Top Users')}
        </span>
      ),
      children: (
        <>
          <div className="mb-4 flex justify-between items-center">
            <Title level={4}>{t('dashboard:reports.topUsers.title', 'Most Active Users')}</Title>
            <Button icon={<FilterOutlined />}>{t('common:filter', 'Filter')}</Button>
          </div>

          <Row gutter={[16, 16]} className="mb-4">
            {/* Sessions Distribution Pie Chart */}
            <Col xs={24} lg={12}>
              <Card bordered={false} title="Sessions Distribution">
                <div style={{ height: 350 }}>
                  <Pie data={topUsersChartData} angleField="value" colorField="type" />
                </div>
              </Card>
            </Col>

            {/* Documents Created Column Chart */}
            <Col xs={24} lg={12}>
              <Card bordered={false} title="Documents Created by User">
                <div style={{ height: 350 }}>
                  <Column data={topUsersByActivity} xField="name" yField="documentsCreated" />
                </div>
              </Card>
            </Col>
          </Row>

          <Table dataSource={topUsersByActivity} columns={topUsersColumns} pagination={false} />
        </>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Title level={2}>{t('dashboard:reports.title', 'Analytics & Reports')}</Title>
          <Paragraph>
            {t(
              'dashboard:reports.description',
              'View detailed analytics and generate reports for your application usage.'
            )}
          </Paragraph>
        </div>
        <Space className="mt-4 md:mt-0">
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            defaultValue="userActivity"
            style={{ width: 180 }}
            onChange={handleReportTypeChange}
          >
            <Option value="userActivity">
              {t('dashboard:reports.reportTypes.userActivity', 'User Activity')}
            </Option>
            <Option value="revenue">{t('dashboard:reports.reportTypes.revenue', 'Revenue')}</Option>
            <Option value="documents">
              {t('dashboard:reports.reportTypes.documents', 'Documents')}
            </Option>
          </Select>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadReport}>
            {t('dashboard:reports.actions.download', 'Download')}
          </Button>
        </Space>
      </div>

      {/* Key metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('dashboard:reports.metrics.totalUsers', 'Total Users')}
              value={1253}
              prefix={<UserOutlined />}
            />
            <div className="mt-2">
              <Progress percent={78} showInfo={false} status="active" />
              <div className="text-xs text-gray-500 mt-1">
                78% {t('dashboard:reports.metrics.yearlyGrowth', 'yearly growth')}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('dashboard:reports.metrics.totalRevenue', 'Total Revenue')}
              value={113500}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
            <div className="mt-2">
              <Progress percent={65} showInfo={false} status="active" />
              <div className="text-xs text-gray-500 mt-1">
                65% {t('dashboard:reports.metrics.targetReached', 'of yearly target')}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('dashboard:reports.metrics.documentsCreated', 'Documents Created')}
              value={5823}
              prefix={<FileTextOutlined />}
            />
            <div className="mt-2">
              <Progress percent={92} showInfo={false} status="active" />
              <div className="text-xs text-gray-500 mt-1">
                92% {t('dashboard:reports.metrics.yearlyGrowth', 'yearly growth')}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('dashboard:reports.metrics.avgSessionTime', 'Avg. Session Time')}
              value="18:45"
              prefix={<ClockCircleOutlined />}
            />
            <div className="mt-2">
              <Progress percent={52} showInfo={false} status="active" />
              <div className="text-xs text-gray-500 mt-1">
                52% {t('dashboard:reports.metrics.improvement', 'improvement from last year')}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs defaultActiveKey="userEngagement" items={tabs(t)} />
      </Card>
    </>
  );
};

export default Reports;
