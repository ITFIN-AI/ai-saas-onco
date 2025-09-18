export enum ProductClientStatus {
  Active = 'active',
  Upcoming = 'upcoming',
  Finished = 'finished',
}

export enum ProductChargeType {
  Paid = 'paid',
  Free = 'free',
}

export enum CouponCodeStatus {
  Inactive = 'inactive',
  Active = 'active',
  Redeemed = 'redeemed',
}

export type PricePaymentType = 'one_time' | 'recurring' | 'nft';
export type OrderPaymentType = 'one_time' | 'recurring' | 'free' | 'nft' | 'full_discount';

export const PaymentTypeOption = {
  OneTime: 'one_time',
  Recurring: 'recurring',
  NFT: 'nft',
} as const;

export const OrderPaymentTypeOption = {
  OneTime: 'one_time',
  Recurring: 'recurring',
  Free: 'free',
  NFT: 'nft',
  FullyDiscounted: 'full_discount',
} as const;

export enum ProductType {
  Mailing = 'mailing',
  Course = 'course',
  Membership = 'membership',
  OneTime = 'one_time',
  KnowledgeBase = 'knowledge_base',
}

export enum PaymentClient {
  Stripe = 'stripe',
  PayU = 'payu',
  Metamask = 'metamask',
}
