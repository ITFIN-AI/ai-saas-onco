import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace GetUserMetadataErrors {
  export class BadRequestError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `Bad request error: ${error}`,
      } as UseCaseError);
    }
  }
  export class DtoValidationError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `The passed DTO is invalid: ${error}`,
      } as UseCaseError);
    }
  }
}
