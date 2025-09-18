import * as Joi from 'joi';
import { GetUserMetadataErrors } from './GetUserMetadataErrors';
import { GetUserMetadataDTO } from './GetUserMetadataDTO';

const schema = Joi.object<GetUserMetadataDTO>({
  country: Joi.string().optional(), // optional because data is not available when running locally
});

export function validator<T = GetUserMetadataDTO>(payload: unknown): T {
  const validationResult = schema.validate(payload, { allowUnknown: true });
  const { error } = validationResult;

  if (error) {
    throw new GetUserMetadataErrors.DtoValidationError(error.message);
  }

  return payload as T;
}
