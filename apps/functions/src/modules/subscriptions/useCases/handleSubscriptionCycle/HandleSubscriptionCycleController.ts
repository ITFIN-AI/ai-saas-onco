import { logger } from 'firebase-functions';
import { HandleSubscriptionCycleUseCase } from './HandleSubscriptionCycleUseCase';
import { HandleSubscriptionCycleErrors } from './HandleSubscriptionCycleErrors';
import { StripeEventController } from 'shared/infra/http/StripeEventController';
import Stripe from 'stripe';
import { StripeInvoiceWithId } from 'shared/models/stripe';

export class HandleSubscriptionCycleController extends StripeEventController {
  constructor(private useCase: HandleSubscriptionCycleUseCase) {
    super();
  }

  async executeImpl(event: Stripe.Event) {
    try {
      logger.debug(`Handling stripe event ${JSON.stringify(event)}`);
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice?.id) {
        throw new HandleSubscriptionCycleErrors.DtoValidationError('invoice.id');
      }
      const result = await this.useCase.execute({
        invoice: invoice as StripeInvoiceWithId,
      });
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case HandleSubscriptionCycleErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message || err.message);
      }
    }
  }
}
