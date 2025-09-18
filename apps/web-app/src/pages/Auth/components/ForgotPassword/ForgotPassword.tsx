import React, { FunctionComponent, useState } from 'react';
import { Button, Divider, Form, Input, Result, Typography } from 'antd';
import * as styles from './ForgotPassword.module.scss';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {}

type Props = OwnProps;

export const ForgotPassword: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [loading, toggleLoader] = useState(false);
  const [success, toggleSuccess] = useState(false);
  const [formController] = Form.useForm<{ email: string }>();
  const { email } = useParams<{ email?: string }>();
  const dispatch = useAppDispatch();

  const handleSubmitLoginForm = async ({ email }: { email: string }) => {
    toggleLoader(true);
    await dispatch(userActions.sendPasswordResetEmail(email, window.location.origin));

    formController.setFields([{ name: 'email', value: '' }]);
    toggleLoader(false);
    toggleSuccess(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {success ? (
          <div>
            <Result
              status="success"
              title={t<string>('auth:forgotPassword.successTitle')}
              subTitle={t<string>('auth:forgotPassword.successMessage')}
              extra={<Link to="/">{t<string>('common:goToLoginPage')}</Link>}
            />
          </div>
        ) : (
          <>
            <Typography.Title level={4} className={styles.header}>
              {t<string>('resetPassword.title')}
            </Typography.Title>
            <Form<{ email: string }>
              name="login-form"
              layout="vertical"
              form={formController}
              onFinish={handleSubmitLoginForm}
              className={styles.form}
              initialValues={{
                email: email || '',
              }}
              size="large"
              validateTrigger={['onSubmit', 'onBlur']}
            >
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
                <Input autoFocus />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className={styles.submitButton}
                  loading={loading}
                >
                  {t<string>('reset')}
                </Button>
              </Form.Item>

              <Divider>{t<string>('common:or')}</Divider>

              <div className={styles.register}>
                <Link to="/auth/login">{t<string>('common:button.loginWithPassword')}</Link>
                <h4 className={styles.registerClaim}>{t<string>('registerClaim')}</h4>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};
