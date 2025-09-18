import * as functions from 'firebase-functions';
import { StripeUseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { HandleCustomerUpdateDTO } from './HandleCustomerUpdateDTO';
import { HandleCustomerUpdateErrors } from './HandleCustomerUpdateErrors';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';

type Response = Either<
  AppError.UnexpectedError | HandleCustomerUpdateErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
};

export class HandleCustomerUpdateUseCase
  implements StripeUseCase<HandleCustomerUpdateDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute({ customer, previous }: HandleCustomerUpdateDTO): Promise<Response> {
    const { usersRepository, logger, paymentClient } = this.dependencies;

    logger.debug(`Start handle updated customer data`, {
      email: customer.email,
      uid: customer.metadata.uid,
      previous,
    });

    const user = await usersRepository.findUserById(customer.metadata.uid);

    if (!user) {
      return left(new HandleCustomerUpdateErrors.NotFound('user', customer.metadata.uid));
    }

    if (
      previous.invoice_settings &&
      'default_payment_method' in previous.invoice_settings &&
      user.subscription
    ) {
      logger.debug('Updating payment method of user');

      await usersRepository.updateUser(user.uid, {
        subscription: {
          ...user.subscription,
          defaultPaymentMethod: customer.invoice_settings.default_payment_method as string | null,
        },
      });

      logger.info('Successfully updated default payment method for client');

      if (
        (user.subscription.status === 'unpaid' || user.subscription.status === 'past_due') &&
        customer.invoice_settings.default_payment_method &&
        user.subscription.latestConnectedInvoiceId
      ) {
        logger.debug('Trying use new payment method to paid past due subscription....');
        try {
          const lastFailedInvoice = await paymentClient.invoices.retrieve(
            user.subscription.latestConnectedInvoiceId
          );

          if (!lastFailedInvoice?.id) {
            logger.warn(`Cannot find invoice ${user.subscription.latestConnectedInvoiceId}`);
          } else if (lastFailedInvoice.status === 'paid') {
            logger.warn('Invoice is already paid');
          } else {
            await paymentClient.invoices.pay(lastFailedInvoice.id);

            logger.info('Successfully paid invoice');
          }
        } catch (e) {
          logger.error(`Cannot paid invoice: ${e.message}`);
        }
      }
    }

    return right(Result.ok({ status: 'ok' }));
  }
}
