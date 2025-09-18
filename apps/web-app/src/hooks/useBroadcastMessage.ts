import { useState } from 'react';
import { message } from 'antd';
import { functions } from '~/initializeStore';
import { cloudFunctionErrorHandler } from '@akademiasaas/shared';
import firebase from 'firebase/compat/app';

interface BroadcastMessagePayload {
  title: string;
  message: string;
  url?: string;
  emojiIcon?: string;
  targetUserIds?: string[];
}

export const useBroadcastMessage = () => {
  const [loading, setLoading] = useState(false);

  const sendBroadcastMessage = async (payload: BroadcastMessagePayload) => {
    try {
      setLoading(true);
      await functions?.httpsCallable('admin-broadcastMessage')(payload);
      message.success('Broadcast message sent successfully');
    } catch (error) {
      const { code } = cloudFunctionErrorHandler(error as Error | firebase.functions.HttpsError);
      if (code === 403) {
        message.error('You are not authorized to send broadcast messages');
      } else {
        message.error('Failed to send broadcast message');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendBroadcastMessage,
    loading,
  };
};
