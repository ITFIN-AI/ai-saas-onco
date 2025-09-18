import { FieldPath, Firestore } from 'firebase-admin/firestore';
import { COLLECTION } from '../../collectionNames';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { BaseRepository } from './BaseRepository';
import { UserDocument, BaseOrder } from '@akademiasaas/shared';
import Stripe from 'stripe';
import { StripeInvoiceWithId } from 'shared/models/stripe';

interface Dependencies {
  db: Firestore;
}

export class FirebaseUsersRepository extends BaseRepository implements UsersRepository {
  constructor(private dependencies: Dependencies) {
    super();
  }

  public async findUserById(userId: string): Promise<null | UserDocument> {
    const ref = this.dependencies.db.collection(COLLECTION.USERS).doc(userId);
    const userDoc = await ref.get();

    return this.transformFirestoreTimestampIntoDate<UserDocument>(userDoc);
  }

  public async findUserBySlug(slug: string): Promise<null | UserDocument> {
    const ref = this.dependencies.db
      .collection(COLLECTION.USERS)
      .where('salesPageSettings.slug', '==', slug);
    const snapshot = await ref.get();

    if (snapshot.empty) {
      return null;
    }

    if (snapshot.size > 1) {
      throw new Error(`More than one user has the same slug ${slug}`);
    }

    return this.transformFirestoreTimestampIntoDate<UserDocument>(snapshot.docs[0]);
  }

  public async findUserByDomain(domain: string): Promise<null | UserDocument> {
    const ref = this.dependencies.db
      .collection(COLLECTION.USERS)
      .where('salesPageSettings.domains', 'array-contains', domain);
    const snapshot = await ref.get();

    if (snapshot.empty) {
      return null;
    }

    if (snapshot.size > 1) {
      throw new Error(`More than one user has the same domain ${domain}`);
    }

    return this.transformFirestoreTimestampIntoDate<UserDocument>(snapshot.docs[0]);
  }

  public async findUserByEmail(email: string): Promise<null | UserDocument> {
    const ref = this.dependencies.db.collection(COLLECTION.USERS).where('email', '==', email);
    const userSnapshot = await ref.get();

    if (userSnapshot.empty) {
      return null;
    }
    const [doc] = userSnapshot.docs;

    return this.transformFirestoreTimestampIntoDate<UserDocument>(doc);
  }

  public async updateUser(userId: string, data: Partial<UserDocument>) {
    const ref = this.dependencies.db.collection(COLLECTION.USERS).doc(userId);
    await ref.update(this.transformDateIntoFirestoreTimestamp(data, true));
  }

  public async updateUserField(userId: string, key: string[], value: unknown) {
    const ref = this.dependencies.db.collection(COLLECTION.USERS).doc(userId);
    await ref.update(new FieldPath(...key), value);
  }

  public async createUser(userData: UserDocument) {
    const { db } = this.dependencies;

    const ref = db.collection(COLLECTION.USERS).doc(userData.uid);

    await ref.set(this.transformDateIntoFirestoreTimestamp(userData));
  }

  public async getAllUserIds() {
    const { db } = this.dependencies;

    const ref = db.collection(COLLECTION.USERS);

    const snapshot = await ref.get();

    return snapshot.docs.map((doc) => doc.id);
  }

  public async getAllUsers() {
    const { db } = this.dependencies;

    const ref = db.collection(COLLECTION.USERS);

    const snapshot = await ref.get();

    return snapshot.docs.map((doc) =>
      this.transformFirestoreTimestampIntoDateInCollection<UserDocument>(doc)
    );
  }

  public async getAllCreators() {
    const { db } = this.dependencies;

    const ref = db
      .collection(COLLECTION.USERS)
      .where('allowedRoles', 'array-contains', 'creator')
      .withConverter(this.getDocumentConverter<UserDocument>());

    const snapshot = await ref.get();

    return snapshot.docs.map((doc) => doc.data());
  }

  public async upsertSubscriptionData(
    userId: string,
    subscriptionId: string,
    subscription: Stripe.Subscription
  ) {
    const { db } = this.dependencies;

    const ref = db
      .collection(COLLECTION.USERS)
      .doc(userId)
      .collection(COLLECTION.USER_SUBSCRIPTIONS)
      .doc(subscriptionId);

    await ref.set(subscription, { merge: true });
  }

  public async addSubscriptionInvoice(userId: string, invoice: StripeInvoiceWithId) {
    const { db } = this.dependencies;

    const ref = db
      .collection(COLLECTION.USERS)
      .doc(userId)
      .collection(COLLECTION.USER_SUBSCRIPTION_INVOICES)
      .doc(invoice.id);

    await ref.set(invoice);
  }

  public async findSubscriptionInvoice(userId: string, invoiceId: string) {
    const { db } = this.dependencies;

    const ref = db
      .collection(COLLECTION.USERS)
      .doc(userId)
      .collection(COLLECTION.USER_SUBSCRIPTION_INVOICES)
      .doc(invoiceId);

    const doc = await ref.get();

    return this.transformFirestoreTimestampIntoDate<StripeInvoiceWithId>(doc);
  }

  public async updateSubscriptionInvoice(
    userId: string,
    invoiceId: string,
    invoice: Partial<Stripe.Invoice & { connectedInvoice: BaseOrder['connectedInvoice'] }>
  ) {
    const { db } = this.dependencies;

    const ref = db
      .collection(COLLECTION.USERS)
      .doc(userId)
      .collection(COLLECTION.USER_SUBSCRIPTION_INVOICES)
      .doc(invoiceId);

    await ref.update(invoice);
  }

  public async getAllActiveSalesPages() {
    const ref = await this.dependencies.db
      .collection(COLLECTION.USERS)
      .where('salesPageSettings.active', '==', true);

    const snapshot = await ref.get();

    return snapshot.docs.map((doc) =>
      this.transformFirestoreTimestampIntoDateInCollection<UserDocument>(doc)
    );
  }
}
