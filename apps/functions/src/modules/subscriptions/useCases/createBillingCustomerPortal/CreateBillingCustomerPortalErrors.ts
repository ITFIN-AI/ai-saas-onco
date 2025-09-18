import { UseCaseError } from '../../../../shared/core/UseCaseError';
import { Result } from '../../../../shared/core/Result';

export namespace CreateBillingCustomerPortalErrors {
  export class UserNotFound extends Result<UseCaseError> {
    constructor(userId: string) {
      super(false, {
        message: `The user ${userId} doesn't exist in system`,
      } as UseCaseError);
    }
  }

  export class StripeCustomerNotExists extends Result<UseCaseError> {
    constructor(userId: string) {
      super(false, {
        message: `The stripe customer for ${userId} doesn't exist in system`,
      } as UseCaseError);
    }
  }

  export class AuthorNotFound extends Result<UseCaseError> {
    constructor(userId: string) {
      super(false, {
        message: `The author ${userId} doesn't exist in system`,
      } as UseCaseError);
    }
  }

  export class BodyValidationError extends Result<UseCaseError> {
    constructor(error: string) {
      super(false, {
        message: `The passed DTO is invalid: ${error}`,
      } as UseCaseError);
    }
  }
}
