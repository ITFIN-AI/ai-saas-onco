import * as Joi from 'joi';
import { BroadcastMessageErrors } from './BroadcastMessageErrors';
import { BroadcastMessageDTO } from './BroadcastMessageDTO';

const schema = Joi.object<BroadcastMessageDTO>({
  title: Joi.string().required(),
  message: Joi.string().required(),
  url: Joi.string().uri().allow('', null).optional(),
  emojiIcon: Joi.string().optional(),
  targetUserIds: Joi.array().items(Joi.string()).optional(),
});

export function validator<T = BroadcastMessageDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new BroadcastMessageErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
