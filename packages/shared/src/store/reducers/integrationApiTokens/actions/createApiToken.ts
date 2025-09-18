import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionParams, AsyncThunkCreator } from '../../../index';
import { INTEGRATION_API_TOKENS_REDUCER_NAME } from '../types';
import { cloudFunctionErrorHandler } from '../../../../helpers/cloudFunctionErrorHandler';

export type Payload = {
  name: string;
  expiresIn: null | '1d' | '7d' | '30d' | '365d';
};

export const createApiToken = createAsyncThunk<
  string,
  ActionParams<Payload, string>,
  AsyncThunkCreator<number>
>(
  `${INTEGRATION_API_TOKENS_REDUCER_NAME}/createApiToken`,
  async (
    { onSuccess, onFailure, payload },
    { rejectWithValue, extra: { functions, analytics, auth } }
  ) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User is not logged');
      }
      const result = await functions.httpsCallable('users-createApiToken')(payload);

      analytics.track('create_api_token', {
        userId: user.uid,
        email: user.email,
      });

      onSuccess?.(result.data.body.token);

      return result.data.body.token;
    } catch (e) {
      const error = cloudFunctionErrorHandler(e);
      onFailure?.(error.code);

      return rejectWithValue(error.code);
    }
  }
);
