import { UserDocument } from '@akademiasaas/shared';

import Stripe from 'stripe';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export type InvoiceId = string | number;

export interface InvoiceService {
  verifyIntegration: () => Promise<void>;
  issueInvoiceForStripeInvoice: (
    order: Stripe.Invoice,
    invoiceClientData?: UserDocument['invoiceData']
  ) => Promise<{ id: InvoiceId; number: string | number }>;
  sendInvoiceToClient: (invoiceId: InvoiceId, clientEmail?: string) => Promise<void>;
}
