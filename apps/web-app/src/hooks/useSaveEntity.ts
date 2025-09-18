import { message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useSaveEntity(
  successCallback?: () => void
): [boolean | string, () => void, () => void, (id?: string) => void, () => void] {
  const [loading, toggleLoader] = useState<boolean | string>(false);
  const { t } = useTranslation('common');

  const onStart = (id?: string, loadingMessage = t<string>('messages.loading.default')) => {
    toggleLoader(id ?? true);
    message.loading({ content: loadingMessage, key: 'loading', duration: 0 });
  };

  const onSuccess = (successMessage = t<string>('messages.success.default')) => {
    toggleLoader(false);
    message.destroy('loading');
    message.success(successMessage);
    successCallback?.();
  };
  const onFailure = (errorMessage = t<string>('messages.error.default')) => {
    toggleLoader(false);
    message.destroy('loading');
    message.error(errorMessage);
  };

  const onEnd = () => {
    toggleLoader(false);
    message.destroy();
  };

  return [loading, onSuccess, onFailure, onStart, onEnd];
}
