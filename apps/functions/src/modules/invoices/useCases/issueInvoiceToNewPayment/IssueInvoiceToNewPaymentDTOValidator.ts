import * as Joi from 'joi';
import { IssueInvoiceToNewPaymentErrors } from './IssueInvoiceToNewPaymentErrors';
import { IssueInvoiceToNewPaymentDTO } from './IssueInvoiceToNewPaymentDTO';
import { SubscriptionEventType } from '@akademiasaas/shared';

const schema = Joi.object<IssueInvoiceToNewPaymentDTO>({
  eventName: Joi.allow(SubscriptionEventType.InvoicePaid.toString()),
});

export function validator<T = IssueInvoiceToNewPaymentDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new IssueInvoiceToNewPaymentErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
