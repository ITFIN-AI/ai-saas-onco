import { logger } from 'firebase-functions';
import { HandleSubscriptionStatusUpdateErrors } from './HandleSubscriptionStatusUpdateErrors';
import { StripeEventController } from 'shared/infra/http/StripeEventController';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { HandleEndOfSubscriptionUseCase } from './HandleEndOfSubscriptionUseCase';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { HandlePauseOfCollection } from './HandlePauseOfCollectionUseCase';
import { HandleCancelOfSubscriptionUseCase } from 'modules/subscriptions/useCases/handleSubscriptionStatusUpdate/HandleCancelOfSubscriptionUseCase';
import { HandleResumeOfSubscriptionUseCase } from 'modules/subscriptions/useCases/handleSubscriptionStatusUpdate/HandleResumeOfSubscriptionUseCase';

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
};

export class HandleSubscriptionStatusUpdateController extends StripeEventController {
  constructor(private dependencies: Dependencies) {
    super();
  }

  async executeImpl(event: Stripe.Event) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(event)}`);
      const subscription = event.data.object as Stripe.Subscription;

      if (event.type === 'customer.subscription.deleted') {
        logger.debug(`Start handle end of subscription. Status: ${subscription.status}`);
        const result = await new HandleEndOfSubscriptionUseCase(this.dependencies).execute({
          subscription,
        });
        if (result.isLeft()) {
          throw result.value;
        } else {
          return this.ok(result.value.getValue());
        }
      }

      if (event.data.previous_attributes && 'pause_collection' in event.data.previous_attributes) {
        logger.debug('Handle change pause of collection payment');

        const result = await new HandlePauseOfCollection(this.dependencies).execute({
          subscription,
        });
        if (result.isLeft()) {
          throw result.value;
        } else {
          return this.ok(result.value.getValue());
        }
      }

      if (
        event.data.previous_attributes &&
        'cancel_at_period_end' in event.data.previous_attributes &&
        !(event.data.previous_attributes as Stripe.Subscription).cancel_at_period_end
      ) {
        logger.debug('User cancel subscription at period end');
        const result = await new HandleCancelOfSubscriptionUseCase(this.dependencies).execute({
          subscription,
        });
        if (result.isLeft()) {
          throw result.value;
        } else {
          return this.ok(result.value.getValue());
        }
      }

      if (
        event.data.previous_attributes &&
        'cancel_at_period_end' in event.data.previous_attributes &&
        (event.data.previous_attributes as Stripe.Subscription).cancel_at_period_end
      ) {
        logger.debug('User resume subscription at period end');
        const result = await new HandleResumeOfSubscriptionUseCase(this.dependencies).execute({
          subscription,
        });
        if (result.isLeft()) {
          throw result.value;
        } else {
          return this.ok(result.value.getValue());
        }
      }

      if (event.data.previous_attributes && 'plan' in event.data.previous_attributes) {
        logger.debug('Selected plan has change');

        return this.ok();
      }

      if (!(event.data.previous_attributes && 'status' in event.data.previous_attributes)) {
        logger.debug("Status of subscription doesn't change");

        return this.ok();
      }

      if (subscription.status === 'unpaid' || subscription.status === 'canceled') {
        logger.debug(`Start handle end of subscription. Status: ${subscription.status}`);
        const result = await new HandleEndOfSubscriptionUseCase(this.dependencies).execute({
          subscription,
        });
        if (result.isLeft()) {
          throw result.value;
        } else {
          return this.ok(result.value.getValue());
        }
      }

      return this.ok();
    } catch (err) {
      switch (err.constructor) {
        case HandleSubscriptionStatusUpdateErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message || err.message);
      }
    }
  }
}
