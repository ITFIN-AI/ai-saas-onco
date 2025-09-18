import * as functions from 'firebase-functions';
import { StripeUseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { HandleSubscriptionStatusUpdateDTO } from './HandleSubscriptionStatusUpdateDTO';
import { HandleSubscriptionStatusUpdateErrors } from './HandleSubscriptionStatusUpdateErrors';
import { HandleSubscriptionCycleErrors } from '../handleSubscriptionCycle/HandleSubscriptionCycleErrors';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import {
  planDetailsFromStripeSubscription,
  SubscriptionEventType,
  UserSubscriptionInterval,
} from '@akademiasaas/shared';

type Response = Either<
  AppError.UnexpectedError | HandleSubscriptionStatusUpdateErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
};

export class HandleCancelOfSubscriptionUseCase
  implements StripeUseCase<HandleSubscriptionStatusUpdateDTO, Promise<Response>>
{
  constructor(protected dependencies: Dependencies) {}

  async execute({ subscription }: HandleSubscriptionStatusUpdateDTO): Promise<Response> {
    const { logger, paymentClient, usersRepository, businessEventsService } = this.dependencies;

    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    const subscriptionCustomer = await paymentClient.customers.retrieve(customerId);

    const [item] = subscription.items.data;

    if (subscriptionCustomer.deleted || !subscriptionCustomer.email) {
      return left(new HandleSubscriptionCycleErrors.MissingData('customer email', subscription.id));
    }

    const user = await usersRepository.findUserByEmail(subscriptionCustomer.email);

    if (!user) {
      return left(new HandleSubscriptionCycleErrors.NotFound('user', subscriptionCustomer.email));
    }

    await usersRepository.updateUserField(user.uid, ['subscription', 'cancelAtPeriodEnd'], true);

    const plan = planDetailsFromStripeSubscription(subscription, item.price);

    await businessEventsService.publish({
      eventType: SubscriptionEventType.CancelSubscription,
      payload: {
        email: user.email,
        userId: user.uid,
        country: user.country ?? 'PL',
        priceId: item.price.id,
        stripeCustomerId: user.stripeCustomerId ?? '',
        amount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
        currency: item.price.currency,
        plan: plan.name,
        interval: (item.price.recurring?.interval ?? 'month') as UserSubscriptionInterval,
      },
    });

    logger.info('Successfully emit event about subscription cancellation', { item });

    return right(Result.ok({ status: 'ok' }));
  }
}
