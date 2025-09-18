import { StripeInvoiceWithId } from 'shared/models/stripe';

export interface HandleSubscriptionCycleDTO {
  invoice: StripeInvoiceWithId;
}
