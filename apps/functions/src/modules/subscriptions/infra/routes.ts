import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { logger } from 'firebase-functions';
import { env, STRIPE_API_VERSION } from 'config';
import { CreateSubscriptionForUserController } from 'modules/subscriptions/useCases/createSubscriptionForUser/CreateSubscriptionForUserController';
import { CreateSubscriptionForUserUseCase } from 'modules/subscriptions/useCases/createSubscriptionForUser/CreateSubscriptionForUserUseCase';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { CreateBillingCustomerPortalController } from 'modules/subscriptions/useCases/createBillingCustomerPortal/CreateBillingCustomerPortalController';
import { CreateBillingCustomerPortalUseCase } from 'modules/subscriptions/useCases/createBillingCustomerPortal/CreateBillingCustomerPortalUseCase';
import { HandleSubscriptionCycleController } from 'modules/subscriptions/useCases/handleSubscriptionCycle/HandleSubscriptionCycleController';
import { HandleSubscriptionCycleUseCase } from 'modules/subscriptions/useCases/handleSubscriptionCycle/HandleSubscriptionCycleUseCase';
import { HandleSubscriptionStatusUpdateController } from 'modules/subscriptions/useCases/handleSubscriptionStatusUpdate/HandleSubscriptionStatusUpdateController';
import { HandleFailedPaymentController } from 'modules/subscriptions/useCases/handleFailedPayment/HandleFailedPaymentController';
import { HandleFailedPaymentUseCase } from '../useCases/handleFailedPayment/HandleFailedPaymentUseCase';
import { BusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { HandleCustomerUpdateController } from 'modules/subscriptions/useCases/handleCustomerUpdate/HandleCustomerUpdateController';
import { HandleCustomerUpdateUseCase } from 'modules/subscriptions/useCases/handleCustomerUpdate/HandleCustomerUpdateUseCase';
import { ChangeSubscriptionPlanController } from 'modules/subscriptions/useCases/changeSubscriptionPlan/ChangeSubscriptionPlanController';
import { ChangeSubscriptionPlanUseCase } from 'modules/subscriptions/useCases/changeSubscriptionPlan/ChangeSubscriptionPlanUseCase';
import { HandleAddedSubscriptionController } from 'modules/subscriptions/useCases/handleAddedSubscription/HandleAddedSubscriptionController';
import { HandleAddedSubscriptionUseCase } from 'modules/subscriptions/useCases/handleAddedSubscription/HandleAddedSubscriptionUseCase';
import { UpdateCustomerDataController } from 'modules/subscriptions/useCases/updateCustomerData/UpdateCustomerDataController';
import { UpdateCustomerDataUseCase } from '../useCases/updateCustomerData/UpdateCustomerDataUseCase';
import { CheckSubscriptionInvoiceController } from 'modules/subscriptions//useCases/checkSubscriptionInvoice/CheckSubscriptionInvoiceController';
import { CheckSubscriptionInvoiceUseCase } from 'modules/subscriptions//useCases/checkSubscriptionInvoice/CheckSubscriptionInvoiceUseCase';
import { PubSub } from '@google-cloud/pubsub';
import { DEFAULT_FIREBASE_REGION } from '@akademiasaas/shared';
import { db } from 'config';
import bodyParser from 'body-parser';
const pubsub = new PubSub({ projectId: env.projectId });

const getStripe = () =>
  new Stripe(env.stripe.apiKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

const usersRepository = new FirebaseUsersRepository({ db });
const businessEventsService = new BusinessEventsService({
  pubSubClient: pubsub,
  logger: functions.logger,
  businessEventsConfig: { domain: env.domain, topic: env.pubsub.businessEvents },
});

const app = express();

app.use(cors({ origin: true }));
// Use JSON parser for all non-webhook routes
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.post('/webhook', async (req: express.Request, res: express.Response) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;
  try {
    if (!sig) {
      throw new Error('Empty signature header');
    }
    event = stripe.webhooks.constructEvent(
      // @ts-ignore
      req.rawBody,
      sig,
      env.stripe.webhookSecret
    );
  } catch (err) {
    functions.logger.error(err);
    functions.logger.error('⚠️  Webhook signature verification failed.');
    functions.logger.error('⚠️  Check the env file and enter the correct webhook secret.');
    res.status(400).send(`Webhook Error: ${err.message}`);

    return;
  }

  logger.info(`New event to handle ${event.type}`, { event });

  switch (event.type) {
    case 'customer.subscription.created':
      logger.info(`Subscription created`, { subscription: event.data.object });
      await new HandleAddedSubscriptionController(
        new HandleAddedSubscriptionUseCase({
          logger: functions.logger,
          paymentClient: stripe,
          businessEventsService,
          usersRepository,
        })
      ).execute(event);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await new HandleSubscriptionStatusUpdateController({
        logger: functions.logger,
        paymentClient: stripe,
        businessEventsService,
        usersRepository,
      }).execute(event);
      logger.info(`Subscription updated`, { subscription: event.data.object });
      break;
    case 'invoice.paid':
      logger.info(`Invoice paid`, { invoice: event.data.object });
      logger.debug('Handle invoice paid');
      await new HandleSubscriptionCycleController(
        new HandleSubscriptionCycleUseCase({
          logger: functions.logger,
          paymentClient: stripe,
          businessEventsService,
          usersRepository,
          stripeProductId: env.stripe.productId,
        })
      ).execute(event);

      break;
    case 'invoice.payment_failed':
      logger.info(`Invoice payment failed`, { invoice: event.data.object });
      await new HandleFailedPaymentController(
        new HandleFailedPaymentUseCase({
          logger: functions.logger,
          paymentClient: stripe,
          businessEventsService,
          usersRepository,
          stripeProductId: env.stripe.productId,
        })
      ).execute(event);
      break;
    case 'customer.updated':
      logger.info('Customer updated', { customer: event.data.object });
      await new HandleCustomerUpdateController(
        new HandleCustomerUpdateUseCase({
          logger: functions.logger,
          paymentClient: stripe,
          businessEventsService,
          usersRepository,
        })
      ).execute(event);
      break;
    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export const stripeEndpoint = functions.region(DEFAULT_FIREBASE_REGION).https.onRequest(app);

export const onActivateTrial = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new CreateSubscriptionForUserController(
      new CreateSubscriptionForUserUseCase({
        logger: functions.logger,
        paymentClient: getStripe(),
        usersRepository,
        businessEventsService,
      })
    );

    return controller.execute({ userId: context.auth?.uid });
  });

export const onCustomerDataUpdate = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new UpdateCustomerDataController(
      new UpdateCustomerDataUseCase({
        logger: functions.logger,
        paymentClient: getStripe(),
        usersRepository,
      })
    );

    return controller.execute(data, context);
  });

export const createBillingCustomerSession = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new CreateBillingCustomerPortalController(
      new CreateBillingCustomerPortalUseCase({
        logger: functions.logger,
        usersRepository,
        domain: env.domain,
        paymentClient: getStripe(),
      })
    );

    return controller.execute(data, context);
  });

export const checkSubscriptionInvoice = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new CheckSubscriptionInvoiceController(
      new CheckSubscriptionInvoiceUseCase({
        paymentClient: getStripe(),
        usersRepository,
      })
    );

    return controller.execute(data, context);
  });

export const changeSubscriptionPlan = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new ChangeSubscriptionPlanController(
      new ChangeSubscriptionPlanUseCase({
        logger: functions.logger,
        usersRepository,
        businessEventsService,
        paymentClient: getStripe(),
      })
    );

    return controller.execute(data, context);
  });
