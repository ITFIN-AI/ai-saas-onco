export enum UserEventType {
  UserCreated = 'user.UserCreated',
}

export enum SubscriberEventType {
  SubscriberCreated = 'subscriber.SubscriberCreated',
}

export enum SubscriptionEventType {
  ActivatedNewTrialSubscription = 'subscription.ActivatedNewTrialSubscription',
  ChangedCurrentPlan = 'subscription.ChangeCurrentPlan',
  InvoicePaid = 'subscription.InvoicePaid',
  InvoicePaymentFailed = 'subscription.InvoicePaymentFailed',
  ReachedPlanLimits = 'subscription.ReachedPlanLimits',
  EndOfSubscription = 'subscription.EndOfSubscription',
  CancelSubscription = 'subscription.CancelSubscription',
  PlanLimitsSatisfied = 'subscription.PlanLimitsSatisfied',
}

export type BusinessEventType = UserEventType | SubscriberEventType | SubscriptionEventType;
