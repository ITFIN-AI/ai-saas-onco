import * as Joi from 'joi';
import { HandleAddedSubscriptionErrors } from './HandleAddedSubscriptionErrors';
import { HandleAddedSubscriptionDTO } from './HandleAddedSubscriptionDTO';

const schema = Joi.object<HandleAddedSubscriptionDTO>({
  subscription: Joi.object().required(),
});

export function validator<T = HandleAddedSubscriptionDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new HandleAddedSubscriptionErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
