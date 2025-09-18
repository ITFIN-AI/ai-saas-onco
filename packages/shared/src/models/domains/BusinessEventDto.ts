import {
  BusinessEventType,
  SubscriberEventType,
  SubscriptionEventType,
  UserEventType,
} from '../../enums/BusinessEventType';
import { SubscriptionEventsDto } from './businessEvents/SubscriptionEvents';
import { SubscriptionPlan } from '../documents/Subscriptions';

export interface GenericBusinessEventDto<
  T extends BusinessEventType,
  U extends { [key: string]: string | boolean | number | null | object },
> {
  eventType: T;
  payload: U;
}

export type UserCreatedEventDto = GenericBusinessEventDto<
  UserEventType.UserCreated,
  { userId: string; email: string }
>;

export type SubscriberCreatedEventDto = GenericBusinessEventDto<
  SubscriberEventType.SubscriberCreated,
  { userId: string; email: string }
>;

export type PlanLimitsSatisfiedEventDto = GenericBusinessEventDto<
  SubscriptionEventType.PlanLimitsSatisfied,
  {
    email: string;
    plan: SubscriptionPlan;
  }
>;

export type BusinessEventDto =
  | UserCreatedEventDto
  | SubscriberCreatedEventDto
  | SubscriptionEventsDto
  | PlanLimitsSatisfiedEventDto;
