import React, { FunctionComponent } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Typography,
  Select,
  InputNumber,
} from 'antd';
import * as styles from './Register.module.scss';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '~/hooks/useQuery';
import { AppStore, userActions, prefixes } from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { getUserIp } from '~/pages/Auth/helpers/checkUserIp';
import { useAppDispatch } from '~/initializeStore';
import { useLoading } from '~/hooks/useLoading';

interface OwnProps {}

type Props = OwnProps;

interface RegisterFormModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  termsAndPrivacyPolicy: boolean;
  phoneNumberPrefix: string;
  phoneNumber: string | null;
}

export const Register: FunctionComponent<Props> = () => {
  const { t, i18n } = useTranslation(['auth', 'common', 'checkout']);
  const { registerError } = useSelector((store: AppStore) => store.user);
  const [loading, startLoading, stopLoading] = useLoading();
  const [form] = Form.useForm();
  const query = useQuery();
  const code = query.get('code') || '';
  const email = query.get('email') || '';
  const dispatch = useAppDispatch();
  const phoneNumber = Form.useWatch('phoneNumber', form);

  const handleSubmitRegisterForm = async (data: RegisterFormModel) => {
    startLoading();
    const ip = await getUserIp();
    await dispatch(
      userActions.signUpUser(
        {
          ...data,
          ip,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lang: i18n.language,
          phoneNumber: data.phoneNumber ? `${data.phoneNumberPrefix}${data.phoneNumber}` : null,
        },
        undefined,
        () => stopLoading()
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <Typography.Title level={4} className={styles.header}>
          {t<string>('registerPanel')}
        </Typography.Title>
        {registerError ? (
          <Alert
            className={styles.alert}
            type={registerError ? 'error' : 'info'}
            message={
              registerError ? (
                t<string>(`common:firebaseAuthErrors.${registerError}`)
              ) : (
                <Trans t={t} i18nKey="common:startJourney" />
              )
            }
          />
        ) : null}
        <Form<RegisterFormModel>
          name="register-form"
          layout="vertical"
          form={form}
          onFinish={handleSubmitRegisterForm}
          className={styles.form}
          validateTrigger={['onSubmit', 'onBlur']}
          initialValues={{
            code,
            email,
            termsAndPrivacyPolicy: false,
            phoneNumber: null,
            phoneNumberPrefix: '+48',
          }}
        >
          <Form.Item
            name="firstName"
            label={t<string>('firstName')}
            rules={[
              {
                required: true,
                message: t<string>('common:validationErrors.fieldIsRequired'),
              },
            ]}
          >
            <Input autoFocus />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={t<string>('lastName')}
            rules={[
              {
                required: true,
                message: t<string>('common:validationErrors.fieldIsRequired'),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t<string>('login')}
            rules={[
              {
                required: true,
                message: t<string>('common:validationErrors.fieldIsRequired'),
              },
              {
                type: 'email',
                message: t<string>('common:validationErrors.wrongEmail'),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={t<string>('phoneNumber')}>
            <Input.Group compact>
              <Form.Item
                name="phoneNumberPrefix"
                rules={[
                  {
                    required: Boolean(phoneNumber),
                    message: t<string>('common:validationErrors.fieldIsRequired'),
                  },
                ]}
                noStyle
              >
                <Select style={{ width: '30%' }}>
                  {prefixes
                    .sort((a, b) => Number(a.value) - Number(b.value))
                    .map((prefix) => (
                      <Select.Option key={prefix.country} value={`+${prefix.value}`}>
                        <span>
                          <img
                            src={`https://flagcdn.com/w20/${prefix.country.toLowerCase()}.jpg`}
                            alt={`${prefix.value}`}
                            width="20"
                          />
                          {` +${prefix.value}`}
                        </span>
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item name="phoneNumber" noStyle>
                <InputNumber
                  style={{ width: '70%', borderLeft: 'none' }}
                  controls={false}
                  keyboard={false}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="password"
            label={t<string>('password')}
            rules={[
              {
                required: true,
                message: t<string>('common:validationErrors.fieldIsRequired'),
              },
              {
                min: 8,
                message: t<string>('common:validationErrors.minLength', { number: 8 }),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="passwordConfirmation"
            label={t<string>('passwordConfirmation')}
            rules={[
              {
                required: true,
                message: t<string>('common:validationErrors.fieldIsRequired'),
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(t<string>('common:validationErrors.passwordNotMatch'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="termsAndPrivacyPolicy"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(t<string>('common:validationErrors.fieldIsRequired')),
              },
            ]}
          >
            <Checkbox>
              {t<string>('acceptTerms')}
              <a
                href={t<string>('common:links.terms')}
                target="_blank"
                rel="noreferrer nofollow"
                style={{ marginRight: 5 }}
              >
                {t<string>('termsOfService')}
              </a>
              {t<string>('acceptOr')}
              <a
                href={t<string>('common:links.privacyPolicy')}
                target="_blank"
                rel="noreferrer nofollow"
                style={{ marginRight: 5 }}
              >
                {t<string>('privacyPolicy')}
              </a>
              {t<string>('acceptEnd')}
              <span className={styles.required}>*</span>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className={styles.submitButton}
              loading={loading}
            >
              {t<string>('common:button.register')}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className={styles.register}>
          <h4 className={styles.registerClaim}>{t<string>('alreadyHaveAccount')}</h4>
          <Link to="/auth/login">{t<string>('common:button.login')}</Link>
        </div>
      </div>
    </div>
  );
};
