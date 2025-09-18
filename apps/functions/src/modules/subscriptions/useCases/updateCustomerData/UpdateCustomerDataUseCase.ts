import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { UpdateCustomerDataDTO } from './UpdateCustomerDataDTO';
import { UpdateCustomerDataErrors } from './UpdateCustomerDataErrors';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import Stripe from 'stripe';

type Response = Either<
  AppError.UnexpectedError | UpdateCustomerDataErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  usersRepository: UsersRepository;
  paymentClient: Stripe;
};

export class UpdateCustomerDataUseCase
  implements UseCaseWithAuth<UpdateCustomerDataDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: UpdateCustomerDataDTO, uid: string): Promise<Response> {
    const { logger, usersRepository, paymentClient } = this.dependencies;

    const user = await usersRepository.findUserById(uid);

    if (!user) {
      return left(new UpdateCustomerDataErrors.NotFound('user', uid));
    }

    if (!user.invoiceData) {
      logger.warn(`User ${uid} has no invoice data`);

      return right(Result.ok({ status: 'ok' }));
    }

    if (!user.stripeCustomerId) {
      logger.warn(`User ${uid} has no stripe customer id`);

      return right(Result.ok({ status: 'ok' }));
    }

    await paymentClient.customers.update(user.stripeCustomerId, {
      address: {
        city: user.invoiceData.city,
        country: user.invoiceData.country || 'PL',
        line1: user.invoiceData.street,
        postal_code: user.invoiceData.postalCode,
      },
      name: user.invoiceData.companyName
        ? user.invoiceData.companyName
        : `${user.invoiceData.firstName} ${user.invoiceData.lastName}`,
    });

    if (user.invoiceData.nip && user.invoiceData.country) {
      try {
        const vatId = `${user.invoiceData.country.toUpperCase()}${Number(
          user.invoiceData.nip.replace(/\D+/g, '')
        )}`;

        const taxIds = await paymentClient.customers.listTaxIds(user.stripeCustomerId);

        if (!taxIds.data.find((taxId) => taxId.value === vatId)) {
          logger.info(`Adding tax id ${vatId} to stripe customer`);
          await paymentClient.customers.createTaxId(user.stripeCustomerId, {
            type: 'eu_vat',
            value: `${user.invoiceData.country.toUpperCase()}${Number(
              user.invoiceData.nip.replace(/\D+/g, '')
            )}`,
          });
        } else {
          logger.info(`Tax id ${vatId} already exists`);
        }
      } catch (e) {
        logger.warn(`Error when trying set tax id for user ${uid}`, { message: e.message });
      }
    }

    logger.info(`Successfully updated customer data for user ${uid}`, { data: user.invoiceData });

    return right(Result.ok({ status: 'ok' }));
  }
}
