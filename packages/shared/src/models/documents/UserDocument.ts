import { Stripe } from 'stripe';
import { SubscriptionPlan } from './Subscriptions';
import { UserFeatures } from '../../constants/userFeatures';
import { RequiresAction } from './OrderDocument';
import { ClientInvoiceData } from './ClientInvoiceData';
export interface UserOnboarding {
  loginOnlyByLink: boolean;
  showPasswordBanner: boolean;
}

export type Language = 'pl' | 'en';

export interface SubscriptionPlanDetailsDocument {
  name: SubscriptionPlan;
  clients: number;
  products: number;
  monthlyTransactions: number;
  uploadLimitAsBytes: number;
  features: UserFeatures[];
}

export interface ShortSubscriptionInfo {
  status: Stripe.Subscription.Status;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  updatedAt: number;
  id: string;
  plan: SubscriptionPlanDetailsDocument;
  latestConnectedInvoiceId?: string | null;
  requiresAction?: RequiresAction | null;
  defaultPaymentMethod: string | null;
  priceId: string;
  cancelAtPeriodEnd?: boolean;
}

export interface FreeSubscriptionInfo {
  status: 'active';
  currentPeriodStart: number;
  currentPeriodEnd: null;
  updatedAt: number;
  id: null;
  plan: SubscriptionPlanDetailsDocument;
  latestConnectedInvoiceId?: never;
  requiresAction?: RequiresAction | null;
  defaultPaymentMethod: string | null;
  priceId: null;
  cancelAtPeriodEnd?: never;
}

export type CountryCode = string;

export enum ProductsListVariant {
  Grid = 'grid',
  Horizontal = 'horizontal',
}

export interface UserDocument {
  email: string;
  contactEmail: string | null;
  firstName: string;
  lastName: string | null;
  avatarUrl: string[] | null;
  uid: string;
  mobileFcmTokens: string[] | null;
  webFcmTokens: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  termsAndPolicyAcceptDate: Date | null;
  onboarding?: UserOnboarding;
  termsAndPrivacyPolicy: boolean;
  stripeCustomerId?: string;
  country?: CountryCode;
  features?: UserFeatures[];
  ip?: string | null;
  subscription?: ShortSubscriptionInfo | FreeSubscriptionInfo | null;
  lang?: Language;
  timezone?: string;
  invoiceData?: ClientInvoiceData;
  phoneNumber?: string;
}
