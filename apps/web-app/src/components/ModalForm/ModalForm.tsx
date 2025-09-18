import React, { ReactElement } from 'react';
import { Modal, Button, Form } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  loading?: boolean;
  children: ReactElement;
  readonly?: boolean;
}

type Props = OwnProps & ModalProps;

function ModalForm<T extends object>({ children, loading, readonly, ...restProps }: Props) {
  const { t } = useTranslation('common');
  const [formController] = Form.useForm<T>();

  const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    formController.resetFields();
    restProps.onCancel?.(e);
  };

  return (
    <Modal
      destroyOnClose
      afterClose={() => {
        formController.resetFields();
      }}
      width={700}
      maskClosable={false}
      {...restProps}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          {restProps.cancelText || t<string>('button.cancel')}
        </Button>,
        <Button
          key="submit"
          type={restProps.okButtonProps?.type || 'primary'}
          danger={restProps.okButtonProps?.danger ?? false}
          loading={loading}
          disabled={readonly}
          onClick={formController.submit}
        >
          {restProps.okText || t<string>('button.save')}
        </Button>,
      ]}
    >
      {React.cloneElement(children, { formController })}
    </Modal>
  );
}

export default ModalForm;
