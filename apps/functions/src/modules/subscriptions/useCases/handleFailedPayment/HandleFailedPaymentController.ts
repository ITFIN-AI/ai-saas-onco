import { logger } from 'firebase-functions';
import { HandleFailedPaymentUseCase } from './HandleFailedPaymentUseCase';
import { HandleFailedPaymentErrors } from './HandleFailedPaymentErrors';
import { StripeEventController } from '../../../../shared/infra/http/StripeEventController';
import Stripe from 'stripe';
import { StripeInvoiceWithId } from 'shared/models/stripe';

export class HandleFailedPaymentController extends StripeEventController {
  constructor(private useCase: HandleFailedPaymentUseCase) {
    super();
  }

  async executeImpl(event: Stripe.Event) {
    try {
      logger.debug(`Handling stripe event ${JSON.stringify(event)}`);
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice?.id) {
        throw new HandleFailedPaymentErrors.DtoValidationError('invoice.id');
      }
      const result = await this.useCase.execute({ invoice: invoice as StripeInvoiceWithId });
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case HandleFailedPaymentErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.message);
      }
    }
  }
}
