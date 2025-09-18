import { v4 as uuid } from 'uuid';
import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { BusinessEventDto, BusinessEventEnvelope } from '@akademiasaas/shared';

export interface IBusinessEventsService {
  publish: (eventData: BusinessEventDto) => Promise<BusinessEventEnvelope>;
}

export type BusinessEventsConfig = {
  domain: string;
  topic: string;
};

type Dependencies = {
  pubSubClient: PubSub;
  logger: typeof functions.logger;
  businessEventsConfig: BusinessEventsConfig;
};

export class BusinessEventsService implements IBusinessEventsService {
  constructor(private dependencies: Dependencies) {}

  async publish(eventData: BusinessEventDto, defaultEventId?: string) {
    const { businessEventsConfig, logger, pubSubClient } = this.dependencies;
    const eventId = defaultEventId || uuid();
    const event: BusinessEventEnvelope = {
      eventDomain: businessEventsConfig.domain,
      eventName: eventData.eventType,
      eventId,
      revision: null,
      payload: eventData.payload,
      metadata: {},
      timestamp: new Date(),
    };

    try {
      const messageId = await pubSubClient.topic(businessEventsConfig.topic).publishJSON(event, {
        eventName: eventData.eventType,
        eventId,
        eventDomain: businessEventsConfig.domain,
      });

      logger.info(
        `Publish message ${messageId} about business event ${eventData.eventType} to pubsub topic ${businessEventsConfig.topic}`,
        event,
        {
          labels: {
            businessEventType: eventData.eventType,
            businessEventId: event.eventId,
            businessEventPayload: eventData.payload,
          },
        }
      );
    } catch (e) {
      logger.warn(`Cannot send business event about ${eventData.eventType}: ${e}`);
    }

    return event;
  }
}
