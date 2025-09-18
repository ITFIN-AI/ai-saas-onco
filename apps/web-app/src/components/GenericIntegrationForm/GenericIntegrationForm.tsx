import React, { useEffect } from 'react';
import { FormInstance } from 'antd/lib/form';
import * as styles from './GenericIntegrationForm.modules.scss';
import { Form, Input, InputNumber, Switch } from 'antd';
import { Rule } from 'antd/es/form';

import { useTranslation } from 'react-i18next';

type FieldProps = {
  hidden?: boolean;
  label?: string;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  rules?: Rule[];
  default?: string | boolean;
  sensitive?: boolean;
  autofocus?: boolean;
  type: 'text' | 'number' | 'boolean';
};

export type Fields<T> = {
  [key in Extract<keyof T, string>]: FieldProps | null;
};

interface OwnProps<T> {
  model?: Partial<T> | null;
  formController?: FormInstance<T>;
  onSubmit: (formData: T) => void;
  fields: Fields<T>;
}

type Props<T> = OwnProps<T>;

function GenericIntegrationForm<T extends object>({
  fields,
  model,
  formController,
  onSubmit,
}: Props<T>) {
  const { t } = useTranslation(['dashboard', 'common']);

  const providedFields = Object.entries(fields).filter(([_, field]) => !!field);

  useEffect(() => {
    if (model) {
      // T complies with RecursivePartial<T> so it's safe to cast it as any. RecursivePartial<T> is not exposed from antd.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formController?.setFieldsValue(model as any);
    }
  }, [formController, model]);

  const getInput = (field: FieldProps) => {
    switch (field.type) {
      case 'boolean':
        return Switch;
      case 'number':
        return InputNumber;
      case 'text':
        return field.sensitive ? Input.Password : Input;
    }
  };

  return (
    <div className={styles.container}>
      <Form<T>
        layout="vertical"
        form={formController}
        onFinish={onSubmit}
        initialValues={providedFields.reduce((acc, [name, fieldObj]) => {
          const field = fieldObj as FieldProps;

          if (field.default) {
            acc[name] = field.default;
          }

          return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as any)}
        size="large"
        validateTrigger={['onSubmit']}
      >
        {providedFields.map(([name, fieldObj]) => {
          const field = fieldObj as FieldProps;
          const InputComponent = getInput(field);
          field.sensitive ? Input.Password : Input;

          return (
            <Form.Item
              key={name}
              name={name}
              label={field.label}
              tooltip={field.tooltip}
              rules={[
                ...(field.required
                  ? [
                      {
                        required: true,
                        message: t<string>('common:validationErrors.fieldIsRequired'),
                      },
                    ]
                  : []),
                ...(field.rules || []),
              ]}
              {...(field.type === 'boolean' ? { valuePropName: 'checked' } : null)}
            >
              <InputComponent
                placeholder={field.placeholder}
                autoFocus={field.autofocus}
                {...(field.type === 'boolean' ? { checked: Boolean(field.default) } : null)}
              />
            </Form.Item>
          );
        })}
      </Form>
    </div>
  );
}

export default GenericIntegrationForm;
