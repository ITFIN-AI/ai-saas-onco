import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import * as styles from './ResetPassword.module.scss';
import { TFunction, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useHistory } from 'react-router-dom';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {
  actionCode: string;
  continueUrl: string | null;
}

type Props = OwnProps;

export const ResetPassword: FunctionComponent<Props> = ({ continueUrl }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [status, setStatus] = useState<null | {
    type: 'error' | 'info';
    textKey: string;
  }>(null);
  const { passwordStatus } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();
  const [redirectDelay, setRedirectDelay] = useState<number>(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const history = useHistory();
  const query = useQuery();
  const code = query.get('code');

  const handleSubmitPasswordChangeForm = async ({ password }: ChangePasswordModel) => {
    dispatch(
      userActions.resetUserPassword({
        resetPasswordCode: code || '',
        password,
      })
    );
  };

  useEffect(() => {
    if (passwordStatus === RequestStatus.SUCCESS) {
      setStatus({ type: 'info', textKey: 'resetPassword.success' });
      setRedirectUrl(continueUrl || '/auth/login');
    }
    if (passwordStatus === RequestStatus.FAILED) {
      setStatus({ type: 'error', textKey: 'resetPassword.error' });
      setRedirectUrl('/auth/forgot-password');
    }
  }, [t, continueUrl, passwordStatus]);

  useEffect(() => {
    if (!redirectUrl) {
      return;
    }

    if (redirectDelay > 0) {
      setTimeout(() => {
        setRedirectDelay(redirectDelay - 1);
      }, 1000);
    }

    if (redirectDelay === 0) {
      history.push(redirectUrl);
    }
  }, [t, history, redirectDelay, redirectUrl]);

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <Typography.Title level={4} className={styles.header}>
          {t<string>('resetPassword.title')}
        </Typography.Title>
        {status && (
          <>
            <Alert className={styles.alert} type={status.type} message={t(status.textKey)} />
            {redirectUrl && (
              <Button type="link" onClick={() => history.push(redirectUrl)}>
                {t<string>('common:redirecting', { seconds: redirectDelay })}
              </Button>
            )}
          </>
        )}
        {!status && (
          <ResetPasswordForm
            t={t}
            status={passwordStatus}
            handleSubmitPasswordChangeForm={handleSubmitPasswordChangeForm}
          />
        )}
      </div>
    </div>
  );
};

interface ChangePasswordModel {
  password: string;
  passwordConfirmation: string;
}

interface ResetPasswordFormProps {
  t: TFunction<string[]>;
  status: RequestStatus | null;
  handleSubmitPasswordChangeForm: (values: ChangePasswordModel) => void;
}

const ResetPasswordForm: FunctionComponent<ResetPasswordFormProps> = ({
  t,
  status,
  handleSubmitPasswordChangeForm,
}) => {
  const [formController] = Form.useForm<ChangePasswordModel>();

  return (
    <Form<ChangePasswordModel>
      name="login-form"
      layout="vertical"
      form={formController}
      onFinish={handleSubmitPasswordChangeForm}
      className={styles.form}
      size="large"
      validateTrigger={['onSubmit', 'onBlur']}
    >
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

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          className={styles.submitButton}
          loading={status === RequestStatus.UPDATING}
        >
          {t<string>('reset')}
        </Button>
      </Form.Item>
    </Form>
  );
};
