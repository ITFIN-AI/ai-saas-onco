import { UseCase } from 'shared/core/UseCase';
import { AppError } from 'shared/core/AppError';
import { Either, left, Result, right } from 'shared/core/Result';
import Stripe from 'stripe';
import * as functions from 'firebase-functions';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { CreateBillingCustomerPortalDTO } from './CreateBillingCustomerPortalDTO';
import { CreateBillingCustomerPortalErrors } from './CreateBillingCustomerPortalErrors';

type Response = Either<
  CreateBillingCustomerPortalErrors.UserNotFound | AppError.UnexpectedError,
  Result<{ session: Stripe.Response<Stripe.BillingPortal.Session> }>
>;

type Dependencies = {
  usersRepository: UsersRepository;
  paymentClient: Stripe;
  logger: typeof functions.logger;
  domain: string;
};

export class CreateBillingCustomerPortalUseCase
  implements UseCase<CreateBillingCustomerPortalDTO, Response>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: CreateBillingCustomerPortalDTO): Promise<Response> {
    const { paymentClient, domain, usersRepository, logger } = this.dependencies;
    const { email, uid } = dto;

    logger.info(`Start creating customer portal session for user ${email} / ${uid}`);

    const user = await usersRepository.findUserById(uid);

    if (!user) {
      return left(new CreateBillingCustomerPortalErrors.UserNotFound(email));
    }

    if (!user.stripeCustomerId) {
      return left(new CreateBillingCustomerPortalErrors.StripeCustomerNotExists(dto.uid));
    }

    const returnUrl = `${domain}/subscription`;
    logger.info(`Return URL: ${returnUrl}`);

    const session = await paymentClient.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      locale: user.lang || 'pl',
    });

    logger.info(`Created customer portal session for user ${email} / ${uid}`, session);

    return right(Result.ok({ session }));
  }
}
