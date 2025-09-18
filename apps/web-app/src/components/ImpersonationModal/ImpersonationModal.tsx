import React from 'react';
import { Modal, Input, message } from 'antd';
import { useAppDispatch } from '~/initializeStore';
import { userActions } from '@akademiasaas/shared';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImpersonationModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const [customToken, setCustomToken] = React.useState('');

  const handleImpersonate = async () => {
    try {
      await dispatch(userActions.impersonateUser(customToken));
      onClose();
      setCustomToken('');
    } catch (error) {
      message.error('Impersonation failed');
    }
  };

  return (
    <Modal
      title={'Impersonation'}
      open={open}
      onOk={handleImpersonate}
      onCancel={() => {
        onClose();
        setCustomToken('');
      }}
      okButtonProps={{ disabled: !customToken }}
    >
      <Input
        placeholder="Enter custom token"
        value={customToken}
        onChange={(e) => setCustomToken(e.target.value)}
      />
    </Modal>
  );
};

export default ImpersonationModal;
