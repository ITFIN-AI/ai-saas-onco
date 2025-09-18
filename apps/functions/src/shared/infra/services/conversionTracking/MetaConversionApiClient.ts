import {
  Content,
  CustomData,
  DeliveryCategory,
  EventRequest,
  ServerEvent,
  UserData,
  FacebookAdsApi,
} from 'facebook-nodejs-business-sdk';
import * as functions from 'firebase-functions';

interface Dependencies {
  logger: typeof functions.logger;
  accessToken: string;
  pixelId: string;
}

export interface MetaPurchaseEventModel {
  testEventCode?: string | null;
  emails: string[];
  phones: string[];
  remoteAddress: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
  productId: string;
  quantity: number;
  currency: string;
  value: number;
  eventName: 'Purchase';
  eventTime: number;
  eventSourceUrl: string | null;
  actionSource: 'website';
  orderId: string;
}

export interface MetaInitIalEventModel {
  testEventCode?: string | null;
  remoteAddress: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
  currency: string;
  value: number;
  eventTime: number;
  eventSourceUrl: string | null;
  actionSource: 'website';
  eventId: string | null;
}

export class MetaConversionApiClient {
  constructor(private dependencies: Dependencies) {
    FacebookAdsApi?.init(this.dependencies.accessToken);
  }

  public async sendPurchaseEvent(data: MetaPurchaseEventModel) {
    const { logger, accessToken, pixelId } = this.dependencies;

    logger.debug(`Start sending meta conversion api event`, { data });

    const userData = new UserData().setEmails(data.emails).setPhones(data.phones);
    // It is recommended to send Client IP and User Agent for Conversions API Events.
    if (data.remoteAddress) {
      userData.setClientIpAddress(data.remoteAddress);
    }
    if (data.userAgent) {
      userData.setClientUserAgent(data.userAgent);
    }

    if (data.fbp) {
      userData.setFbp(data.fbp);
    }

    if (data.fbc) {
      userData.setFbc(data.fbc);
    }

    const content = new Content()
      .setId(data.productId)
      .setQuantity(data.quantity)
      .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);

    const customData = new CustomData()
      .setContents([content])
      .setCurrency(data.currency)
      .setValue(data.value)
      .setOrderId(data.orderId);

    const serverEvent = new ServerEvent()
      .setEventName(data.eventName)
      .setEventTime(data.eventTime)
      .setUserData(userData)
      .setCustomData(customData)
      .setActionSource(data.actionSource);

    if (data.eventSourceUrl) {
      serverEvent.setEventSourceUrl(data.eventSourceUrl);
    }

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(accessToken, pixelId).setEvents(eventsData);

    if (data.testEventCode) {
      eventRequest.setTestEventCode(data.testEventCode);
    }

    try {
      const response = await eventRequest.execute();

      logger.debug('Meta event sent: ', response);
    } catch (error) {
      logger.error('Error: ', error);
    }
  }

  public async sendInitialEvent(
    eventType: 'InitiateCheckout ' | 'AddToCart',
    data: MetaInitIalEventModel
  ) {
    const { logger, accessToken, pixelId } = this.dependencies;

    logger.debug(`Start sending meta conversion api event`, { data });

    const userData = new UserData();
    // It is recommended to send Client IP and User Agent for Conversions API Events.
    if (data.remoteAddress) {
      userData.setClientIpAddress(data.remoteAddress);
    }
    if (data.userAgent) {
      userData.setClientUserAgent(data.userAgent);
    }

    if (data.fbp) {
      userData.setFbp(data.fbp);
    }

    if (data.fbc) {
      userData.setFbc(data.fbc);
    }

    const customData = new CustomData().setCurrency(data.currency).setValue(data.value);

    const serverEvent = new ServerEvent()
      .setEventName(eventType)
      .setEventTime(data.eventTime)
      .setUserData(userData)
      .setCustomData(customData)
      .setActionSource(data.actionSource);

    if (data.eventId) {
      serverEvent.setEventId(data.eventId);
    }

    if (data.eventSourceUrl) {
      serverEvent.setEventSourceUrl(data.eventSourceUrl);
    }

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(accessToken, pixelId).setEvents(eventsData);

    if (data.testEventCode) {
      eventRequest.setTestEventCode(data.testEventCode);
    }

    try {
      const response = await eventRequest.execute();

      logger.debug('Meta event sent: ', response);
    } catch (error) {
      logger.error('Error: ', error);
    }
  }
}
