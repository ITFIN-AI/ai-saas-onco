import * as Joi from 'joi';
import { CreateApiTokenErrors } from './CreateApiTokenErrors';
import { CreateApiTokenDTO } from './CreateApiTokenDTO';

const schema = Joi.object<CreateApiTokenDTO>({
  name: Joi.string().required(),
  expiresIn: Joi.string().valid(null, '1d', '7d', '30d', '365d').required(),
});

export function validator<T = CreateApiTokenDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new CreateApiTokenErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
