import * as Joi from 'joi';
import { SendResetPasswordEmailErrors } from './SendResetPasswordEmailErrors';
import { SendResetPasswordEmailDTO } from './SendResetPasswordEmailDTO';
import { SendLinkToLoginDTO } from 'modules/users/useCases/sendLinkToLogin/SendLinkToLoginDTO';

const schema = Joi.object<SendLinkToLoginDTO>({
  email: Joi.string().email().required(),
  authorId: Joi.string().optional(),
  lang: Joi.string().optional(),
  continueUrl: Joi.string().optional(),
});

export function validator<T = SendResetPasswordEmailDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new SendResetPasswordEmailErrors.DtoValidationError(error.message);
  }

  const result = { ...validationResult.value, email: validationResult.value.email.toLowerCase() };

  return result as T;
}
