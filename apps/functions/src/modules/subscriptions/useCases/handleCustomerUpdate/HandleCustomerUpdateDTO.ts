import { Stripe } from 'stripe';

export interface HandleCustomerUpdateDTO {
  customer: Stripe.Customer;
  previous: Partial<Stripe.Customer>;
}
