import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { ChangeSubscriptionPlanDTO } from './ChangeSubscriptionPlanDTO';
import { ChangeSubscriptionPlanErrors } from './ChangeSubscriptionPlanErrors';
import Stripe from 'stripe';
import { IBusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import {
  ShortSubscriptionInfo,
  SubscriptionEventType,
  SubscriptionPlan,
  UserSubscriptionInterval,
  planDetailsFromStripeSubscription,
  planDetailsToDocument,
  subscriptionPlanPriceLookupKey,
} from '@akademiasaas/shared';
import { CreateUserSubscription } from 'modules/subscriptions/shared/CreateUserSubscription';

type Response = Either<
  AppError.UnexpectedError | ChangeSubscriptionPlanErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  paymentClient: Stripe;
  businessEventsService: IBusinessEventsService;
  usersRepository: UsersRepository;
};

export class ChangeSubscriptionPlanUseCase
  extends CreateUserSubscription
  implements UseCaseWithAuth<ChangeSubscriptionPlanDTO, Promise<Response>> {
  constructor(private dependencies: Dependencies) {
    super(dependencies);
  }

  async execute(dto: ChangeSubscriptionPlanDTO, uid: string): Promise<Response> {
    const { usersRepository, logger, paymentClient, businessEventsService } = this.dependencies;

    logger.debug(`Changing plan for user ${uid} to ${dto.plan} / ${dto.interval}...`);

    const user = await usersRepository.findUserById(uid);

    if (dto.plan === SubscriptionPlan.Free) {
      return left(new ChangeSubscriptionPlanErrors.CannotDowngradeToFree());
    }

    if (!user) {
      return left(new ChangeSubscriptionPlanErrors.NotFound('user', uid));
    }

    const subscriptionRegion = !user?.country || user.country === 'PL' ? 'pl' : 'intl';
    const priceLookupKey = subscriptionPlanPriceLookupKey(
      subscriptionRegion,
      dto.interval,
      dto.plan
    );
    const prices = await paymentClient.prices.search({
      query: `lookup_key:'${priceLookupKey}'`,
    });
    const price = prices.data[0];
    const priceId = price.id;

    if (!priceId) {
      logger.error(
        `Cannot find price for interval ${dto.interval}, plan ${dto.plan} and region ${subscriptionRegion}`
      );

      return left(new ChangeSubscriptionPlanErrors.NotFound('price', priceLookupKey));
    }

    if (!user.subscription) {
      logger.info("User doesn't have active subscription. Creating new one...");

      await this.addStarterSubscription(user.uid, user, priceId);

      return right(Result.ok({ status: 'ok' }));
    }

    let updatedSubscription: Stripe.Subscription;
    let previousSubscription: Stripe.Subscription | null = null;

    if (user.subscription.id) {
      logger.debug(`Updating current subscription...`);
      previousSubscription = await paymentClient.subscriptions.retrieve(user.subscription.id);

      updatedSubscription = await paymentClient.subscriptions.update(previousSubscription.id, {
        cancel_at_period_end: false,
        proration_behavior: 'always_invoice',
        items: [
          {
            id: previousSubscription.items.data[0].id,
            price: priceId,
          },
        ],
      });

      logger.info('Successfully updated subscription to price', { ...dto });
    } else {
      logger.debug(`Creating new subscription...`);

      updatedSubscription = await this.addStarterSubscription(user.uid, user, priceId);
    }
    const updatedPlanDetails = planDetailsFromStripeSubscription(updatedSubscription, price);
    const updatedPlanDetailsDocument = planDetailsToDocument(updatedPlanDetails);

    if (user.subscription?.requiresAction?.status === 'reached_limit') {
      const subscriptionPlansOrdered = [
        SubscriptionPlan.Free,
        SubscriptionPlan.Basic,
        SubscriptionPlan.Standard,
        SubscriptionPlan.Professional,
      ] as const;

      const requiredPlan = subscriptionPlansOrdered.indexOf(
        user.subscription.requiresAction.shouldUpgradeTo
      );

      const selectedPlan = subscriptionPlansOrdered.indexOf(dto.plan);

      await usersRepository.upsertSubscriptionData(
        user.uid,
        updatedSubscription.id,
        updatedSubscription
      );

      if (selectedPlan >= requiredPlan) {
        logger.info(`User selected proper plan for his limit. Remove alert about reached limit`, {
          nextPlan: user.subscription.requiresAction.currentLimit,
          selected: dto.plan,
        });

        await usersRepository.updateUser(user.uid, {
          subscription: {
            ...user.subscription,
            plan: updatedPlanDetailsDocument,
            priceId,
            requiresAction: null,
          } as ShortSubscriptionInfo,
        });
      } else {
        logger.warn(`User selected too low plan for his limit. Keep alert about reached limit`, {
          nextPlan: user.subscription.requiresAction.shouldUpgradeTo,
          selected: dto.plan,
        });

        await usersRepository.updateUser(user.uid, {
          subscription: {
            ...user.subscription,
            plan: updatedPlanDetailsDocument,
            priceId,
          } as ShortSubscriptionInfo,
        });
      }
    }

    await businessEventsService.publish({
      eventType: SubscriptionEventType.ChangedCurrentPlan,
      payload: {
        email: user.email,
        userId: user.uid,
        country: user.country ?? 'PL',
        priceId,
        stripeCustomerId: user.stripeCustomerId ?? '',
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        plan: updatedPlanDetails.name,
        interval: (price.recurring?.interval ?? 'month') as UserSubscriptionInterval,
        previous: {
          priceId: previousSubscription?.items.data[0].price.id || null,
          amount: previousSubscription?.items.data[0].price.unit_amount
            ? previousSubscription.items.data[0].price.unit_amount / 100
            : 0,
          currency: previousSubscription?.items.data[0].price.currency || null,
          plan: updatedPlanDetails.name,
          interval: (previousSubscription?.items.data[0].price.recurring?.interval ||
            'month') as UserSubscriptionInterval,
        },
      },
    });

    return right(Result.ok({ status: 'ok' }));
  }
}
