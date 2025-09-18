import * as functions from 'firebase-functions';
import { UseCase } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { IssueInvoiceToNewPaymentDTO } from './IssueInvoiceToNewPaymentDTO';
import { IssueInvoiceToNewPaymentErrors } from './IssueInvoiceToNewPaymentErrors';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { InvoiceService } from 'shared/services/InvoiceService';
import { isAxiosError } from 'shared/errors/isAxiosError';

type Response = Either<
  AppError.UnexpectedError | IssueInvoiceToNewPaymentErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  usersRepository: UsersRepository;
  invoicesService: InvoiceService;
};

export class IssueInvoiceToNewPaymentUseCase
  implements UseCase<IssueInvoiceToNewPaymentDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute({ payload }: IssueInvoiceToNewPaymentDTO): Promise<Response> {
    const { logger, usersRepository, invoicesService } = this.dependencies;

    logger.debug(
      `Processing new invoice ${payload.invoiceId} (${payload.amount} ${payload.currency}) for client ${payload.userId}`
    );

    const invoice = await usersRepository.findSubscriptionInvoice(
      payload.userId,
      payload.invoiceId
    );

    const user = await usersRepository.findUserById(payload.userId);

    if (!invoice?.id) {
      return left(new IssueInvoiceToNewPaymentErrors.NotFound('invoice', payload.invoiceId));
    }

    if (invoice.status !== 'paid') {
      return left(
        new IssueInvoiceToNewPaymentErrors.WrongStatus(invoice.id, invoice.status || 'none')
      );
    }

    logger.debug(`Start issuing invoice ${invoice.id}`, { invoice });

    try {
      const issuedInvoice = await invoicesService.issueInvoiceForStripeInvoice(
        invoice,
        user?.invoiceData
      );

      logger.info(
        `Successfully issued an invoice ${invoice.id} with number ${invoice.number} for Stripe invoice ${invoice.id}`
      );

      await usersRepository.updateSubscriptionInvoice(payload.userId, invoice.id, {
        connectedInvoice: {
          id: issuedInvoice.id,
          number: issuedInvoice.number,
        },
      });

      logger.info(`Successfully saved info about invoice into order details document`);

      await invoicesService.sendInvoiceToClient(issuedInvoice.id, payload.userEmail);

      logger.info(`Successfully send issued an invoice to client email`);
    } catch (e) {
      if (isAxiosError(e)) {
        logger.warn('Handle flow for failed issuing...', {
          statusResponse: e.response?.status,
          errorMessage: e.message,
          code: e.code,
          error: e.toJSON(),
          response: e.response,
          data: JSON.stringify(e.response?.data),
        });
      } else {
        logger.warn('Handle flow for failed issuing...', {
          status: e.status,
          statusResponse: e.response?.status,
          errorMessage: e.response?.message || e.message,
          error: e,
        });
      }

      logger.info('Successfully handled failed event');
    }

    return right(Result.ok({ status: 'ok' }));
  }
}
