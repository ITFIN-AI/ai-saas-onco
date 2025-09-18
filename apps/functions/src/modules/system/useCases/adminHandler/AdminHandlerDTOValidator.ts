import * as Joi from 'joi';
import { AdminHandlerErrors } from './AdminHandlerErrors';
import { AdminHandlerDTO } from './AdminHandlerDTO';
import { AdminOperationType } from 'shared/enums/AdminOperationType';

const schema = Joi.object<AdminHandlerDTO>({
  type: Joi.string()
    .valid(...Object.values(AdminOperationType))
    .required(),
});

export function validator<T = AdminHandlerDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new AdminHandlerErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
