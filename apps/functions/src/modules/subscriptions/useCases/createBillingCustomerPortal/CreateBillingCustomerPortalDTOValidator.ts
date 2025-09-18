import * as Joi from 'joi';
import { CreateBillingCustomerPortalDTO } from './CreateBillingCustomerPortalDTO';
import { CreateBillingCustomerPortalErrors } from './CreateBillingCustomerPortalErrors';

const schema = Joi.object({
  uid: Joi.string().required(),
  email: Joi.string().required(),
});

export function validateCustomerBillingDTO(payload: unknown): CreateBillingCustomerPortalDTO {
  const data = {
    ...(payload as CreateBillingCustomerPortalDTO),
    email: (payload as CreateBillingCustomerPortalDTO).email?.trim()?.toLowerCase(),
  };
  const validationResult = schema.validate(data, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new CreateBillingCustomerPortalErrors.BodyValidationError(error.message);
  }

  return data;
}
