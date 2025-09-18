import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { CheckSubscriptionInvoiceDTO } from './CheckSubscriptionInvoiceDTO';
import { CheckSubscriptionInvoiceErrors } from './CheckSubscriptionInvoiceErrors';
import Stripe from 'stripe';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { subscriptionPlanPriceLookupKey } from '@akademiasaas/shared';

type Response = Either<
  AppError.UnexpectedError | CheckSubscriptionInvoiceErrors.UnsupportedFeature,
  Result<{ invoice: Stripe.Response<Stripe.UpcomingInvoice> }>
>;

type Dependencies = {
  paymentClient: Stripe;
  usersRepository: UsersRepository;
};

export class CheckSubscriptionInvoiceUseCase
  implements UseCaseWithAuth<CheckSubscriptionInvoiceDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: CheckSubscriptionInvoiceDTO, uid: string): Promise<Response> {
    const { usersRepository, paymentClient } = this.dependencies;

    const user = await usersRepository.findUserById(uid);

    if (!user) {
      return left(new CheckSubscriptionInvoiceErrors.NotFound('user', uid));
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
      return left(new CheckSubscriptionInvoiceErrors.NotFound('price', priceLookupKey));
    }

    if (!user.subscription?.id) {
      return left(new CheckSubscriptionInvoiceErrors.NotFound('subscription', 'none'));
    }

    const prorationDate = Math.floor(Date.now() / 1000);
    const subscription = await paymentClient.subscriptions.retrieve(user.subscription.id);
    const items = [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ];

    const invoice = await paymentClient.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
      subscription: user.subscription.id,
      subscription_items: items,
      subscription_proration_date: prorationDate,
      subscription_proration_behavior: 'always_invoice',
    });

    return right(Result.ok({ invoice }));
  }
}
