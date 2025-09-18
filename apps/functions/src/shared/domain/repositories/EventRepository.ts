import { BusinessEvent } from '@akademiasaas/shared';

export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> =
  T extends Record<K, V> ? T : never;

export interface EventRepository {
  saveEvent: (event: BusinessEvent) => Promise<void>;
  getEventsByType<T extends BusinessEvent['eventName']>(
    eventType: T
  ): Promise<DiscriminateUnion<BusinessEvent, 'eventName', T>[]>;
}
