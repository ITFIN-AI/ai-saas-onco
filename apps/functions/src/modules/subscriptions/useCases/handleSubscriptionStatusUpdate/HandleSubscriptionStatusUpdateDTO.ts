import Stripe from 'stripe';

export interface HandleSubscriptionStatusUpdateDTO {
  subscription: Stripe.Subscription;
}
