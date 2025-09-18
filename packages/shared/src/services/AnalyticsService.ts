// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnalyticsProperty = any;
export type AnalyticsProperties = Record<string, AnalyticsProperty>;

export type AnalyticsUserProperties = {
  email?: string | null;
  name?: string | null;
};

export interface AnalyticsService {
  track(event_name: string, properties?: AnalyticsProperties): void;
  identify(userId: string, userProperties?: AnalyticsUserProperties): void;
  updateUserProperties(userId: string, userProperties: AnalyticsUserProperties): void;
}
