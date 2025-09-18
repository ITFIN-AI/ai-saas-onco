import {
  ConversionTrackingService,
  InitialTrackingEvent,
  SuccessfulPurchaseTrackingEvent,
} from 'shared/services/ConversionTrackingService';
import { MetaConversionApiClient } from 'shared/infra/services/conversionTracking/MetaConversionApiClient';

export class MetaConversionTrackingService implements ConversionTrackingService {
  constructor(private readonly metaConversionApiClient: MetaConversionApiClient) {}

  async trackSuccessfulPurchase(purchase: SuccessfulPurchaseTrackingEvent): Promise<void> {
    await this.metaConversionApiClient.sendPurchaseEvent({
      emails: [purchase.client.email],
      phones: purchase.client.phone ? [purchase.client.phone] : [],
      remoteAddress: purchase.client.ipAddress,
      userAgent: purchase.client.userAgent,
      fbp: purchase.client.fbp || null,
      fbc: purchase.client.fbc || null,
      productId: purchase.productId,
      quantity: purchase.quantity,
      currency: purchase.currency,
      value: purchase.value / 100,
      eventName: 'Purchase',
      eventTime: Math.floor(purchase.occurredAt.getTime() / 1000),
      eventSourceUrl: purchase.sourceUrl,
      actionSource: 'website',
      orderId: purchase.orderId,
    });
  }

  async trackInitCheckout(initCheckout: InitialTrackingEvent) {
    await this.metaConversionApiClient.sendInitialEvent('InitiateCheckout ', {
      remoteAddress: initCheckout.client.ipAddress,
      userAgent: initCheckout.client.userAgent,
      fbp: initCheckout.client.fbp || null,
      fbc: initCheckout.client.fbc || null,
      currency: initCheckout.currency,
      value: initCheckout.value / 100,
      eventTime: Math.floor(new Date().getTime() / 1000),
      eventSourceUrl: initCheckout.sourceUrl,
      actionSource: 'website',
      testEventCode: initCheckout.testEventCode || null,
      eventId: initCheckout.eventId || null,
    });
  }

  async trackAddToCart(addToCart: InitialTrackingEvent) {
    await this.metaConversionApiClient.sendInitialEvent('AddToCart', {
      remoteAddress: addToCart.client.ipAddress,
      userAgent: addToCart.client.userAgent,
      fbp: addToCart.client.fbp || null,
      fbc: addToCart.client.fbc || null,
      currency: addToCart.currency,
      value: addToCart.value / 100,
      eventTime: Math.floor(new Date().getTime() / 1000),
      eventSourceUrl: addToCart.sourceUrl,
      actionSource: 'website',
      testEventCode: addToCart.testEventCode || null,
      eventId: addToCart.eventId || null,
    });
  }
}
