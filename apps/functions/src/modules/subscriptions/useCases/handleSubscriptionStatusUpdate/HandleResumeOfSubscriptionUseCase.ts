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

export class HandleResumeOfSubscriptionUseCase
  implements StripeUseCase<HandleSubscriptionStatusUpdateDTO, Promise<Response>>
{
  constructor(protected dependencies: Dependencies) {}

  async execute({ subscription }: HandleSubscriptionStatusUpdateDTO): Promise<Response> {
    const { logger, paymentClient, usersRepository } = this.dependencies;

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

    await usersRepository.updateUserField(user.uid, ['subscription', 'cancelAtPeriodEnd'], false);

    logger.info('Successfully update subscription about resume at end info', { item });

    return right(Result.ok({ status: 'ok' }));
  }
}
