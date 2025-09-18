import React, { FunctionComponent } from 'react';
import * as styles from './AdditonalIntegrations.module.scss';
import { useSelector } from 'react-redux';
import { AppStore } from '@akademiasaas/shared';
import { ApiIntegration } from '~/pages/Settings/AdditionalIntegrations/integration';

interface OwnProps {}

type Props = OwnProps;

const AdditionalIntegrations: FunctionComponent<Props> = () => {
  const { data: tokensData } = useSelector((state: AppStore) => state.integrationApiTokens);

  return (
    <div className={styles.container}>
      <ApiIntegration tokens={tokensData} />
    </div>
  );
};

export default AdditionalIntegrations;
