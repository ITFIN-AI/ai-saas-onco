import * as Joi from 'joi';
import { ChangeSubscriptionPlanErrors } from './ChangeSubscriptionPlanErrors';
import { ChangeSubscriptionPlanDTO } from './ChangeSubscriptionPlanDTO';
import { SubscriptionPlan } from '@akademiasaas/shared';

const schema = Joi.object<ChangeSubscriptionPlanDTO>({
  plan: Joi.allow(...Object.values(SubscriptionPlan)),
  interval: Joi.allow('month', 'year'),
});

export function validator<T = ChangeSubscriptionPlanDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new ChangeSubscriptionPlanErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
