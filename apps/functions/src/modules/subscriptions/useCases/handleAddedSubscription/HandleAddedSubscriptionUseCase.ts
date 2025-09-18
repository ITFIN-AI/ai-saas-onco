import * as functions from 'firebase-functions';
import { UseCase } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { HandleAddedSubscriptionDTO } from './HandleAddedSubscriptionDTO';
import { HandleAddedSubscriptionErrors } from './HandleAddedSubscriptionErrors';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import {
  planDetailsFromStripeSubscription,
  planDetailsToDocument,
  UserDocument,
} from '@akademiasaas/shared';

type Response = Either<
  AppError.UnexpectedError | HandleAddedSubscriptionErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
};

export class HandleAddedSubscriptionUseCase
  implements UseCase<HandleAddedSubscriptionDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute({ subscription }: HandleAddedSubscriptionDTO): Promise<Response> {
    const { logger, paymentClient, usersRepository } = this.dependencies;

    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    logger.debug(`Handle new added subscription for customer ${customerId}`, {
      customer: subscription.customer,
      subscription,
    });

    const customer = await paymentClient.customers.retrieve(customerId);

    if (customer.deleted) {
      logger.warn('Customer is already deleted. Skip processing subscription.');

      return left(new HandleAddedSubscriptionErrors.MissingData('active customer', customerId));
    }

    let userDoc: null | UserDocument = null;

    if (customer.metadata.uid) {
      logger.debug(`Fetching user by uid ${customer.metadata.uid}`, { customer });
      userDoc = await usersRepository.findUserById(customer.metadata.uid);
    } else {
      if (!customer.email) {
        logger.warn("Customer doesn't have email. Skip processing subscription.");

        return left(new HandleAddedSubscriptionErrors.MissingData('customer email', customerId));
      }
      logger.debug(`Fetching user by email ${customer.email}`, { customer });
      userDoc = await usersRepository.findUserByEmail(customer.email);
    }

    if (!userDoc) {
      logger.warn("Couldn't find user document.");

      return left(new HandleAddedSubscriptionErrors.NotFound('user document', customer.id));
    }

    if (userDoc.stripeCustomerId !== customer.id) {
      logger.info(`User has different stripe customer id, updating to the new one ${customer.id}`, {
        previous: userDoc.stripeCustomerId,
        current: customer.id,
      });

      await usersRepository.updateUser(userDoc.uid, { stripeCustomerId: customer.id });
    }

    if (userDoc.subscription?.id === subscription.id) {
      logger.info(
        'Current saved subscription has the same id like in that event. Skip processing.'
      );

      return right(Result.ok({ status: 'ok' }));
    }

    const planDetails = planDetailsFromStripeSubscription(
      subscription,
      subscription.items.data[0].price
    );

    await usersRepository.upsertSubscriptionData(userDoc.uid, subscription.id, subscription);
    await usersRepository.updateUser(userDoc.uid, {
      subscription: {
        status: subscription.status,
        id: subscription.id,
        currentPeriodEnd: subscription.current_period_end,
        currentPeriodStart: subscription.current_period_start,
        priceId: subscription.items.data[0].price.id,
        plan: planDetailsToDocument(planDetails),
        latestConnectedInvoiceId: null,
        updatedAt: subscription.created,
        defaultPaymentMethod: (customer.invoice_settings.default_payment_method as string) || null,
      },
    });

    logger.info('Successfully process added subscription by Stripe to client');

    return right(Result.ok({ status: 'ok' }));
  }
}
