import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace SendResetPasswordEmailErrors {
  export class DtoValidationError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `The passed DTO is invalid: ${error}`,
      } as UseCaseError);
    }
  }

  export class NotFound extends Result<UseCaseError> {
    constructor(resource: string, id: string) {
      super(false, {
        message: `The resource ${resource} with id ${id} is not exists`,
      } as UseCaseError);
    }
  }

  export class FailedToGenerateResetPasswordCode extends Result<UseCaseError> {
    constructor(email: string) {
      super(false, {
        message: `Failed to generate reset password code for user with email ${email}`,
      } as UseCaseError);
    }
  }
}
