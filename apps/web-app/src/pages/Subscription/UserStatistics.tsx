import React, { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Descriptions, Divider, Progress, Skeleton, Space } from 'antd';
import {
  RequestStatus,
  statisticsActions,
  AppStore,
  Size,
  SubscriptionPlanDetails,
} from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {
  currentPlanDetails: SubscriptionPlanDetails;
}

type Props = OwnProps;

const UserStatistics: FunctionComponent<Props> = ({ currentPlanDetails }) => {
  const { t } = useTranslation(['subscription']);
  const { creatorStatsStatus, creatorStats, currentMonthStats } = useSelector(
    (store: AppStore) => store.statistics
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(statisticsActions.subscribeToCreatorStats());
  }, [dispatch]);

  const statistics = [
    {
      key: 'statistics.products',
      current: creatorStats?.totalNumberOfProducts ?? 0,
      limit: currentPlanDetails.products,
      percentageUsage: Math.round(
        ((creatorStats?.totalNumberOfProducts ?? 0) / currentPlanDetails.products) * 100
      ),
    },
    {
      key: 'statistics.paid',
      current: creatorStats?.totalNumberOfPaidSubscribers ?? 0,
      limit: currentPlanDetails.clients,
      percentageUsage: Math.round(
        ((creatorStats?.totalNumberOfPaidSubscribers ?? 0) / currentPlanDetails.clients) * 100
      ),
    },
    {
      key: 'statistics.monthlyTransactions',
      current: currentMonthStats?.numberOfTransactions ?? 0,
      limit: currentPlanDetails.monthlyTransactions,
      percentageUsage: Math.round(
        ((currentMonthStats?.numberOfTransactions ?? 0) / currentPlanDetails.monthlyTransactions) *
          100
      ),
    },
    {
      key: 'statistics.uploadLimit',
      current: Size.fromBytes(creatorStats?.totalUploadedBytes ?? 0).gigabytes,
      limit: currentPlanDetails.uploadLimit.gigabytes,
      percentageUsage: Math.round(
        ((creatorStats?.totalUploadedBytes ?? 0) / currentPlanDetails.uploadLimit.bytes) * 100
      ),
    },
  ];

  return (
    <Space style={{ width: '100%' }} direction="vertical" size={12}>
      <Divider orientation="left">{t<string>('statistics.title')}</Divider>
      <Skeleton title={false} active loading={creatorStatsStatus === RequestStatus.SUBSCRIBING}>
        <Descriptions bordered column={1} labelStyle={{ width: 240 }}>
          {statistics.map((stat) => (
            <Descriptions.Item key={stat.key} label={t<string>(stat.key)}>
              {stat.current} / {stat.limit}
              <Progress
                percent={stat.percentageUsage}
                showInfo={false}
                strokeColor={
                  stat.percentageUsage >= 100
                    ? '#ff5959'
                    : stat.percentageUsage >= 80
                      ? '#ff914d'
                      : '#1890ff'
                }
              />
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Skeleton>
    </Space>
  );
};

export default UserStatistics;
