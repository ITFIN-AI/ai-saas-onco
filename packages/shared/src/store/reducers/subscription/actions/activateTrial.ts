import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';

type Payload = void;

export const activateTrial = createAsyncThunk<void, Payload, AsyncThunkCreator<number>>(
  `${SUBSCRIPTION_REDUCER_NAME}/activateTrial`,
  async (payload, { rejectWithValue, extra: { functions } }) => {
    try {
      await functions.httpsCallable('subscriptions-onActivateTrial')(payload);
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }

    return;
  }
);
