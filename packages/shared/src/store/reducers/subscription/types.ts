import { RequestStatus } from '../../../enums/requestStatus';
import { Stripe } from 'stripe';

export const SUBSCRIPTION_REDUCER_NAME = 'Subscription';

export interface SubscriptionReducer {
  data: Stripe.Subscription | null;
  subscriptionStatus: null | RequestStatus;
}
