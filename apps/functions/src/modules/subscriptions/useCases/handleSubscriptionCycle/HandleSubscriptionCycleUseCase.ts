import * as functions from 'firebase-functions';
import { StripeUseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { HandleSubscriptionCycleDTO } from './HandleSubscriptionCycleDTO';
import { HandleSubscriptionCycleErrors } from './HandleSubscriptionCycleErrors';
import Stripe from 'stripe';
import {
  planDetailsFromStripeSubscription,
  planDetailsToDocument,
  ShortSubscriptionInfo,
  SubscriptionEventType,
  UserDocument,
  UserSubscriptionInterval,
} from '@akademiasaas/shared';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import dayjs from 'dayjs';
import { StripeInvoiceWithId } from 'shared/models/stripe';

type Response = Either<
  AppError.UnexpectedError | HandleSubscriptionCycleErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
  stripeProductId: string;
};

export class HandleSubscriptionCycleUseCase
  implements StripeUseCase<HandleSubscriptionCycleDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute({ invoice }: HandleSubscriptionCycleDTO): Promise<Response> {
    const { usersRepository, logger, paymentClient, businessEventsService, stripeProductId } =
      this.dependencies;

    if (!invoice.subscription) {
      return left(new HandleSubscriptionCycleErrors.NotFound(`subscription`, invoice.id));
    }

    if (invoice.lines.data[0].price?.product !== stripeProductId) {
      logger.info(`Invoice is not connected with application product ${stripeProductId}`);

      return right(Result.ok({ status: 'ok' }));
    }

    logger.debug(`Start handle new invoice from Stripe with reason ${invoice.billing_reason}`);

    if (!invoice.customer_email) {
      return left(new HandleSubscriptionCycleErrors.MissingData('customer email', invoice.id));
    }

    let user = await usersRepository.findUserByEmail(invoice.customer_email);

    if (!user) {
      logger.debug(
        `User with ${invoice.customer_email} (id: ${invoice.customer}) email not exists. Trying fetch customer from stripe and retrieve by saved uid in metadata`
      );
      const stripeCustomer = await paymentClient.customers.retrieve(invoice.customer as string);
      if (!stripeCustomer.deleted && stripeCustomer.metadata.uid) {
        user = await usersRepository.findUserById(stripeCustomer.metadata.uid);
      }
    }

    if (!user) {
      return left(new HandleSubscriptionCycleErrors.NotFound('user', invoice.customer_email));
    }

    const subscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;

    if (user.subscription?.id && user.subscription?.id !== subscriptionId) {
      return left(
        new HandleSubscriptionCycleErrors.DifferentProduct(
          subscriptionId,
          user.subscription?.id || 'none'
        )
      );
    }

    const subscription = await paymentClient.subscriptions.retrieve(subscriptionId);

    if (invoice.lines.data.every((item) => item.proration)) {
      return this.handleProrationInvoice(user, subscription, invoice);
    }

    const payment = invoice.lines.data.find((item) => !item.proration);
    const isSubscriptionPlanUpdate = invoice.billing_reason === 'subscription_update';

    if (!payment || !payment.price) {
      return left(new HandleSubscriptionCycleErrors.MissingData('product id', invoice.id));
    }

    if (invoice.billing_reason === 'subscription_create') {
      logger.debug('Start updating subscription about new selected plan...');

      const customer = await paymentClient.customers.retrieve(invoice.customer as string);

      if (customer.deleted) {
        logger.warn('Customer is already deleted. Skip processing subscription.');

        return left(
          new HandleSubscriptionCycleErrors.MissingData(
            'active customer',
            invoice.customer as string
          )
        );
      }

      const planDetails = planDetailsFromStripeSubscription(subscription, payment.price);

      await usersRepository.updateUser(user.uid, {
        subscription: {
          ...(user.subscription ?? {}),
          defaultPaymentMethod:
            (customer.invoice_settings.default_payment_method as string) || null,
          priceId: payment.price?.id || '',
          updatedAt: dayjs().unix(),
          currentPeriodStart: payment.period.start,
          currentPeriodEnd: payment.period.end,
          id: subscriptionId,
          status: subscription.status,
          latestConnectedInvoiceId: invoice.id,
          requiresAction: null,
          plan: planDetailsToDocument(planDetails),
        },
      });

      await usersRepository.upsertSubscriptionData(user.uid, subscription.id, subscription);

      logger.info('Successfully updated user subscription info');

      await usersRepository.addSubscriptionInvoice(user.uid, invoice);

      logger.info(`Successfully save new invoice ${invoice.id}`);

      await businessEventsService.publish({
        eventType: SubscriptionEventType.InvoicePaid,
        payload: {
          email: user.email,
          userId: user.uid,
          country: user.country ?? 'PL',
          priceId: subscription.items.data[0].price.id,
          stripeCustomerId: user.stripeCustomerId!,
          amount: invoice.amount_paid / 100,
          billingReason: invoice.billing_reason,
          currency: invoice.currency,
          invoiceId: invoice.id,
          userEmail: invoice.customer_email || user.email,
          plan: planDetails.name,
          interval: (subscription.items.data[0].price.recurring?.interval ??
            'month') as UserSubscriptionInterval,
        },
      });

      return right(Result.ok({ status: 'ok' }));
    }

    if (user.subscription && isSubscriptionPlanUpdate) {
      logger.debug('Start updating subscription about new selected plan...');

      const planDetails = planDetailsFromStripeSubscription(subscription, payment.price);

      await usersRepository.updateUser(user.uid, {
        subscription: {
          ...(user.subscription ?? {}),
          currentPeriodStart: payment.period.start,
          currentPeriodEnd: payment.period.end,
          id: subscriptionId,
          requiresAction: null,
          status: subscription.status,
          latestConnectedInvoiceId: invoice.id,
          plan: planDetailsToDocument(planDetails),
        } as ShortSubscriptionInfo,
      });

      await usersRepository.upsertSubscriptionData(user.uid, subscription.id, subscription);

      logger.info('Successfully updated user subscription info');

      await usersRepository.addSubscriptionInvoice(user.uid, invoice);

      logger.info(`Successfully save new invoice ${invoice.id}`);

      await businessEventsService.publish({
        eventType: SubscriptionEventType.InvoicePaid,
        payload: {
          email: user.email,
          userId: user.uid,
          country: user.country ?? 'PL',
          priceId: subscription.items.data[0].price.id,
          stripeCustomerId: user.stripeCustomerId!,
          amount: invoice.amount_paid / 100,
          billingReason: invoice.billing_reason,
          currency: invoice.currency,
          userEmail: invoice.customer_email || user.email,
          invoiceId: invoice.id,
          plan: planDetails.name,
          interval: (subscription.items.data[0].price.recurring?.interval ??
            'month') as UserSubscriptionInterval,
        },
      });

      return right(Result.ok({ status: 'ok' }));
    }

    if (user.subscription && invoice.billing_reason === 'subscription_cycle') {
      logger.debug('Start updating info about next subscription cycle...');

      const planDetails = planDetailsFromStripeSubscription(subscription, payment.price);

      await usersRepository.updateUser(user.uid, {
        subscription: {
          ...(user.subscription ?? {}),
          currentPeriodStart: payment.period.start,
          currentPeriodEnd: payment.period.end,
          id: subscriptionId,
          requiresAction: null,
          latestConnectedInvoiceId: invoice.id,
          priceId: typeof payment.price === 'string' ? payment.price : (payment.price?.id ?? ''),
          status: subscription.status,
          plan: planDetailsToDocument(planDetails),
        },
      });

      await usersRepository.upsertSubscriptionData(user.uid, subscription.id, subscription);

      logger.info('Successfully updated user subscription info');

      await usersRepository.addSubscriptionInvoice(user.uid, invoice);

      logger.info(`Successfully save new invoice ${invoice.id}`);

      await businessEventsService.publish({
        eventType: SubscriptionEventType.InvoicePaid,
        payload: {
          email: user.email,
          userId: user.uid,
          country: user.country ?? 'PL',
          priceId: subscription.items.data[0].price.id,
          stripeCustomerId: user.stripeCustomerId!,
          amount: invoice.amount_paid / 100,
          billingReason: invoice.billing_reason,
          currency: invoice.currency,
          invoiceId: invoice.id,
          plan: planDetails.name,
          userEmail: invoice.customer_email || user.email,
          interval: (subscription.items.data[0].price.recurring?.interval ??
            'month') as UserSubscriptionInterval,
        },
      });

      return right(Result.ok({ status: 'ok' }));
    }

    return right(Result.ok({ status: 'ok' }));
  }

  private async handleProrationInvoice(
    user: UserDocument,
    subscription: Stripe.Subscription,
    invoice: StripeInvoiceWithId
  ): Promise<Response> {
    const { usersRepository, logger, businessEventsService } = this.dependencies;

    logger.debug('Handling immediate subscription ugrade invoice...');

    const invoiceCharge = invoice.lines.data.find(
      (item) => item.proration_details?.credited_items === null
    );
    if (!invoiceCharge?.price) {
      return left(
        new HandleSubscriptionCycleErrors.MissingData('invoice charge price', invoice.id)
      );
    }

    const planDetails = planDetailsFromStripeSubscription(subscription, invoiceCharge.price);

    await usersRepository.updateUser(user.uid, {
      subscription: {
        ...(user.subscription ?? {}),
        currentPeriodStart: invoiceCharge.period.start,
        currentPeriodEnd: invoiceCharge.period.end,
        id: subscription.id,
        requiresAction: null,
        status: subscription.status,
        latestConnectedInvoiceId: invoice.id,
        priceId: invoiceCharge.price.id,
        plan: planDetailsToDocument(planDetails),
      } as ShortSubscriptionInfo,
    });

    await usersRepository.upsertSubscriptionData(user.uid, subscription.id, subscription);

    logger.info('Successfully updated user subscription info');

    await usersRepository.addSubscriptionInvoice(user.uid, invoice);

    logger.info(`Successfully save new invoice ${invoice.id}`);

    await businessEventsService.publish({
      eventType: SubscriptionEventType.InvoicePaid,
      payload: {
        email: user.email,
        userId: user.uid,
        country: user.country ?? 'PL',
        priceId: subscription.items.data[0].price.id,
        stripeCustomerId: user.stripeCustomerId!,
        amount: invoice.amount_paid / 100,
        billingReason: invoice.billing_reason,
        currency: invoice.currency,
        userEmail: invoice.customer_email || user.email,
        invoiceId: invoice.id,
        plan: planDetails.name,
        interval: (subscription.items.data[0].price.recurring?.interval ??
          'month') as UserSubscriptionInterval,
      },
    });

    return right(Result.ok({ status: 'ok' }));
  }
}
