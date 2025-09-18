import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace BroadcastMessageErrors {
  export class DtoValidationError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `The passed DTO is invalid: ${error}`,
      } as UseCaseError);
    }
  }

  export class NotAuthorized extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: 'User is not authorized to send broadcast messages',
      } as UseCaseError);
    }
  }

  export class BroadcastFailed extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `Failed to send broadcast message: ${error}`,
      } as UseCaseError);
    }
  }
}
