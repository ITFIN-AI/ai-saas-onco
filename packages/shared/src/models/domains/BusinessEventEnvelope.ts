import { BusinessEventType } from '../../enums/BusinessEventType';
import {
  SubscriberCreatedEventDto,
  PlanLimitsSatisfiedEventDto,
  UserCreatedEventDto,
} from './BusinessEventDto';
import { SubscriptionEvents, SubscriptionEventsPayload } from './businessEvents/SubscriptionEvents';

export interface BusinessEventMetadata<T = BusinessEventType> {
  eventId: string;
  revision: number | null;
  timestamp: Date;
  metadata?: {
    [key: string]: string;
  };
  eventName: T;
  eventDomain: string;
}

export interface BusinessEventEnvelope<
  T = BusinessEventType,
  U = {
    [key: string]: string | number | boolean | null | object;
  },
> extends BusinessEventMetadata<T> {
  payload: U;
}

export type GenericBusinessEvent<T, U> = BusinessEventEnvelope<T, U>;

export type UserCreatedEvent = BusinessEventEnvelope<
  UserCreatedEventDto['eventType'],
  UserCreatedEventDto['payload']
>;

export type SubscriberCreatedEvent = GenericBusinessEvent<
  SubscriberCreatedEventDto['eventType'],
  SubscriberCreatedEventDto['payload']
>;

export type PlanLimitsSatisfiedEvent = GenericBusinessEvent<
  PlanLimitsSatisfiedEventDto['eventType'],
  PlanLimitsSatisfiedEventDto['payload']
>;

export type BusinessEvent =
  | UserCreatedEvent
  | SubscriberCreatedEvent
  | SubscriptionEvents
  | PlanLimitsSatisfiedEvent;

export type BusinessEventPayload =
  | UserCreatedEventDto['payload']
  | SubscriberCreatedEventDto['payload']
  | SubscriptionEventsPayload
  | PlanLimitsSatisfiedEvent['payload'];
