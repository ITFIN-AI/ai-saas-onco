import { logger } from 'firebase-functions';
import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { CheckSubscriptionInvoiceUseCase } from './CheckSubscriptionInvoiceUseCase';
import { validator } from './CheckSubscriptionInvoiceDTOValidator';
import { CheckSubscriptionInvoiceErrors } from './CheckSubscriptionInvoiceErrors';

export class CheckSubscriptionInvoiceController extends CloudFunctionController {
  constructor(private useCase: CheckSubscriptionInvoiceUseCase) {
    super();
  }

  async executeImpl(payload: unknown, user: AuthenticatedUser) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto, user.uid);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue().invoice);
      }
    } catch (err) {
      switch (err.constructor) {
        case CheckSubscriptionInvoiceErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case CheckSubscriptionInvoiceErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
