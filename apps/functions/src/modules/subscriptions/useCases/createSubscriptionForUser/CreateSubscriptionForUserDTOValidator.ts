import * as Joi from 'joi';
import { CreateSubscriptionForUserErrors } from './CreateSubscriptionForUserErrors';
import { CreateSubscriptionForUserDTO } from './CreateSubscriptionForUserDTO';

const schema = Joi.object<CreateSubscriptionForUserDTO>({
  userId: Joi.string().required(),
});

export function validator<T = CreateSubscriptionForUserDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new CreateSubscriptionForUserErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
