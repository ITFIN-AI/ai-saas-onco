import { Result } from 'shared/core/Result';
import { UseCaseError } from 'shared/core/UseCaseError';

export namespace IssueInvoiceToNewPaymentErrors {
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

  export class WrongStatus extends Result<UseCaseError> {
    constructor(invoiceId: string, status: string) {
      super(false, {
        message: `The invoice ${invoiceId} has wrong status ${status}`,
      } as UseCaseError);
    }
  }
}
