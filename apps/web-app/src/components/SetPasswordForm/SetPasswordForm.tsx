import React, { FunctionComponent } from 'react';
import { Alert, Button, Divider, Form, Input, message } from 'antd';
import * as styles from './SetPasswordForm.module.scss';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '~/initializeStore';
import { LockOutlined } from '@ant-design/icons';

interface OwnProps {}

type Props = OwnProps;

type PasswordSetFormModel = {
  password: string;
  confirmPassword: string;
  oldPassword?: string;
};

const SetPasswordForm: FunctionComponent<Props> = () => {
  const [formController] = Form.useForm<PasswordSetFormModel>();
  const { i18n, t } = useTranslation(['auth', 'common']);
  const { passwordStatus, error, details } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();

  const handleSetPasswordForm = async (values: PasswordSetFormModel) => {
    await dispatch(
      userActions.setUserPassword(
        {
          password: values.password,
          oldPassword: values.oldPassword,
        },
        () => {
          message.success(t<string>('passwordChangeSuccess'));
          formController.resetFields();
        }
      )
    );
  };

  const sendNewLink = async () => {
    if (details) {
      window.localStorage.setItem('emailForSignIn', details.email);
      await dispatch(
        userActions.sendLoginLink(
          details.email,
          `${window.location.origin}/auth/sign-with-link`,
          i18n.language
        )
      );
      message.success(t<string>('checkYourEmail'));
      setTimeout(() => {
        dispatch(userActions.logOutUser());
      }, 700);
      dispatch(userActions.resetErrors());
    }
  };
  const renderAlertAction = () => {
    if (error === 'auth/requires-recent-login') {
      return (
        <Button type="dashed" onClick={sendNewLink}>
          {t<string>('sendNewLoginLink')}
        </Button>
      );
    }
  };

  return (
    <>
      <Divider>
        {details?.onboarding?.loginOnlyByLink
          ? t<string>('loginByEmail.setPassword')
          : t<string>('loginByEmail.changePassword')}
      </Divider>
      {error && (
        <Alert
          showIcon
          className={styles.alert}
          type="error"
          message={t<string>(`passwordErrors.${error}`)}
          action={renderAlertAction()}
        />
      )}
      <Form<PasswordSetFormModel>
        name="set-password-form"
        layout="vertical"
        form={formController}
        onFinish={handleSetPasswordForm}
        className={styles.form}
        validateTrigger={['onSubmit', 'onBlur']}
      >
        {!details?.onboarding?.loginOnlyByLink && (
          <Form.Item
            name="oldPassword"
            label={t<string>('oldPassword')}
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
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder={t<string>('oldPassword')}
            />
          </Form.Item>
        )}
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
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t<string>('password')}
          />
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
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t<string>('passwordConfirmation')}
          />
        </Form.Item>

        <div className={styles.sendForm}>
          <Button
            type="primary"
            htmlType="submit"
            block
            className={styles.submitButton}
            loading={passwordStatus === RequestStatus.UPDATING}
          >
            {t<string>('common:button.confirm')}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default SetPasswordForm;
