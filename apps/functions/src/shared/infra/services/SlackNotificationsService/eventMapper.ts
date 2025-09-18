import { SubscriberEventType, SubscriptionEventType, UserEventType } from '@akademiasaas/shared';

export const eventMapper = {
  [UserEventType.UserCreated]: {
    name: 'Nowy użytkownik',
  },
  [SubscriberEventType.SubscriberCreated]: {
    name: 'Nowy subskrybent',
  },
  [SubscriptionEventType.ActivatedNewTrialSubscription]: {
    name: 'Aktywowano nowy trial',
  },
  [SubscriptionEventType.ChangedCurrentPlan]: {
    name: 'Zmiana planu dla aktywnej subskrypcji',
  },
  [SubscriptionEventType.InvoicePaid]: {
    name: 'Nowa płatność za subskrypcje',
  },
  [SubscriptionEventType.InvoicePaymentFailed]: {
    name: 'Problem z płatnością za subskrypcje',
  },
  [SubscriptionEventType.EndOfSubscription]: {
    name: 'Churn',
  },
  [SubscriptionEventType.CancelSubscription]: {
    name: 'Churn alert',
  },
  [SubscriptionEventType.ReachedPlanLimits]: {
    name: 'Osiągnięto limit planu',
  },
  [SubscriptionEventType.PlanLimitsSatisfied]: {
    name: 'Limity planu nie są przekroczone',
  },
};
