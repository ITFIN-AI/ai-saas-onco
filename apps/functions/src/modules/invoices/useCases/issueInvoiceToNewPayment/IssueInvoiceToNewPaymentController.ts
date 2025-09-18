import { logger } from 'firebase-functions';
import { IssueInvoiceToNewPaymentUseCase } from './IssueInvoiceToNewPaymentUseCase';
import { validator } from './IssueInvoiceToNewPaymentDTOValidator';
import { IssueInvoiceToNewPaymentErrors } from './IssueInvoiceToNewPaymentErrors';
import { PubSubEventController } from 'shared/infra/http/PubSubEventController';

export class IssueInvoiceToNewPaymentController extends PubSubEventController {
  constructor(private useCase: IssueInvoiceToNewPaymentUseCase) {
    super();
  }

  async executeImpl(payload: unknown) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case IssueInvoiceToNewPaymentErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case IssueInvoiceToNewPaymentErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
