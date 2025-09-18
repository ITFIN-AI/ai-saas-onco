import { UserDocument } from '@akademiasaas/shared';
import Stripe from 'stripe';
import { BaseOrder } from '@akademiasaas/shared';
import { StripeInvoiceWithId } from 'shared/models/stripe';

export interface UsersRepository {
  findUserById: (userId: string) => Promise<UserDocument | null>;
  findUserBySlug: (slug: string) => Promise<UserDocument | null>;
  findUserByDomain: (domain: string) => Promise<UserDocument | null>;
  findUserByEmail: (email: string) => Promise<UserDocument | null>;
  createUser: (userData: UserDocument) => Promise<void>;
  updateUser: (userId: string, user: Partial<UserDocument>) => Promise<void>;
  updateUserField: (userId: string, key: string[], value: unknown) => Promise<void>;
  getAllUserIds: () => Promise<string[]>;
  getAllUsers: () => Promise<UserDocument[]>;
  getAllCreators: () => Promise<UserDocument[]>;
  upsertSubscriptionData: (
    userId: string,
    subscriptionId: string,
    subscription: Stripe.Subscription
  ) => Promise<void>;
  addSubscriptionInvoice: (userId: string, invoice: StripeInvoiceWithId) => Promise<void>;
  findSubscriptionInvoice: (
    userId: string,
    invoiceId: string
  ) => Promise<StripeInvoiceWithId | null>;
  updateSubscriptionInvoice: (
    userId: string,
    invoiceId: string,
    invoice: Partial<Stripe.Invoice & { connectedInvoice: BaseOrder['connectedInvoice'] }>
  ) => Promise<void>;
  getAllActiveSalesPages: () => Promise<UserDocument[]>;
}
