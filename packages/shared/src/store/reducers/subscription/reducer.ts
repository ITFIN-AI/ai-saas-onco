import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionReducer, SUBSCRIPTION_REDUCER_NAME } from './types';
import { RequestStatus } from '../../../enums/requestStatus';
import { Stripe } from 'stripe';

const initialState: SubscriptionReducer = {
  data: null,
  subscriptionStatus: null,
};

const subscriptionSlice = createSlice({
  name: SUBSCRIPTION_REDUCER_NAME,
  initialState,
  reducers: {
    subscribeToSubscriptionStarted(state) {
      if (!state.data) {
        state.subscriptionStatus = RequestStatus.FETCHING;
      }
    },
    subscribeToSubscriptionSuccess(state, { payload }: PayloadAction<Stripe.Subscription>) {
      state.data = payload;
      state.subscriptionStatus = RequestStatus.SUBSCRIBED;
    },
    subscribeToSubscriptionFailed(state) {
      state.subscriptionStatus = RequestStatus.FAILED;
    },
    unsubscribeFromSubscription(state) {
      state.subscriptionStatus = null;
      state.data = null;
    },
  },
});

export const {
  subscribeToSubscriptionFailed,
  subscribeToSubscriptionStarted,
  subscribeToSubscriptionSuccess,
  unsubscribeFromSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
