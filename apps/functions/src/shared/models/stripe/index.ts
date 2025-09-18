import Stripe from 'stripe';

export interface StripeInvoiceWithId extends Stripe.Invoice {
  id: string;
}
