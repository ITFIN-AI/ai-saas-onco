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

try {
  fs.copyFileSync(sourceFile, destFile);
  console.log(`Copied ${sourceFile} to ${destFile} for ${currentEnv} environment`);
} catch (error) {
  console.error(`Error copying ${sourceFile} to ${destFile}:`, error.message);
  process.exit(1);
}
