import { OrderPaymentType, OrderPaymentTypeOption, ProductType } from '../../enums/productEnums';
import { Stripe } from 'stripe';
import { ClientInvoiceData } from './ClientInvoiceData';
import { Currency } from './Currency';
import { SubscriptionInterval } from './Subscriptions';

export interface Coupon {
  code: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'imported';

export type OneTimePaymentStatus = 'active' | 'past_due' | 'imported' | 'expired';

export interface Recurring {
  interval_count: number;
  trial_period_days?: number | null;
  interval: SubscriptionInterval;
}

export type AccessPeriodType = 'recurring' | 'one_time';

interface PauseCollection {
  behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
  resumes_at: number | null;
  original_access_date: number;
}

export type PaidInstallmentsStatus = 'paid';

export interface SubscriptionProductAccessPeriod {
  cycleNumber: number;
  startAt: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  type: 'recurring';
  productId: string;
  productName: string;
  subscriptionId: string;
  status: SubscriptionStatus | PaidInstallmentsStatus;
  recurring: Recurring;
  cancelAtPeriodEnd: boolean;
  pauseCollection?: null | PauseCollection;
  endDate?: number | null;
}

export interface OneTimeProductAccessPeriod {
  currentPeriodStart: number;
  currentPeriodEnd: number;
  type: 'one_time';
  productId: string;
  productName: string;
  recurring: Recurring;
  status?: OneTimePaymentStatus;
  pauseCollection?: null | PauseCollection;
}

export interface OneTimeNFTProductAccessPeriod {
  currentPeriodStart: number;
  currentPeriodEnd: number;
  type: 'nft';
  productId: string;
  productName: string;
  recurring?: never;
  pauseCollection?: never;
  status?: OneTimePaymentStatus;
}

export type PaidLastOrder = {
  amount: number;
  currency: Currency;
  priceId: string;
  orderId: string;
  free: false;
  paymentGatewayInvoiceId?: string | null;
  customInvoiceName?: string;
  quantity?: number;
};

export type FreeLastOrder = {
  orderId: string;
  free: true;
  priceId: null;
  amount?: never;
  currency?: never;
  quantity?: number;
};

export type NFTLastOrder = {
  orderId: string;
  free: true;
  priceId: string;
  amount?: never;
  currency?: never;
  quantity?: never;
};

export type LastOrder = PaidLastOrder | FreeLastOrder | NFTLastOrder;

export interface ProductAuthor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string[] | string | null;
  stripeAccountId?: string | null;
  creator?: string;
}

export interface RenewalAccessPeriodReminder {
  eventId: string;
  timestamp: number;
  notificationId: string | null;
  emailSentTimestamp?: number;
}

export interface DefaultReminderForYear {
  1: null | RenewalAccessPeriodReminder;
  3: null | RenewalAccessPeriodReminder;
  7: null | RenewalAccessPeriodReminder;
  14: null | RenewalAccessPeriodReminder;
}

export interface DefaultReminderForMonths {
  1: null | RenewalAccessPeriodReminder;
  3: null | RenewalAccessPeriodReminder;
  7: null | RenewalAccessPeriodReminder;
}

export type RenewalAccessPeriodReminders = DefaultReminderForYear | DefaultReminderForMonths;

export enum RenewalAccessPeriodStatus {
  InProgress = 'inProgress',
  Finished = 'finished',
}

export interface RenewalAccessPeriod {
  checkoutLink: string;
  reminders: RenewalAccessPeriodReminders;
  status: RenewalAccessPeriodStatus;
}

export enum ClientArchiveReason {
  AccessEnd = 'access_end',
  Refund = 'refund',
  Unsubscribe = 'unsubscribe',
  NFTSell = 'nft_sell',
}

export interface ArchivedInfo {
  archivedAt: number;
  by: string | 'system';
  reason: ClientArchiveReason;
}

export const productClientStatus = ['active', 'archived'] as const;

export interface BaseProductClientDocument {
  status: (typeof productClientStatus)[number];
  archivedInfo?: ArchivedInfo | null;
  productType: ProductType;
  updatedAt: Date;
  createdAt: Date;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  coupon: Coupon | null;
  refCode?: string;
  clientId?: string;
  lastOrderId: string | null;
  paymentType: OrderPaymentType;
  productId: string;
  author: ProductAuthor;
  paymentGatewayAuthorId?: string | null;
  connectedOrders: string[];
  product: {
    name: string;
    description: string;
    images: string[];
  };
  lastOrder: LastOrder | null;
  client: ClientInvoiceData;
  imported?: boolean;
  importId?: string;
  invoiceRequested?: boolean | null;
  previousEmails?: string[];
  language?: string | null;
  subscribedDate?: Date;
}

export interface SubscriptionProductClient extends BaseProductClientDocument {
  paymentType: typeof OrderPaymentTypeOption.Recurring;
  accessPeriod: SubscriptionProductAccessPeriod;
  paymentMethod: Stripe.PaymentMethod.Card | null;
  paymentGatewayCustomerId: string;
  invoiceRequested?: boolean | null;
  accessPeriodRenewal?: RenewalAccessPeriod | null;
  lastOrder: PaidLastOrder | null;
  downgradedToFromNextPeriod?: null | { priceId: string; amount: number; currency: string };
}

export interface OneTimeProductClient extends BaseProductClientDocument {
  paymentType: typeof OrderPaymentTypeOption.OneTime;
  paymentGatewayCustomerId: string | null;
  accessPeriod?: OneTimeProductAccessPeriod | null;
  invoiceRequested?: boolean | null;
  accessPeriodRenewal?: RenewalAccessPeriod | null;
  lastOrder: PaidLastOrder | null;
}

export interface FreeProductClient extends BaseProductClientDocument {
  paymentType: typeof OrderPaymentTypeOption.Free;
  coupon: null;
  accessPeriod?: null;
  invoiceRequested?: null;
  lastOrder: FreeLastOrder | null;
}

export interface NFTProductClient extends BaseProductClientDocument {
  paymentType: typeof OrderPaymentTypeOption.NFT;
  coupon: null;
  accessPeriod?: null | OneTimeNFTProductAccessPeriod;
  invoiceRequested?: null;
  lastOrder: NFTLastOrder | null;
  usedTokens: string[];
}

export type ProductClientDocument =
  | SubscriptionProductClient
  | OneTimeProductClient
  | FreeProductClient
  | NFTProductClient;
