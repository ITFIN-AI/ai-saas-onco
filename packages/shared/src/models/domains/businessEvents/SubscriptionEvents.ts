import { SubscriptionEventType } from '../../../enums/BusinessEventType';
import { GenericBusinessEventDto } from '../BusinessEventDto';
import { GenericBusinessEvent } from '../BusinessEventEnvelope';
import { SubscriptionPlan, UserSubscriptionInterval } from '../../documents/Subscriptions';

export type ActivatedNewTrialSubscriptionEventDto = GenericBusinessEventDto<
  SubscriptionEventType.ActivatedNewTrialSubscription,
  {
    userId: string;
    email: string;
    name: string;
    country: string;
    priceId: string;
    stripeCustomerId: string;
    currency: string;
  }
>;

export type ActivatedNewTrialSubscriptionEvent = GenericBusinessEvent<
  ActivatedNewTrialSubscriptionEventDto['eventType'],
  ActivatedNewTrialSubscriptionEventDto['payload']
>;

export type SubscriptionInvoicePaidEventDto = GenericBusinessEventDto<
  SubscriptionEventType.InvoicePaid,
  {
    userId: string;
    email: string;
    country: string;
    priceId: string;
    amount: number;
    billingReason: string | null;
    currency: string;
    stripeCustomerId: string;
    plan: SubscriptionPlan;
    interval: UserSubscriptionInterval;
    invoiceId: string;
    userEmail: string;
  }
>;

export type SubscriptionInvoicePaidEvent = GenericBusinessEvent<
  SubscriptionInvoicePaidEventDto['eventType'],
  SubscriptionInvoicePaidEventDto['payload']
>;

export type SubscriptionInvoicePaymentFailedEventDto = GenericBusinessEventDto<
  SubscriptionEventType.InvoicePaymentFailed,
  {
    userId: string;
    email: string;
    userEmail: string;
    invoiceId: string;
    country: string;
    priceId: string;
    amount: number;
    currency: string;
    stripeCustomerId: string;
    billingReason: string | null;
    plan: SubscriptionPlan;
    interval: UserSubscriptionInterval;
  }
>;

export type SubscriptionInvoicePaymentFailedEvent = GenericBusinessEvent<
  SubscriptionInvoicePaymentFailedEventDto['eventType'],
  SubscriptionInvoicePaymentFailedEventDto['payload']
>;

export type SubscriptionChangedCurrentPlanEventDto = GenericBusinessEventDto<
  SubscriptionEventType.ChangedCurrentPlan,
  {
    userId: string;
    email: string;
    country: string;
    stripeCustomerId: string;
    priceId: string;
    plan: SubscriptionPlan;
    interval: UserSubscriptionInterval;
    amount: number;
    currency: string;
    previous: {
      plan: SubscriptionPlan;
      interval: UserSubscriptionInterval;
      amount: number;
      currency: string | null;
      priceId: string | null;
    };
  }
>;

export type SubscriptionChangedCurrentPlanEvent = GenericBusinessEvent<
  SubscriptionChangedCurrentPlanEventDto['eventType'],
  SubscriptionChangedCurrentPlanEventDto['payload']
>;

export type SubscriptionPlanLimitsReachedEventDto = GenericBusinessEventDto<
  SubscriptionEventType.ReachedPlanLimits,
  {
    userId: string;
    email: string;
    country: string;
    stripeCustomerId: string;
    currentSubscription: {
      plan: SubscriptionPlan | null;
      priceId: string | null;
    } | null;
    nextPlanProposal: 'custom' | SubscriptionPlan;
    totalNumberOfPaidSubscribers: number;
    totalNumberOfFreeSubscribers: number;
    totalNumberOfProducts: number;
    totalNumberOfOneTimeTransactions: number;
  }
>;

export type SubscriptionPlanLimitsReachedEvent = GenericBusinessEvent<
  SubscriptionPlanLimitsReachedEventDto['eventType'],
  SubscriptionPlanLimitsReachedEventDto['payload']
>;

export type SubscriptionEndEventDto = GenericBusinessEventDto<
  SubscriptionEventType.EndOfSubscription,
  {
    userId: string;
    email: string;
    country: string;
    stripeCustomerId: string;
    priceId: string;
    plan: SubscriptionPlan;
    interval: UserSubscriptionInterval;
    amount: number;
    currency: string;
  }
>;

export type SubscriptionEndEvent = GenericBusinessEvent<
  SubscriptionEndEventDto['eventType'],
  SubscriptionEndEventDto['payload']
>;

export type SubscriptionCancelEventDto = GenericBusinessEventDto<
  SubscriptionEventType.CancelSubscription,
  {
    userId: string;
    email: string;
    country: string;
    stripeCustomerId: string;
    priceId: string;
    plan: SubscriptionPlan;
    interval: UserSubscriptionInterval;
    amount: number;
    currency: string;
  }
>;

export type SubscriptionCancelEvent = GenericBusinessEvent<
  SubscriptionCancelEventDto['eventType'],
  SubscriptionCancelEventDto['payload']
>;

export type SubscriptionEventsDto =
  | ActivatedNewTrialSubscriptionEventDto
  | SubscriptionInvoicePaidEventDto
  | SubscriptionInvoicePaymentFailedEventDto
  | SubscriptionChangedCurrentPlanEventDto
  | SubscriptionPlanLimitsReachedEventDto
  | SubscriptionCancelEventDto
  | SubscriptionEndEventDto;

export type SubscriptionEventsPayload =
  | ActivatedNewTrialSubscriptionEventDto['payload']
  | SubscriptionInvoicePaidEventDto['payload']
  | SubscriptionInvoicePaymentFailedEvent['payload']
  | SubscriptionChangedCurrentPlanEvent['payload']
  | SubscriptionPlanLimitsReachedEventDto['payload']
  | SubscriptionCancelEventDto['payload']
  | SubscriptionEndEventDto['payload'];

export type SubscriptionEvents =
  | ActivatedNewTrialSubscriptionEvent
  | SubscriptionInvoicePaidEvent
  | SubscriptionInvoicePaymentFailedEvent
  | SubscriptionChangedCurrentPlanEvent
  | SubscriptionPlanLimitsReachedEvent
  | SubscriptionCancelEvent
  | SubscriptionEndEvent;
