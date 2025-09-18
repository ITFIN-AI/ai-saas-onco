import React, { FunctionComponent, useEffect } from 'react';
import { Button, Divider, Form, Input, message } from 'antd';
import * as styles from './SetContactEmail.module.scss';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '~/initializeStore';
import { MailOutlined } from '@ant-design/icons';

interface OwnProps {}

type Props = OwnProps;

type ContactEmailFormModel = {
  email: string;
};

const SetContactEmail: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['settings', 'common']);
  const [formController] = Form.useForm<ContactEmailFormModel>();
  const { updateUserDataStatus, data, details } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (details) {
      formController.setFields([
        {
          name: 'email',
          value: details.contactEmail || details.email || '',
        },
      ]);
    }
  }, [formController, details]);

  const handleContactEmailForm = async (values: ContactEmailFormModel) => {
    if (data) {
      await dispatch(
        userActions.updateUserData({
          uid: data.uid,
          contactEmail: values.email,
        })
      );
      message.success(t<string>('contactEmail.emailSetSuccess'));
      formController.resetFields();
    }
  };

  return (
    <>
      <Divider>{t<string>('contactEmail.setEmail')}</Divider>
      <Form<ContactEmailFormModel>
        name="set-contact-email"
        layout="vertical"
        form={formController}
        onFinish={handleContactEmailForm}
        className={styles.form}
        validateTrigger={['onSubmit', 'onBlur']}
      >
        <Form.Item
          name="email"
          label={t<string>('contactEmail.email')}
          rules={[
            {
              required: true,
              message: t<string>('common:validationErrors.fieldIsRequired'),
            },
          ]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={updateUserDataStatus === RequestStatus.UPDATING}
        >
          {t<string>('contactEmail.save')}
        </Button>
      </Form>
    </>
  );
};

export default SetContactEmail;
