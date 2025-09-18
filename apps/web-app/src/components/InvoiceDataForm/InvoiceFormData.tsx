import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Form, Input, Space, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { FormInstance } from 'antd/lib/form';
import { ClientInvoiceData, COUNTRIES, getFlagEmoji } from '@akademiasaas/shared';
import sortBy from 'lodash.sortby';

interface OwnProps {
  formController?: FormInstance<ClientInvoiceData>;
  onSubmit: (formData: ClientInvoiceData) => void;
  model?: Partial<ClientInvoiceData> | null;
  children?: React.ReactNode;
}

type Props = OwnProps;

const InvoiceDataForm: FunctionComponent<Props> = ({
  formController,
  onSubmit,
  model,
  children,
}) => {
  const { t } = useTranslation(['subscription', 'common']);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- formController is passed from parent

  useEffect(() => {
    if (model) {
      formController?.setFieldsValue(model);
    }
  }, [formController, model]);

  const countriesSorted = useMemo(
    () =>
      sortBy(
        COUNTRIES.map((country) => ({
          ...country,
          label: t<string>(`common:countries.${country.name}`),
        })),
        'label'
      ),
    [t]
  );

  const handleFinish: typeof onSubmit = (formData) => {
    onSubmit(formData);
  };

  return (
    <Form<ClientInvoiceData>
      name="invoice-form"
      layout="horizontal"
      labelCol={{ xxl: { span: 8, offset: 0 }, span: 24, offset: 0 }}
      wrapperCol={{ xxl: { span: 24, offset: 0 }, span: 24, offset: 0 }}
      onFinish={handleFinish}
      validateTrigger="onSubmit"
      form={formController}
      initialValues={{
        firstName: '',
        lastName: '',
        companyName: '',
        nip: '',
        street: '',
        postalCode: '',
        city: '',
        country: 'PL',
        email: '',
        ...model,
      }}
    >
      {children}
      <>
        <Form.Item
          name="email"
          label={t('invoice.email')}
          extra={t<string>('invoice.emailHelp')}
          rules={[
            {
              type: 'email',
              message: t<string>('common:validationErrors.wrongEmail'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="firstName"
          label={t<string>('invoice.firstName')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Input placeholder={t<string>('invoice.firstNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={t<string>('invoice.lastName')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Input placeholder={t<string>('invoice.lastNamePlaceholder')} />
        </Form.Item>
      </>

      <>
        <Form.Item name="companyName" label={t<string>('invoice.companyName')}>
          <Input placeholder={t('invoice.companyNamePlaceholder')} />
        </Form.Item>

        <Form.Item name="nip" label={t<string>('invoice.nip.name')}>
          <Input placeholder={t<string>('invoice.nip.placeholder')} />
        </Form.Item>

        <Form.Item
          name="street"
          label={t<string>('invoice.street')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Input placeholder={t<string>('invoice.streetPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="postalCode"
          label={t<string>('invoice.postalCode')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="city"
          label={t<string>('invoice.city')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="country"
          label={t<string>('invoice.country')}
          rules={[
            { required: true, message: t<string>('common:validationErrors.fieldIsRequired') },
          ]}
        >
          <Select
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) => {
              return (option?.label as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          >
            {countriesSorted.map((country) => (
              <Select.Option key={country.isoCode} value={country.isoCode} label={country.label}>
                <Space>
                  <span role="img" aria-label={country.label}>
                    {getFlagEmoji(country.isoCode)}
                  </span>
                  {country.label}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </>
    </Form>
  );
};

export default InvoiceDataForm;
