import * as Joi from 'joi';
import { DeleteApiTokenErrors } from './DeleteApiTokenErrors';
import { DeleteApiTokenDTO } from './DeleteApiTokenDTO';

const schema = Joi.object<DeleteApiTokenDTO>({
  id: Joi.string().required(),
});

export function validator<T = DeleteApiTokenDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new DeleteApiTokenErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
