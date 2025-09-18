import { logger } from 'firebase-functions';
import { HandleAddedSubscriptionUseCase } from './HandleAddedSubscriptionUseCase';
import { validator } from './HandleAddedSubscriptionDTOValidator';
import { HandleAddedSubscriptionErrors } from './HandleAddedSubscriptionErrors';
import { StripeEventController } from 'shared/infra/http/StripeEventController';

export class HandleAddedSubscriptionController extends StripeEventController {
  constructor(private useCase: HandleAddedSubscriptionUseCase) {
    super();
  }

  async executeImpl(event: unknown) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(event)}`);
      const dto = validator({
        subscription: (event as { data?: { object?: unknown } }).data?.object,
      });
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case HandleAddedSubscriptionErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case HandleAddedSubscriptionErrors.UnsupportedFeature:
          return this.todo();
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
