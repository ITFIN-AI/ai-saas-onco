import React, { FunctionComponent } from 'react';
import * as styles from './Login.module.scss';
import { Alert, Button, Divider, Form, Input, Typography } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { AppStore, userActions, UserStatus } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {}

type Props = OwnProps;

type LoginFormModel = {
  email: string;
  password: string;
};

const Login: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['auth', 'common']);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [formController] = Form.useForm<LoginFormModel>();
  const { status: userStatus, error } = useSelector((store: AppStore) => store.user);

  const onFinish = (values: LoginFormModel) => {
    dispatch(userActions.logInUser(values));
  };

  const generateForgotPasswordLink = () => {
    const email = formController.getFieldValue('email');
    if (email) {
      return `/auth/forgot-password/${email}`;
    }

    return '/auth/forgot-password';
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <Typography.Title level={4} className={styles.header}>
            {t<string>('loginPanel')}
          </Typography.Title>
          {userStatus === UserStatus.HAS_ERROR ? (
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
          ) : null}

          <Form<LoginFormModel>
            name="login-form"
            form={formController}
            layout="vertical"
            onFinish={onFinish}
            className={styles.form}
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

            <Form.Item
              name="password"
              label={t<string>('password')}
              rules={[
                {
                  required: true,
                  message: t<string>('common:validationErrors.fieldIsRequired'),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button
              size="small"
              style={{
                width: '100%',
                margin: '10px 0 30px',
                color: '#8950fc',
                fontWeight: 'bold',
                fontSize: 16,
                whiteSpace: 'normal',
              }}
              onClick={() =>
                history.push(
                  `/auth/login-by-link?email=${formController.getFieldValue('email') ?? ''}`
                )
              }
              type="link"
              tabIndex={-1}
              danger
            >
              {t<string>('common:button.loginByLink')}
            </Button>

            <div className={styles.forgotPassword}>
              <div className={styles.forgotPasswordLink}>
                <Button onClick={() => history.push(generateForgotPasswordLink())} type="link">
                  {t<string>('common:button.forgotPassword')}
                </Button>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                block
                className={styles.submitButton}
                loading={userStatus === UserStatus.LOGGING_IN}
              >
                {t<string>('common:button.login')}
              </Button>
            </div>
          </Form>

          <Divider>{t<string>('common:or')}</Divider>

          <div className={styles.register}>
            <Link to="/auth/register">{t<string>('common:button.register')}</Link>
            <h4 className={styles.registerClaim}>{t<string>('registerClaim')}</h4>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
