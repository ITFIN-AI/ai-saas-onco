import { Stripe } from 'stripe';

export interface HandleAddedSubscriptionDTO {
  subscription: Stripe.Subscription;
}
