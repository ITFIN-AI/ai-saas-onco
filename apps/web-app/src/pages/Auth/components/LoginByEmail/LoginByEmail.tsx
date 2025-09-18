import React, { FunctionComponent, useEffect, useState } from 'react';
import * as styles from './LoginByEmail.module.scss';
import { Alert, Button, Divider, Form, Input, Result, Typography } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { AppStore, userActions, UserStatus } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {}

type Props = OwnProps;

type LoginFormModel = {
  email: string;
};

const LoginByEmail: FunctionComponent<Props> = () => {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const dispatch = useAppDispatch();
  const [formController] = Form.useForm<LoginFormModel>();
  const [loading, toggleLoader] = useState(false);
  const [showSuccess, toggleSuccess] = useState(false);
  const { status: userStatus, error } = useSelector((store: AppStore) => store.user);
  const queryParams = new URLSearchParams(window.location.search);
  const emailInQuery = queryParams.get('email')?.replace(' ', '+') ?? '';
  const errorInQuery = queryParams.get('error') ?? null;
  const history = useHistory();

  useEffect(() => {
    if (errorInQuery) {
      dispatch(userActions.logInFailed(errorInQuery));
      const search = new URLSearchParams(window.location.search);
      search.delete('error');
      history.replace({
        search: search.toString(),
      });
    } else {
      dispatch(userActions.resetErrors());
    }
  }, [dispatch, history, errorInQuery]);

  useEffect(() => {
    if (emailInQuery) {
      setTimeout(() => {
        history.replace({
          search: '',
        });
      }, 0);
    }
  }, [emailInQuery, history]);

  const onFinish = async (values: LoginFormModel) => {
    const validatedEmail = values.email.trim();
    toggleLoader(true);
    await dispatch(
      userActions.sendLoginLink(
        validatedEmail,
        `${window.location.origin}/auth/sign-with-link`,
        i18n.language
      )
    );
    window.localStorage.setItem('emailForSignIn', validatedEmail ?? '');
    toggleLoader(false);
    toggleSuccess(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {showSuccess ? (
          <div>
            <Result
              status="success"
              title={t<string>('auth:sendLink.successTitle')}
              subTitle={t<string>('auth:sendLink.successMessage')}
              extra={<Link to="/">{t<string>('common:goToLoginPage')}</Link>}
            />
          </div>
        ) : (
          <>
            <Typography.Title level={4} className={styles.header}>
              {t<string>('loginByEmailPanel')}
            </Typography.Title>
            {error && (
              <Alert
                className={styles.alert}
                type={userStatus === UserStatus.HAS_ERROR ? 'error' : 'info'}
                message={
                  userStatus === UserStatus.HAS_ERROR ? (
                    t<string>(`common:firebaseAuthErrors.${error}`)
                  ) : (
                    <Trans t={t} i18nKey="common:startJourney" />
                  )
                }
              />
            )}

            <Form<LoginFormModel>
              name="login-form"
              form={formController}
              layout="vertical"
              onFinish={onFinish}
              className={styles.form}
              size="large"
              validateTrigger={['onSubmit', 'onBlur']}
              initialValues={{ email: emailInQuery }}
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
                    transform: (value) => value.trim(),
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
                  {t<string>('common:button.sendLink')}
                </Button>
              </Form.Item>
            </Form>

            <Divider>{t<string>('common:or')}</Divider>

            <div className={styles.register}>
              <Link to="/auth/login">{t<string>('common:button.loginWithPassword')}</Link>
              <h4 className={styles.registerClaim}>{t<string>('registerClaim')}</h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginByEmail;
