import { logger } from 'firebase-functions';
import { HandleCustomerUpdateUseCase } from './HandleCustomerUpdateUseCase';
import { HandleCustomerUpdateErrors } from './HandleCustomerUpdateErrors';
import { StripeEventController } from 'shared/infra/http/StripeEventController';
import Stripe from 'stripe';

export class HandleCustomerUpdateController extends StripeEventController {
  constructor(private useCase: HandleCustomerUpdateUseCase) {
    super();
  }

  async executeImpl(event: Stripe.Event) {
    try {
      logger.debug(`Handling stripe event ${JSON.stringify(event)}`);
      const customer = event.data.object as Stripe.Customer;
      const previous = event.data.previous_attributes as Partial<Stripe.Customer>;
      const result = await this.useCase.execute({ customer, previous });
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case HandleCustomerUpdateErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message || err.message);
      }
    }
  }
}
