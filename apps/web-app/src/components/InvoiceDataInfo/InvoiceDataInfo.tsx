import React, { FunctionComponent } from 'react';
import { COUNTRIES, ClientInvoiceData } from '@akademiasaas/shared';
import { Alert, Descriptions, DescriptionsProps, Grid } from 'antd';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  invoiceData?: ClientInvoiceData;
  withTitle?: boolean;
  withAlert?: boolean;
}

type Props = OwnProps;

const InvoiceDataInfo: FunctionComponent<Props> = ({
  invoiceData,
  withTitle = true,
  withAlert = false,
}) => {
  const { t } = useTranslation('subscription');
  const { lg } = Grid.useBreakpoint();

  if (!invoiceData && withAlert) {
    return <Alert showIcon type="warning" message={t<string>('setInvoiceDataAlert')} />;
  }

  const items: DescriptionsProps['items'] = !invoiceData
    ? [
        {
          key: 'no-data',
          style: { textAlign: 'center' },
          span: 3,
          children: <p>{t<string>('common:noData')}</p>,
        },
      ]
    : [
        {
          key: '1',
          span: 3,
          label: t('invoice.email'),
          children: <p>{invoiceData.email || '-'}</p>,
        },
        {
          key: '2',
          span: 3,
          label: t('invoice.firstName'),
          children: <p>{invoiceData.firstName || '-'}</p>,
        },
        {
          key: '3',
          span: 3,
          label: t('invoice.lastName'),
          children: <p>{invoiceData.lastName || '-'}</p>,
        },
        ...(invoiceData.companyName !== ''
          ? [
              {
                key: '4',
                span: 3,
                label: t('invoice.companyName'),
                children: <p>{invoiceData.companyName || '-'}</p>,
              },
            ]
          : []),
        ...(invoiceData.nip !== ''
          ? [
              {
                key: '5',
                span: 3,
                label: t('invoice.nip.name'),
                children: <p>{invoiceData.nip || '-'}</p>,
              },
            ]
          : []),
        {
          key: '6',
          span: 3,
          label: t('invoice.street'),
          children: <p>{invoiceData.street || '-'}</p>,
        },
        {
          key: '7',
          span: 3,
          label: t('invoice.postalCode'),
          children: <p>{invoiceData.postalCode || '-'}</p>,
        },
        {
          key: '8',
          span: 3,
          label: t('invoice.city'),
          children: <p>{invoiceData.city || '-'}</p>,
        },
        {
          key: '9',
          span: 3,
          label: t('invoice.country'),
          children: (
            <p>
              {t<string>(
                `common:countries.${
                  COUNTRIES.find((country) => country.isoCode === invoiceData.country)?.name ??
                  'Poland'
                }`
              )}
            </p>
          ),
        },
        ...(invoiceData.additionalInfo && invoiceData.additionalInfo !== ''
          ? [
              {
                key: '10',
                span: 3,
                label: t('invoice.additionalInfo'),
                children: <p>{invoiceData.additionalInfo}</p>,
              },
            ]
          : []),
      ];

  return (
    <Descriptions
      title={withTitle ? t<string>('invoice.title') : ''}
      bordered
      layout={lg ? 'horizontal' : 'vertical'}
      items={items}
    />
  );
};

export default InvoiceDataInfo;
