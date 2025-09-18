import React, { FunctionComponent } from 'react';
import { Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import * as styles from './Stepper.module.scss';

const { Step } = Steps;

interface OwnProps {
  current: number;
}

type Props = OwnProps;

const renderCustomDot = (dot: React.ReactElement) => <span>{dot}</span>;

const Stepper: FunctionComponent<Props> = ({ current = 0 }) => {
  const { t } = useTranslation('checkout');

  return (
    <Steps current={current} progressDot={renderCustomDot} size="small" className={styles.stepper}>
      <Step title={t<string>('stepper.invoiceData')} />
      <Step title={t<string>('stepper.payment')} />
      <Step title={t<string>('stepper.access')} />
    </Steps>
  );
};

export default Stepper;
