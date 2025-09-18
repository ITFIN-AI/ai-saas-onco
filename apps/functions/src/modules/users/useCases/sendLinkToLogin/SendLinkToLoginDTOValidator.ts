import * as Joi from 'joi';
import { SendLinkToLoginErrors } from './SendLinkToLoginErrors';
import { SendLinkToLoginDTO } from './SendLinkToLoginDTO';

const schema = Joi.object<SendLinkToLoginDTO>({
  email: Joi.string().email().required(),
  continueUrl: Joi.string().optional(),
  authorId: Joi.string().allow(null).optional(),
  lang: Joi.string().required(),
});

export function validator<T = SendLinkToLoginDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new SendLinkToLoginErrors.DtoValidationError(error.message);
  }

  const result = { ...validationResult, email: validationResult.value.email.toLowerCase() };

  return result as T;
}
