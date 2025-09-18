export interface SuccessfulPurchaseTrackingEvent {
  client: {
    email: string;
    phone: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    fbp: string | null;
    fbc: string | null;
  };
  productId: string;
  orderId: string;
  value: number;
  currency: string;
  quantity: number;
  sourceUrl: string | null;
  occurredAt: Date;
}

export interface InitialTrackingEvent {
  eventId: string | null;
  sourceUrl: string | null;
  client: {
    fbp?: string | null;
    fbc?: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  };
  currency: string;
  value: number;
  testEventCode: string | null;
}

export interface ConversionTrackingService {
  trackSuccessfulPurchase: (sale: SuccessfulPurchaseTrackingEvent) => Promise<void>;
  trackInitCheckout: (initCheckout: InitialTrackingEvent) => Promise<void>;
  trackAddToCart: (addToCart: InitialTrackingEvent) => Promise<void>;
}
