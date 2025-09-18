import { LastOrder } from './ProductClientDocument';
import { OrderPaymentType } from '../../enums/productEnums';
import { Stripe } from 'stripe';
import { Currency } from './Currency';
import { SubscriptionPlan, UserSubscriptionInterval } from './Subscriptions';
import { DiscountDocument } from './DiscountDocument';
import { ClientInvoiceData } from './ClientInvoiceData';

export type RequiresAction = ReachedLimit | InsufficientFunds | ConfirmTransaction;

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'free_finalized'
  | 'failed'
  | 'imported'
  | 'refunded';

export interface SessionMetadata {
  sessionId: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  longitude: string | null;
  latitude: string | null;
  timezone: string | null;
  visitorId: string | null;
  variant: string | null;
  ownerId: string | null;
  productId: string | null;
  referer: string | null;
  productSlug: string | null;
  timestamp: number;
  host: string;
  userAgent: string;
  platform: string | null;
  browser: string | null;
  fbp: string | null;
  fbc: string | null;
}

export const OrderStatusOption = {
  Created: 'created',
  Paid: 'paid',
  Finalized: 'free_finalized',
  Failed: 'failed',
  Imported: 'imported',
  Refunded: 'refunded',
} as const;

export interface InsufficientFunds {
  status: 'insufficient_funds';
}

export interface ConfirmTransaction {
  status: 'confirm_transaction';
  url: string;
}

export interface ReachedLimit {
  status: 'reached_limit';
  currentLimit: SubscriptionPlan;
  shouldUpgradeTo: SubscriptionPlan;
  proposalPriceId: string;
}

export interface SuccessRefund {
  timestamp: number;
  amount: number;
  currency: Currency;
  creatorId: string;
  refundId: string | 'manual';
}

export interface FailedRefund {
  creatorId: string;
  errorMessage: string;
  timestamp: number;
}

export type Refund = SuccessRefund | FailedRefund;

export interface BaseOrder {
  ownerAccountId: string;
  ownerEmail: string;
  productId: string;
  productName: string;
  priceId: string | null;
  price: null | LastOrder;
  paymentIntentId?: string | null;
  clientEmail: string;
  paymentType: OrderPaymentType;
  sellDate?: number;
  issueDate?: number;
  paymentCycle: number | null;
  client: ClientInvoiceData;
  createdAt: Date;
  updatedAt: Date;
  status: OrderStatus;
  sessionId: string;
  orderId: string;
  paymentGateway: null | 'stripe' | 'payu';
  connectedSubscription?: string;
  connectedInvoice?:
    | null
    | {
        id: string | number;
        number: string | number;
        status?: 'issued' | 'sent';
      }
    | {
        errorMessage: string;
        timestamp: number;
        errorData?: null | object | string;
      };
  requiresAction?: RequiresAction;
  metadata?: Record<string, any>;
  sessionMetadata?: SessionMetadata;
  orderForImport?: true;
  invoiceRequested?: boolean | null;
  accessPeriod?: {
    startAt: number;
    endAt: number;
  } | null;
  discounted?: boolean;
  /** @deprecated old way of handling just Stripe discounts **/
  discounts?: Stripe.LineItem.Discount[] | Stripe.Discount[] | null;
  refund?: Refund;
  paymentMethodType?: string | null;
  usedTokens?: string[];
  taskPath?: string | null;
  quantity?: number;
  couponCode?: string;
  appliedDiscounts?: DiscountDocument[] | null;
  totalInstallments?: number | null;
  gtmStatus?: string;
}

export interface OrderWithProration extends BaseOrder {
  previousSubscriptionPrice: {
    amount: number;
    currency: Currency;
    id: string;
    interval_count: number;
    interval: UserSubscriptionInterval;
  };
  price: {
    amount: number;
    currency: Currency;
    priceId: string;
    orderId: string;
    free: false;
    paymentGatewayInvoiceId?: string | null;
    customInvoiceName?: string;
  } & {
    baseAmount: number;
    prorated: true;
    interval_count: number;
    interval: UserSubscriptionInterval;
  };
}

export type OrderDocument = BaseOrder | OrderWithProration;
