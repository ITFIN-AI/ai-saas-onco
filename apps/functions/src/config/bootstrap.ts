import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import { Pool } from 'pg';

import { EnvConfig } from '../shared/infra/types';

// Check if we're running in the emulator
const isEmulator = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

if (isEmulator) {
  functions.logger.info(`Running in emulator mode - Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

// Initialize Firebase Admin
const app = !getApps().length 
  ? initializeApp(isEmulator ? {
      projectId: 'ai-oncology',
    } : undefined)
  : getApps()[0];

const firestore = getFirestore(app);

try {
  const settings: any = { ignoreUndefinedProperties: true };
  // Don't use preferRest in emulator mode as it causes auth issues
  if (!isEmulator) {
    settings.preferRest = true;
  }
  firestore.settings(settings);
} catch (e) {
  functions.logger.error('Cannot set firestore settings', e);
}

export const db = firestore;
export const env: EnvConfig = {
  domain: process.env.DOMAIN || '',
  environmentName: process.env.ENVIRONMENT_NAME || '',
  secretProjectManagerId: process.env.ADMIN_SECRET_PROJECT_MANAGER_ID || '',
  pubsub: {
    businessEvents: process.env.PUBSUB_BUSINESS_EVENTS_TOPIC || 'bussines-events',
    invoicesEvents: process.env.PUBSUB_INVOICES_EVENTS_TOPIC || 'invoices-events',
    reports: process.env.PUBSUB_REPORTS_TOPIC || 'reports-events',
    admin: process.env.PUBSUB_ADMIN_TOPIC || 'admin-events',
  },
  postmark: {
    apiKey: process.env.POSTMARK_API_KEY || '',
    defaultSender: process.env.POSTMARK_FROM || '',
  },
  fakturownia: {
    apiKey: process.env.FAKTUROWNIA_API_KEY || '',
    apiUrl: process.env.FAKTUROWNIA_API_URL || '',
    departmentId: process.env.FAKTUROWNIA_DEPARTMENT_ID || '',
  },
  slack: {
    url: process.env.SLACK_URL || '',
    channel: process.env.SLACK_CHANNEL || '',
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY || '',
    clientId: process.env.STRIPE_CLIENT_ID || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    productId: process.env.STRIPE_PRODUCT_ID || '',
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
  api: {
    jwtPrivateKey: process.env.API_JWT_PRIVATE_KEY || '',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'chat_history',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  },
};

// PostgreSQL connection pool
export const postgresPool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  database: env.postgres.database,
  user: env.postgres.user,
  password: env.postgres.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
