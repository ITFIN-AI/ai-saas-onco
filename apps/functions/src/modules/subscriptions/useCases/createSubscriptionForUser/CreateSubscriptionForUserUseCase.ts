import * as functions from 'firebase-functions';
import { UseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { CreateSubscriptionForUserDTO } from './CreateSubscriptionForUserDTO';
import { CreateSubscriptionForUserErrors } from './CreateSubscriptionForUserErrors';
import Stripe from 'stripe';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { CreateUserSubscription } from 'modules/subscriptions/shared/CreateUserSubscription';

type Response = Either<
  AppError.UnexpectedError | CreateSubscriptionForUserErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  usersRepository: UsersRepository;
  businessEventsService: IBusinessEventsService;
};

export class CreateSubscriptionForUserUseCase
  extends CreateUserSubscription
  implements UseCase<CreateSubscriptionForUserDTO, Promise<Response>> {
  constructor(private dependencies: Dependencies) {
    super(dependencies);
  }

  async execute(dto: CreateSubscriptionForUserDTO): Promise<Response> {
    const { logger, usersRepository } = this.dependencies;

    logger.debug(`Checking subscription for user ${dto.userId}...`);

    const userDocument = await usersRepository.findUserById(dto.userId);

    if (!userDocument) {
      return left(new CreateSubscriptionForUserErrors.NotFound('user', dto.userId));
    }

    if (!userDocument.subscription) {
      logger.debug('Start adding subscription for new creator');
      await this.addFreeSubscription(dto.userId, userDocument);
    } else {
      logger.info('Skipping adding subscription for creator with stripe account');
    }

    return right(Result.ok({ status: 'ok' }));
  }
}
