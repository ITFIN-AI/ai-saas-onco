import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace SendLinkToLoginErrors {
  export class DtoValidationError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `The passed DTO is invalid: ${error}`,
      } as UseCaseError);
    }
  }

  export class UnsupportedFeature extends Result<UseCaseError> {
    constructor(feature: string) {
      super(false, {
        message: `The feature ${feature} is not supported`,
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

  export class UserIsNotPermittedToGetALink extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The account ${id} doesn't have permission to get new link`,
      } as UseCaseError);
    }
  }
}
