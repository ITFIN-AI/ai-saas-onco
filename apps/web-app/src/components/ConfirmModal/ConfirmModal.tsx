import React, { FunctionComponent, ReactNode } from 'react';
import { Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  saving?: boolean;
  children: ReactNode;
  modalTitle: string;
  buttonTitle: string;
}

const ConfirmModal: FunctionComponent<OwnProps> = ({
  onSave,
  saving,
  open,
  onClose,
  children,
  modalTitle,
  buttonTitle,
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={700}
      title={modalTitle}
      footer={[
        <Button onClick={onClose} disabled={saving} key="cancel">
          {t<string>('button.cancel')}
        </Button>,
        <Button onClick={onSave} loading={saving} disabled={saving} type="primary" key="ok">
          {buttonTitle}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};

export default ConfirmModal;
