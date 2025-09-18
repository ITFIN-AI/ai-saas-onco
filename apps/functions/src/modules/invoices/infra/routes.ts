import * as functions from 'firebase-functions';
import {
  BusinessEvent,
  DEFAULT_FIREBASE_REGION,
  SubscriptionEventType,
} from '@akademiasaas/shared';
import { IssueInvoiceToNewPaymentController } from 'modules/invoices/useCases/issueInvoiceToNewPayment/IssueInvoiceToNewPaymentController';
import { IssueInvoiceToNewPaymentUseCase } from 'modules/invoices/useCases/issueInvoiceToNewPayment/IssueInvoiceToNewPaymentUseCase';
import { FakturowniaInvoiceService } from 'shared/infra/services/invoices/FakturowniaInvoiceService';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { env, db } from 'config';

const usersRepository = new FirebaseUsersRepository({ db });
const invoicesService = new FakturowniaInvoiceService({
  logger: functions.logger,
  accountData: {
    apiKey: env.fakturownia.apiKey,
    apiUrl: env.fakturownia.apiUrl,
    departmentId: env.fakturownia.departmentId,
  },
});

export const subscribeToBusinessEvents = functions
  .runWith({ timeoutSeconds: 210, memory: '512MB' })
  .region(DEFAULT_FIREBASE_REGION)
  .pubsub.topic(env.pubsub.invoicesEvents)
  .onPublish(async (message) => {
    const messageBody: BusinessEvent | null = message.data
      ? JSON.parse(Buffer.from(message.data, 'base64').toString())
      : null;
    const { logger } = functions;
    logger.debug('Message body:', messageBody, message.attributes);

    if (messageBody?.eventName === SubscriptionEventType.InvoicePaid) {
      logger.info(`Start processing new invoice ${messageBody.eventId} for paid subscription`);

      const controller = new IssueInvoiceToNewPaymentController(
        new IssueInvoiceToNewPaymentUseCase({
          logger,
          usersRepository,
          invoicesService,
        })
      );
      await controller.execute(messageBody);
    }
  });
