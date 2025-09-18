import { SubscriptionPlan, UserSubscriptionInterval } from '@akademiasaas/shared';

export interface ChangeSubscriptionPlanDTO {
  plan: SubscriptionPlan;
  interval: UserSubscriptionInterval;
}
