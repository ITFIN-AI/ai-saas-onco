import { StripeInvoiceWithId } from 'shared/models/stripe';

export interface HandleFailedPaymentDTO {
  invoice: StripeInvoiceWithId;
}
