import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';
import Stripe from 'stripe';
import {
  SubscriptionPlan,
  UserSubscriptionInterval,
} from '../../../../models/documents/Subscriptions';

type Payload = {
  interval: UserSubscriptionInterval;
  plan: SubscriptionPlan;
};

export const checkSubscriptionInvoice = createAsyncThunk<
  Stripe.Response<Stripe.Invoice>,
  Payload,
  AsyncThunkCreator<number>
>(
  `${SUBSCRIPTION_REDUCER_NAME}/checkSubscriptionInvoice`,
  async (payload, { rejectWithValue, extra: { functions } }) => {
    try {
      const res = await functions.httpsCallable('subscriptions-checkSubscriptionInvoice')(payload);

      return res.data?.body as Stripe.Response<Stripe.Invoice>;
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }
  }
);
