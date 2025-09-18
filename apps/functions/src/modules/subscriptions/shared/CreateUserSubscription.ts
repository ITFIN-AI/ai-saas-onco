import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import {
  getPlanDetails,
  planDetailsFromStripeSubscription,
  planDetailsToDocument,
  SubscriptionEventType,
  SubscriptionPlan,
  UserDocument,
} from '@akademiasaas/shared';
import dayjs from 'dayjs';

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  usersRepository: UsersRepository;
  businessEventsService: IBusinessEventsService;
};

export class CreateUserSubscription {
  deps: Dependencies;

  constructor(dependencies: Dependencies) {
    this.deps = dependencies;
  }

  protected async addFreeSubscription(userId: string, userDocument: UserDocument) {
    const { logger, paymentClient, usersRepository } = this.deps;

    let customerId = userDocument.stripeCustomerId;

    let customer: Stripe.Customer;
    if (!customerId) {
      logger.debug('Creating new Stripe customer');

      const customers = await paymentClient.customers.search({
        query: `email:"${userDocument.email}"`,
        expand: ['data.subscriptions'],
      });

      const notDeletedCustomers = customers.data.filter((customer) => !customer.deleted);

      if (notDeletedCustomers[0]) {
        logger.warn('Found existing customer with the same email. Using it...');

        customer = notDeletedCustomers[0];

        await paymentClient.customers.update(customer.id, {
          metadata: {
            uid: userId,
          },
          ...(customer.address?.country || userDocument.ip
            ? {}
            : { address: { country: 'PL', line1: '' } }),
        });

        customerId = customer.id;

        await usersRepository.updateUser(userId, {
          stripeCustomerId: customerId,
        });

        const hasActiveSubscription = customer.subscriptions?.data.some((subscription) =>
          subscription.items.data.some((item) => item.price.metadata?.levels)
        );

        if (hasActiveSubscription) {
          return true;
        }
      } else {
        customer = await paymentClient.customers.create({
          email: userDocument.email,
          name: `${userDocument.firstName} ${userDocument.lastName ?? ''}`,
          metadata: {
            uid: userId,
          },
          tax: { ip_address: userDocument.ip },
          expand: ['tax'],
        });

        customerId = customer.id;
        await usersRepository.updateUser(userId, {
          stripeCustomerId: customerId,
        });
        logger.info(`Created new Stripe customer ${customer.id} for user ${userId}`, { customer });
      }
    } else {
      customer = (await paymentClient.customers.retrieve(customerId)) as Stripe.Customer;
      logger.info('Fetched customer from Stripe', { customer });
    }

    await usersRepository.updateUser(userId, {
      country: customer?.tax?.location?.country ?? 'PL',
      subscription: {
        updatedAt: dayjs().unix(),
        status: 'active',
        id: null,
        priceId: null,
        currentPeriodEnd: null,
        currentPeriodStart: dayjs().unix(),
        plan: planDetailsToDocument(getPlanDetails(SubscriptionPlan.Free)),
        defaultPaymentMethod: customer.invoice_settings.default_payment_method as string | null,
      },
    });

    logger.info(`Successfully created and added free plan to user`);

    return true;
  }

  protected async addStarterSubscription(
    userId: string,
    userDocument: UserDocument,
    selectedPriceId: string
  ) {
    const { logger, paymentClient, usersRepository, businessEventsService } = this.deps;

    let customerId = userDocument.stripeCustomerId;

    let customer: Stripe.Customer;
    if (!customerId) {
      logger.debug('Creating new Stripe customer');

      const customers = await paymentClient.customers.search({
        query: `email:"${userDocument.email}"`,
        expand: ['data.subscriptions'],
      });

      const notDeletedCustomers = customers.data.filter((customer) => !customer.deleted);

      if (notDeletedCustomers[0]) {
        logger.warn('Found existing customer with the same email. Using it...');

        customer = notDeletedCustomers[0];

        await paymentClient.customers.update(customer.id, {
          metadata: {
            uid: userId,
          },
          ...(customer.address?.country || userDocument.ip
            ? {}
            : { address: { country: 'PL', line1: '' } }),
        });

        customerId = customer.id;

        await usersRepository.updateUser(userId, {
          stripeCustomerId: customerId,
        });

        const hasActiveSubscription = customer.subscriptions?.data.find((subscription) =>
          subscription.items.data.some((item) => item.plan.metadata?.levels)
        );

        if (hasActiveSubscription) {
          return hasActiveSubscription;
        }
      } else {
        customer = await paymentClient.customers.create({
          email: userDocument.email,
          name: `${userDocument.firstName} ${userDocument.lastName ?? ''}`,
          metadata: {
            uid: userId,
          },
          ...(userDocument.ip
            ? { tax: { ip_address: userDocument.ip } }
            : { address: { country: 'PL', line1: '' } }),
          expand: ['tax'],
        });

        customerId = customer.id;
        await usersRepository.updateUser(userId, {
          stripeCustomerId: customerId,
        });
        logger.info(`Created new Stripe customer ${customer.id} for user ${userId}`, { customer });
      }
    } else {
      customer = (await paymentClient.customers.retrieve(customerId)) as Stripe.Customer;
      logger.info('Fetched customer from Stripe', { customer });
    }

    const subscription = await paymentClient.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: selectedPriceId,
        },
      ],
      expand: ['latest_invoice.payment_intent'],
      automatic_tax: {
        enabled: true,
      },
    });

    const planDetails = planDetailsFromStripeSubscription(
      subscription,
      subscription.items.data[0].price
    );

    await usersRepository.upsertSubscriptionData(userId, subscription.id, subscription);
    await usersRepository.updateUser(userId, {
      country: customer?.tax?.location?.country ?? 'PL',
      subscription: {
        updatedAt: subscription.created,
        status: subscription.status,
        id: subscription.id,
        priceId: selectedPriceId,
        currentPeriodEnd: subscription.current_period_end,
        currentPeriodStart: subscription.current_period_start,
        plan: planDetailsToDocument(planDetails),
        defaultPaymentMethod: customer.invoice_settings.default_payment_method as string | null,
      },
    });

    if (!selectedPriceId) {
      await businessEventsService.publish({
        eventType: SubscriptionEventType.ActivatedNewTrialSubscription,
        payload: {
          email: userDocument.email,
          userId: userDocument.uid,
          country: customer?.tax?.location?.country ?? 'PL',
          name: `${userDocument.firstName} ${userDocument.lastName ?? ''}`,
          priceId: selectedPriceId,
          stripeCustomerId: customer.id,
          currency: subscription.items.data[0].price.currency,
        } as const,
      });
    }

    logger.info(`Successfully created and added subscription ${subscription.id} to user`);

    return subscription;
  }
}
