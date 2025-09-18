import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace HandleSubscriptionCycleErrors {
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

  export class MissingData extends Result<UseCaseError> {
    constructor(resource: string, id: string) {
      super(false, {
        message: `The event ${id} doesn't have info about ${resource}`,
      } as UseCaseError);
    }
  }

  export class CannotFoundOwnerAccount extends Result<UseCaseError> {
    constructor(accountId: string) {
      super(false, {
        message: `The owner account ${accountId} doesn't exist.`,
      } as UseCaseError);
    }
  }

  export class WrongProductType extends Result<UseCaseError> {
    constructor(productId: string) {
      super(false, {
        message: `Product ${productId} is not subscription.`,
      } as UseCaseError);
    }
  }

  export class DifferentProduct extends Result<UseCaseError> {
    constructor(productId: string, currentProduct: string) {
      super(false, {
        message: `Payment for product ${productId} is different than current client subscription ${currentProduct}`,
      } as UseCaseError);
    }
  }

  export class InvoiceAlreadyHandled extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Invoice with id ${id} is already handled for selected subscription.`,
      } as UseCaseError);
    }
  }
}
