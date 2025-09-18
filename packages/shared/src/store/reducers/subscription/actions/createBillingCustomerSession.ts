import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';
import Stripe from 'stripe';

export const createBillingCustomerSession = createAsyncThunk<
  Stripe.Response<Stripe.BillingPortal.Session>,
  void,
  AsyncThunkCreator<number>
>(
  `${SUBSCRIPTION_REDUCER_NAME}/createBillingCustomerSession`,
  async (_, { rejectWithValue, extra: { functions } }) => {
    try {
      const res = await functions.httpsCallable('subscriptions-createBillingCustomerSession')();

      return res.data?.body as Stripe.Response<Stripe.BillingPortal.Session>;
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }
  }
);
