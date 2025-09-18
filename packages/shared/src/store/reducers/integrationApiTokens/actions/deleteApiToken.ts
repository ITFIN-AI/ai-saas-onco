import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionParams, AsyncThunkCreator } from '../../../index';
import { INTEGRATION_API_TOKENS_REDUCER_NAME } from '../types';
import { cloudFunctionErrorHandler } from '../../../../helpers/cloudFunctionErrorHandler';

export type Payload = {
  id: string;
};

export const deleteApiToken = createAsyncThunk<
  void,
  ActionParams<Payload, string>,
  AsyncThunkCreator<number>
>(
  `${INTEGRATION_API_TOKENS_REDUCER_NAME}/deleteApiToken`,
  async (
    { onSuccess, onFailure, payload },
    { rejectWithValue, extra: { functions, analytics, auth } }
  ) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User is not logged');
      }
      await functions.httpsCallable('users-deleteApiToken')(payload);

      analytics.track('delete_api_token', {
        userId: user.uid,
        email: user.email,
        id: payload.id,
      });
      onSuccess?.();
    } catch (e) {
      const error = cloudFunctionErrorHandler(e);
      onFailure?.(error.code);

      return rejectWithValue(error.code);
    }

    return;
  }
);
