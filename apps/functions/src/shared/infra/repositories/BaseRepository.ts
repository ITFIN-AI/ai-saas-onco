import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
  FirestoreDataConverter,
  Firestore,
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase-admin/firestore';

const rateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://example.com',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'INVALID',
  }),
  limiter: Ratelimit.fixedWindow(1, `1 s`),
  prefix: `firestore-limiter`,
});

type RateLimitOptions = {
  identifierArgs?: number[]; // Indices of arguments to use for the identifier
};

// External decorator function
export function RateLimit(optionalPropertyKey?: string, options: RateLimitOptions = {}) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let identifier = `${target.constructor.name}_${optionalPropertyKey || propertyKey}`;

      if (options.identifierArgs && options.identifierArgs.length > 0) {
        const identifierParts = options.identifierArgs.map((index) => args[index]);
        identifier += `_${identifierParts.join('_')}`;
      }

      const { success, limit, reset, remaining } = await rateLimit.blockUntilReady(
        identifier,
        60_000
      );

      if (!success) {
        const error = new Error('Rate limit exceeded');
        (error as any).response = {
          status: 429,
          data: { limit, reset, remaining },
        };
        throw error;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export class BaseRepository {
  public rateLimit: Ratelimit;

  constructor() {
    this.rateLimit = rateLimit;
  }
  public getDocumentConverter<T extends object>(
    additionalDateFields?: (keyof T)[]
  ): FirestoreDataConverter<T> {
    return {
      toFirestore: (document: T) => document,
      fromFirestore: (document) =>
        this.transformFirestoreTimestampIntoDateInCollection<T>(document, additionalDateFields),
    };
  }

  public transformFirestoreTimestampIntoDate<T extends object>(document: DocumentSnapshot) {
    const data = document.data();

    if (!document.exists || !data) {
      return null;
    }

    return {
      id: document.id,
      ...data,
      createdAt: data.createdAt?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
    } as T;
  }

  public transformFirestoreTimestampIntoDateInCollection<T extends object>(
    document: QueryDocumentSnapshot,
    additionalDateFields: (keyof T)[] = []
  ) {
    const data = document.data();

    if (additionalDateFields?.length && data) {
      additionalDateFields.forEach((field) => {
        const key = field as string;
        if (data[key]) {
          data[key] = data[key]?.toDate?.() || null;
        }
      });
    }

    return {
      id: document.id,
      ...data,
      createdAt: data.createdAt?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
    } as T;
  }

  public transformDateIntoFirestoreTimestamp(
    document: object & {
      createdAt?: Date;
      updatedAt?: Date;
    },
    update = false
  ) {
    return {
      ...document,
      ...(document.createdAt
        ? { createdAt: Timestamp.fromDate(document.createdAt) }
        : update
          ? {}
          : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: update
        ? FieldValue.serverTimestamp()
        : document.updatedAt
          ? Timestamp.fromDate(document.updatedAt)
          : null,
    };
  }

  public async withRateLimit<T>(operation: () => Promise<T>, identifier: string) {
    const { success, limit, reset, remaining } = await this.rateLimit.blockUntilReady(
      identifier,
      30_000
    );

    if (!success) {
      // If rate limit is exceeded, throw an error
      const error = new Error('Rate limit exceeded. Unable to process, even after 30 seconds');
      // @ts-expect-error
      error.response = {
        status: 429,
        data: { limit, reset, remaining },
      };
      throw error;
    }

    return operation();
  }

  public RateLimit() {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: BaseRepository, ...args: unknown[]) {
        const identifier = `${target.constructor.name}_${propertyKey}`;
        const { success, limit, reset, remaining } = await this.rateLimit.blockUntilReady(
          identifier,
          30_000
        );

        if (!success) {
          const error = new Error('Rate limit exceeded');
          // @ts-expect-error
          error.response = {
            status: 429,
            data: { limit, reset, remaining },
          };
          throw error;
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  // https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2
  public async deleteCollection(
    db: Firestore,
    collectionRef: CollectionReference<DocumentData, DocumentData>,
    batchSize = 300
  ) {
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }

  private async deleteQueryBatch(
    db: Firestore,
    query: Query<DocumentData, DocumentData>,
    resolve: (value: unknown) => void
  ) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve('ok');

      return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      this.deleteQueryBatch(db, query, resolve);
    });
  }
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  total: number;
}
