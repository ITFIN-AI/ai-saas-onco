import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import {
  ClientInvoiceData,
  subscriptionActions,
  userActions,
  UserDocument,
} from '@akademiasaas/shared';
import InvoiceDataInfo from '~/components/InvoiceDataInfo/InvoiceDataInfo';
import ModalForm from '~/components/ModalForm/ModalForm';
import isEqual from 'lodash.isequal';
import { useSaveEntity } from '~/hooks/useSaveEntity';
import { useAppDispatch } from '~/initializeStore';
import InvoiceDataForm from '~/components/InvoiceDataForm/InvoiceFormData';

interface OwnProps {
  user: UserDocument;
  showAsAlert?: boolean;
}

type Props = OwnProps;

const UserInvoiceData: FunctionComponent<Props> = ({ user, showAsAlert }) => {
  const { t } = useTranslation('subscription');
  const [showInvoiceForm, toggleInvoiceForm] = useState(false);
  const dispatch = useAppDispatch();
  const [loader, onSuccess, onFailure, onStart] = useSaveEntity(() => {
    toggleInvoiceForm(false);
  });

  const updateInvoiceData = async (data: ClientInvoiceData) => {
    if (isEqual(data, user.invoiceData)) {
      toggleInvoiceForm(false);

      return;
    }
    onStart();

    try {
      await dispatch(
        userActions.updateUserData({
          invoiceData: data,
          uid: user.uid,
        })
      );
      dispatch(subscriptionActions.updateUserInvoiceData());
      onSuccess();
    } catch {
      onFailure();
    }
  };

  return (
    <Space style={{ width: '100%' }} direction="vertical" size={12}>
      <Divider orientation="left">{t<string>('invoice.title')}</Divider>
      <div style={{ width: '100%', textAlign: 'right' }}>
        <Button icon={<EditOutlined />} type="primary" onClick={() => toggleInvoiceForm(true)}>
          {t<string>('common:button.edit')}
        </Button>
      </div>

      <InvoiceDataInfo invoiceData={user.invoiceData} withTitle={false} withAlert={showAsAlert} />

      <ModalForm<ClientInvoiceData>
        open={showInvoiceForm}
        onCancel={() => toggleInvoiceForm(false)}
        title={t<string>('invoice.formTitle')}
        okText={t<string>('common:button.save')}
        loading={!!loader}
      >
        <InvoiceDataForm
          onSubmit={updateInvoiceData}
          model={
            user.invoiceData
              ? user.invoiceData
              : user.country
                ? { country: user.country, email: user.email }
                : { email: user.email }
          }
        />
      </ModalForm>
    </Space>
  );
};

export default UserInvoiceData;
