import * as Joi from 'joi';
import { CheckSubscriptionInvoiceErrors } from './CheckSubscriptionInvoiceErrors';
import { CheckSubscriptionInvoiceDTO } from './CheckSubscriptionInvoiceDTO';
import { SubscriptionPlan } from '@akademiasaas/shared';

const schema = Joi.object<CheckSubscriptionInvoiceDTO>({
  plan: Joi.allow(...Object.values(SubscriptionPlan)),
  interval: Joi.allow('month', 'year'),
});

export function validator<T = CheckSubscriptionInvoiceDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new CheckSubscriptionInvoiceErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
