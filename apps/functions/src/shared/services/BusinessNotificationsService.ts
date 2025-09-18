import { BusinessEventType } from '@akademiasaas/shared';

export interface BusinessNotificationsService {
  sendMessage: (text: string, eventType: BusinessEventType) => Promise<void>;
}
