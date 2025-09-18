import { PaidSubscriptionPlan, UserSubscriptionInterval } from '@akademiasaas/shared';

export interface CheckSubscriptionInvoiceDTO {
  plan: PaidSubscriptionPlan;
  interval: UserSubscriptionInterval;
}
