import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlan, getPlanDetails } from '@akademiasaas/shared';
import {
  CheckOutlined,
  UserOutlined,
  FileOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

interface FeaturesListProps {
  selectedTier: SubscriptionPlan;
}

export const FeaturesList: FC<FeaturesListProps> = ({ selectedTier }) => {
  const { t } = useTranslation(['subscription']);
  const selectedTierDetails = getPlanDetails(selectedTier);

  const features = [
    {
      icon: <UserOutlined />,
      text: `${selectedTierDetails.clients} ${t('plan.paid')}`,
      color: '#1890ff',
    },
    {
      icon: <FileOutlined />,
      text: `${selectedTierDetails.products} ${t('plan.products', { count: selectedTierDetails.products })}`,
      color: '#52c41a',
    },
    {
      icon: <CloudUploadOutlined />,
      text: `${selectedTierDetails.uploadLimit.gigabytes} ${t('plan.uploadLimit')}`,
      color: '#722ed1',
    },
    {
      icon: <BarChartOutlined />,
      text: `${selectedTierDetails.monthlyTransactions} ${t('plan.monthlyTransactions')}`,
      color: '#fa8c16',
    },
  ];

  return (
    <ul className="text-base leading-loose divide-y divide-gray-100 w-full">
      {features.map(({ icon, text, color }) => (
        <li
          key={text}
          className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50 px-2 rounded-md"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="flex items-center justify-center" style={{ color }}>
              {icon}
            </span>
          </div>
          <span className="text-gray-700">{text}</span>
          <CheckOutlined className="ml-auto text-green-500" />
        </li>
      ))}
    </ul>
  );
};
