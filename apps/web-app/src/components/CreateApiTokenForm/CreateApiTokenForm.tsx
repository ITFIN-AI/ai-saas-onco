import React, { useEffect } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Trans, useTranslation } from 'react-i18next';
import * as styles from './CreateApiTokenForm.modules.scss';
import { Form, Input, Select } from 'antd';

export interface CreateTokenFormData {
  name: string;
  expiresIn: 'never' | '1d' | '7d' | '30d' | '365d';
}

interface OwnProps {
  model?: CreateTokenFormData | null;
  formController?: FormInstance<CreateTokenFormData>;
  onSubmit: (formData: CreateTokenFormData) => void;
}

type Props = OwnProps;

function CreateApiTokenForm({ model, formController, onSubmit }: Props) {
  const { t } = useTranslation(['settings', 'common']);

  useEffect(() => {
    if (model) {
      formController?.setFieldsValue(model);
    }
  }, [formController, model]);

  return (
    <div className={styles.container}>
      <Form
        layout="vertical"
        form={formController}
        onFinish={onSubmit}
        initialValues={{
          expiresIn: 'never',
        }}
        size="large"
        validateTrigger={['onSubmit']}
      >
        <Form.Item
          name="name"
          label={t<string>('settings:apiIntegration.name')}
          rules={[
            {
              required: true,
              message: t<string>('common:validationErrors.fieldIsRequired'),
            },
          ]}
        >
          <Input
            placeholder={t<string>('settings:apiIntegration.namePlaceholder')}
            autoFocus={!model}
          />
        </Form.Item>

        <Form.Item
          name="expiresIn"
          label={t<string>('settings:apiIntegration.expiresIn')}
          rules={[
            {
              required: true,
              message: t<string>('common:validationErrors.fieldIsRequired'),
            },
          ]}
        >
          <Select>
            <Select.Option value="never">
              {t<string>('settings:apiIntegration.indefinitely')}
            </Select.Option>
            <Select.Option value="1d">
              <Trans t={t} i18nKey="settings:apiIntegration:days" count={1} />
            </Select.Option>
            <Select.Option value="7d">
              <Trans t={t} i18nKey="settings:apiIntegration:days" count={7} />
            </Select.Option>
            <Select.Option value="30d">
              <Trans t={t} i18nKey="settings:apiIntegration:days" count={30} />
            </Select.Option>
            <Select.Option value="365d">
              <Trans t={t} i18nKey="settings:apiIntegration:days" count={365} />
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateApiTokenForm;
