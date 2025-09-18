import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, message, Typography } from 'antd';
import * as styles from './SignWithLink.module.scss';
import { useTranslation } from 'react-i18next';
import { userActions } from '@akademiasaas/shared';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {}

type Props = OwnProps;

type SignInFormModel = {
  email: string;
};

export const SignWithLink: FunctionComponent<Props> = () => {
  const [loginFormController] = Form.useForm<SignInFormModel>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['auth', 'common']);
  const queryParams = useQuery();
  const [isLogging, toggleLogging] = useState<boolean>(false);
  const [email, setEmail] = useState(
    window.localStorage.getItem('emailForSignIn') ??
      queryParams.get('email')?.replace(' ', '+') ??
      ''
  );

  const handleSubmitLoginForm = useCallback(
    async (values: SignInFormModel) => {
      toggleLogging(true);
      dispatch(
        userActions.loginByEmailLink(
          {
            href: window.location.href,
            email: values.email,
          },
          () => {
            const redirectTo = queryParams.get('redirectTo');
            if (redirectTo) {
              window.location.replace(decodeURIComponent(redirectTo));
            }
            toggleLogging(false);
          },
          (code, errorMessage) => {
            if (!code) {
              message.error(errorMessage);
              toggleLogging(false);

              return;
            }
            if (
              code === 'auth/expired-action-code' ||
              code === 'auth/invalid-action-code' ||
              code === 'auth/argument-error'
            ) {
              const loginByLinkUrl = new URL('/auth/login-by-link', window.location.origin);
              loginByLinkUrl.searchParams.set('error', code);

              window.location.replace(loginByLinkUrl);
              toggleLogging(false);

              return;
            }

            message.error(t<string>(`loginByEmail.${code.split('/').join('.')}`));

            if (code === 'auth/invalid-email') {
              window.localStorage.removeItem('emailForSignIn');
              setEmail('');
            }

            toggleLogging(false);
          }
        )
      );
    },
    [dispatch, queryParams, t]
  );

  useEffect(() => {
    if (email) {
      (async () => {
        await handleSubmitLoginForm({ email });
      })();
    }
  }, [email, handleSubmitLoginForm]);

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <Typography.Title level={4} className={styles.header}>
          {t<string>('loginByEmail.title')}
        </Typography.Title>

        <Form<SignInFormModel>
          name="sign-by-link-form"
          layout="vertical"
          form={loginFormController}
          onFinish={handleSubmitLoginForm}
          className={styles.form}
          size="large"
          initialValues={{
            email,
          }}
          validateTrigger={['onSubmit', 'onBlur']}
        >
          <Form.Item
            name="email"
            label={t<string>('login')}
            style={{
              visibility: email ? 'hidden' : 'visible',
              height: email ? 0 : 'auto',
              marginBottom: email ? 0 : 24,
            }}
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
              loading={isLogging}
            >
              {t<string>('signIn')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
