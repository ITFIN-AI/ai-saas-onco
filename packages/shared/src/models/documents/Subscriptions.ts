import { USER_FEATURES, UserFeatures } from '../../constants/userFeatures';
import { enumValues } from '../../helpers/enumValues';
import { Size } from '../../helpers/Size';
import { SubscriptionPlanDetailsDocument } from './UserDocument';
import Stripe from 'stripe';

export type UserSubscriptionInterval = 'month' | 'year';

export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';

export enum SubscriptionPlan {
  Free = 'free',
  Basic = 'basic',
  Standard = 'standard',
  Professional = 'professional',
}

export type PaidSubscriptionPlan = Exclude<SubscriptionPlan, SubscriptionPlan.Free>;

export const subscriptionPlanPriceLookupKey = (
  region: 'pl' | 'intl',
  interval: UserSubscriptionInterval,
  plan: PaidSubscriptionPlan
): string => {
  return `${region}-${interval}-${plan}`;
};

const planDetailsMapping: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  [SubscriptionPlan.Free]: {
    name: SubscriptionPlan.Free,
    clients: 10,
    products: 1,
    monthlyTransactions: 50,
    uploadLimit: Size.fromGigabytes(10),
    features: [],
  },
  [SubscriptionPlan.Basic]: {
    name: SubscriptionPlan.Basic,
    clients: 100,
    products: 5,
    monthlyTransactions: 500,
    uploadLimit: Size.fromGigabytes(100),
    features: [],
  },
  [SubscriptionPlan.Standard]: {
    name: SubscriptionPlan.Standard,
    clients: 500,
    products: 25,
    monthlyTransactions: 5000,
    uploadLimit: Size.fromGigabytes(500),
    features: [USER_FEATURES.API],
  },
  [SubscriptionPlan.Professional]: {
    name: SubscriptionPlan.Professional,
    clients: 10000,
    products: 100,
    monthlyTransactions: 25000,
    uploadLimit: Size.fromGigabytes(1000),
    features: [USER_FEATURES.API],
  },
};

export type SubscriptionPlanDetails = {
  name: SubscriptionPlan;
  clients: number;
  products: number;
  monthlyTransactions: number;
  uploadLimit: Size;
  features: UserFeatures[];
};

export const subscriptionPlanDetailsToStripeMetadata = (
  plan: SubscriptionPlanDetails
): Record<string, string> => {
  return {
    name: plan.name,
    clients: plan.clients.toString(),
    products: plan.products.toString(),
    monthlyTransactions: plan.monthlyTransactions.toString(),
    uploadLimit: plan.uploadLimit.toString(),
    features: plan.features.join(','),
  };
};

export const planDetailsFromStripeSubscription = (
  subscription: Stripe.Subscription,
  price: Stripe.Price
): SubscriptionPlanDetails => {
  const subscriptionMetadata = subscription.metadata;
  const priceMetadata = price.metadata;

  const metadata = {
    ...priceMetadata,
    ...subscriptionMetadata,
  };

  return planDetailsFromStripeMetadata(metadata);
};

const planDetailsFromStripeMetadata = (
  metadata: Record<string, string>
): SubscriptionPlanDetails => {
  if (!metadata.name) {
    throw new Error('Plan name is required');
  }

  if (!enumValues(SubscriptionPlan).includes(metadata.name as any)) {
    throw new Error('Invalid plan name');
  }

  const name = metadata.name as SubscriptionPlan;

  if (!metadata.clients) {
    throw new Error('Plan price metadata clients are required');
  }

  if (!metadata.products) {
    throw new Error('Plan price metadata products are required');
  }

  if (!metadata.monthlyTransactions) {
    throw new Error('Plan price metadata monthly transactions are required');
  }

  if (!metadata.uploadLimit) {
    throw new Error('Plan price metadata upload limit is required');
  }

  return {
    name,
    clients: parseInt(metadata.clients),
    products: parseInt(metadata.products),
    monthlyTransactions: parseInt(metadata.monthlyTransactions),
    uploadLimit: Size.fromGigabytes(parseInt(metadata.uploadLimit)),
    features: (metadata.features ? (metadata.features.split(',') as UserFeatures[]) : []).filter(
      (feature) => Object.values(USER_FEATURES).includes(feature)
    ),
  };
};

export const planDetailsToDocument = (
  plan: SubscriptionPlanDetails
): SubscriptionPlanDetailsDocument => {
  return {
    name: plan.name,
    clients: plan.clients,
    products: plan.products,
    monthlyTransactions: plan.monthlyTransactions,
    uploadLimitAsBytes: plan.uploadLimit.bytes,
    features: plan.features,
  };
};

export const planDetailsFromDocument = (
  planDetails?: SubscriptionPlanDetailsDocument | null
): SubscriptionPlanDetails | null => {
  if (!planDetails) {
    return null;
  }

  return {
    name: planDetails.name,
    clients: planDetails.clients,
    products: planDetails.products,
    monthlyTransactions: planDetails.monthlyTransactions,
    uploadLimit: Size.fromBytes(planDetails.uploadLimitAsBytes),
    features: planDetails.features,
  };
};

export const getPlanDetails = (plan?: SubscriptionPlan): SubscriptionPlanDetails => {
  if (!plan) {
    return planDetailsMapping[SubscriptionPlan.Free];
  }

  return planDetailsMapping[plan];
};
