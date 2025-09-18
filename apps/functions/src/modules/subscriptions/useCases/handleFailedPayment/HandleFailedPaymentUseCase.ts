import * as functions from 'firebase-functions';
import { StripeUseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { HandleFailedPaymentDTO } from './HandleFailedPaymentDTO';
import { HandleFailedPaymentErrors } from './HandleFailedPaymentErrors';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { HandleSubscriptionCycleErrors } from '../handleSubscriptionCycle/HandleSubscriptionCycleErrors';
import {
  planDetailsFromStripeSubscription,
  planDetailsToDocument,
  RequiresAction,
  SubscriptionEventType,
  UserSubscriptionInterval,
} from '@akademiasaas/shared';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import dayjs from 'dayjs';

type Response = Either<
  AppError.UnexpectedError | HandleFailedPaymentErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
  stripeProductId: string;
};

export class HandleFailedPaymentUseCase
  implements StripeUseCase<HandleFailedPaymentDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute({ invoice }: HandleFailedPaymentDTO): Promise<Response> {
    const { logger, paymentClient, usersRepository, businessEventsService, stripeProductId } =
      this.dependencies;

    if (!invoice.subscription) {
      return left(new HandleSubscriptionCycleErrors.NotFound(`subscription`, invoice.id));
    }

    if (invoice.lines.data[0].price?.product !== stripeProductId) {
      logger.info(`Invoice is not connected with application product ${stripeProductId}`);

      return right(Result.ok({ status: 'ok' }));
    }

    if (invoice.billing_reason !== 'subscription_cycle') {
      logger.warn(
        'Invoice event is not connected with subscription cycle. Skip handling this event.'
      );

      return right(Result.ok({ status: 'ok' }));
    }

    if (!invoice.customer_email) {
      return left(new HandleSubscriptionCycleErrors.MissingData('customer email', invoice.id));
    }

    if (!invoice.payment_intent) {
      return left(new HandleSubscriptionCycleErrors.MissingData('payment intent', invoice.id));
    }

    const paymentIntentId =
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent.id;

    const paymentIntent = await paymentClient.paymentIntents.retrieve(paymentIntentId);

    logger.debug('Fetched payment intent:', { paymentIntent });

    let requiresAction: RequiresAction | undefined = undefined;

    if (
      paymentIntent.status === 'requires_confirmation' ||
      paymentIntent.status === 'requires_action'
    ) {
      requiresAction = {
        ...paymentIntent.next_action,
        status: 'confirm_transaction',
        url: paymentIntent.next_action?.redirect_to_url?.url ?? '',
      };
    }

    const payment = invoice.lines.data.find((item) => !item.proration);

    if (!payment || !payment.price) {
      return left(new HandleSubscriptionCycleErrors.MissingData('product id', invoice.id));
    }

    const user = await usersRepository.findUserByEmail(invoice.customer_email);

    if (!user) {
      return left(
        new HandleSubscriptionCycleErrors.CannotFoundOwnerAccount(invoice.customer_email)
      );
    }

    const subscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
    const subscription = await paymentClient.subscriptions.retrieve(subscriptionId);

    logger.debug('Start updating info about next subscription cycle...');
    const planDetails = planDetailsFromStripeSubscription(subscription, payment.price);

    await usersRepository.updateUser(user.uid, {
      subscription: {
        ...(user.subscription ?? {}),
        defaultPaymentMethod: user.subscription?.defaultPaymentMethod ?? null,
        updatedAt: dayjs().unix(),
        priceId: payment.price
          ? typeof payment.price === 'string'
            ? payment.price
            : payment.price.id
          : '',
        currentPeriodStart: payment.period.start,
        currentPeriodEnd: payment.period.end,
        id: subscriptionId,
        status: subscription.status,
        latestConnectedInvoiceId: invoice.id,
        plan: planDetailsToDocument(planDetails),
        requiresAction: requiresAction || {
          status: 'insufficient_funds',
        },
      },
    });

    logger.info('Successfully update info about subscription');

    await usersRepository.addSubscriptionInvoice(user.uid, invoice);

    logger.info(`Successfully save new invoice ${invoice.id}`);

    await businessEventsService.publish({
      eventType: SubscriptionEventType.InvoicePaymentFailed,
      payload: {
        email: user.email,
        userId: user.uid,
        country: user.country ?? 'PL',
        priceId: subscription.items.data[0].price.id,
        stripeCustomerId: user.stripeCustomerId!,
        amount: invoice.amount_due / 100,
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
}
