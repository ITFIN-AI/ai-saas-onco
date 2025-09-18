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
  getPlanDetails,
  planDetailsToDocument,
  SubscriptionEventType,
  SubscriptionPlan,
  UserSubscriptionInterval,
} from '@akademiasaas/shared';
import dayjs from 'dayjs';

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

export class HandleEndOfSubscriptionUseCase
  implements StripeUseCase<HandleSubscriptionStatusUpdateDTO, Promise<Response>>
{
  constructor(protected dependencies: Dependencies) {}

  async execute({ subscription }: HandleSubscriptionStatusUpdateDTO): Promise<Response> {
    const { logger, paymentClient, usersRepository, businessEventsService } = this.dependencies;

    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    logger.debug(`Fetching customer from Stripe ${customerId}...`);

    const subscriptionCustomer = await paymentClient.customers.retrieve(customerId);

    logger.debug(`Fetched from Stripe ${subscriptionCustomer.id}`, { subscriptionCustomer });

    if (subscriptionCustomer.deleted || !subscriptionCustomer.email) {
      logger.debug('Deleted', { deleted: subscriptionCustomer.deleted });

      return left(new HandleSubscriptionCycleErrors.MissingData('customer email', subscription.id));
    }

    const user = await usersRepository.findUserByEmail(subscriptionCustomer.email);

    logger.debug(`Fetched user from firestore ${user?.uid}`, { user });

    if (!user) {
      return left(new HandleSubscriptionCycleErrors.NotFound('user', subscriptionCustomer.email));
    }

    logger.debug('Start updating status of subscription...');

    await usersRepository.updateUser(user.uid, {
      subscription: {
        status: 'active',
        plan: planDetailsToDocument(getPlanDetails(SubscriptionPlan.Free)),
        currentPeriodStart: dayjs().unix(),
        currentPeriodEnd: null,
        updatedAt: dayjs().unix(),
        id: null,
        defaultPaymentMethod: user?.subscription?.defaultPaymentMethod || null,
        priceId: null,
      },
    });

    const [item] = subscription.items.data;

    await businessEventsService.publish({
      eventType: SubscriptionEventType.EndOfSubscription,
      payload: {
        email: user.email,
        userId: user.uid,
        country: user.country ?? 'PL',
        priceId: item.price.id,
        stripeCustomerId: user.stripeCustomerId ?? '',
        amount: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
        currency: item.price.currency,
        plan: item.price.metadata.levels as SubscriptionPlan,
        interval: (item.price.recurring?.interval ?? 'month') as UserSubscriptionInterval,
      },
    });

    logger.info('Successfully downgrade subscription to free', { item });

    return right(Result.ok({ status: 'ok' }));
  }
}
