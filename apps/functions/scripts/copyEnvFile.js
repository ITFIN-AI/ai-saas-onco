const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Debug: Print current working directory
console.log(`DEBUG: Current working directory is: ${process.cwd()}`);

// Set the source directory for the environment files
const SRC_DIR = '.';

// Set the destination directory for the copied environment file
const DEST_DIR = './lib';

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Get project configuration from .firebaserc (which is two directories up)
const FIREBASERC_PATH = path.resolve('../../.firebaserc');
console.log(`Using .firebaserc at: ${FIREBASERC_PATH}`);

// Get project configurations
const firebaseConfig = JSON.parse(fs.readFileSync(FIREBASERC_PATH, 'utf8'));

// Get the current Firebase project ID from environment variable
const currentProjectId = process.env.GCLOUD_PROJECT;

if (!currentProjectId) {
  console.error('Error: GCLOUD_PROJECT environment variable is not set');
  console.error('This is typically set automatically by Firebase when deploying');
  process.exit(1);
}

console.log(`Current Firebase project ID: ${currentProjectId}`);

// Determine environment by finding which alias maps to the current project ID
let currentEnv = null;
for (const [alias, projectId] of Object.entries(firebaseConfig.projects)) {
  if (projectId === currentProjectId) {
    currentEnv = alias;
    break;
  }
}

// Exit if environment can't be determined
if (!currentEnv) {
  console.error(`Error: Could not determine environment for project ID: ${currentProjectId}`);
  console.error('Make sure the project ID is defined in .firebaserc under "projects"');
  process.exit(1);
}

console.log(`Using environment: ${currentEnv}`);

// Copy the appropriate environment file
const sourceFile = path.join(SRC_DIR, `.env.${currentEnv}`);
const destFile = path.join(DEST_DIR, '.env');

// Check if source file exists
if (fs.existsSync(sourceFile)) {
  try {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`Copied ${sourceFile} to ${destFile} for ${currentEnv} environment`);
  } catch (error) {
    console.error(`Error copying ${sourceFile} to ${destFile}:`, error.message);
    process.exit(1);
  }
} else {
  console.warn(`Warning: ${sourceFile} not found. Creating default .env file for ${currentEnv} environment`);
  
  // Create a default .env file with minimal configuration for local development
  const defaultEnvContent = `# Auto-generated default environment variables for ${currentEnv}
# This file was created because ${sourceFile} was not found
# For production, create the appropriate .env.${currentEnv} file with real values

GOOGLE_CLOUD_PROJECT=${currentProjectId}
ENVIRONMENT_NAME=${currentEnv}
DOMAIN=http://localhost:5004

# PostgreSQL Configuration (for chat history)
POSTGRES_HOST=${process.env.POSTGRES_HOST || 'localhost'}
POSTGRES_PORT=${process.env.POSTGRES_PORT || '5432'}
POSTGRES_DATABASE=${process.env.POSTGRES_DATABASE || 'chat_history'}
POSTGRES_USER=${process.env.POSTGRES_USER || 'postgres'}
POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD || 'postgres'}

# Optional services (empty for local dev)
POSTMARK_API_KEY=
POSTMARK_FROM=
FAKTUROWNIA_API_KEY=
FAKTUROWNIA_API_URL=
FAKTUROWNIA_DEPARTMENT_ID=
SLACK_URL=
SLACK_CHANNEL=
STRIPE_API_KEY=
STRIPE_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRODUCT_ID=
API_JWT_PRIVATE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ADMIN_SECRET_PROJECT_MANAGER_ID=

# PubSub Topics
PUBSUB_BUSINESS_EVENTS_TOPIC=business-events
PUBSUB_INVOICES_EVENTS_TOPIC=invoices-events
PUBSUB_REPORTS_TOPIC=reports-events
PUBSUB_ADMIN_TOPIC=admin-events
`;
  
  try {
    fs.writeFileSync(destFile, defaultEnvContent);
    console.log(`Created default ${destFile} for ${currentEnv} environment`);
  } catch (error) {
    console.error(`Error creating default ${destFile}:`, error.message);
    process.exit(1);
  }
}
