import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Debug: Print current working directory
console.log(`DEBUG: Current working directory is: ${process.cwd()}`);

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project configuration from .firebaserc (which is at the project root)
const FIREBASERC_PATH = path.resolve(__dirname, '../../../.firebaserc');
console.log(`Using .firebaserc at: ${FIREBASERC_PATH}`);

// Get project configurations
const firebaseConfig = JSON.parse(fs.readFileSync(FIREBASERC_PATH, 'utf8'));

// Get the current Firebase project ID from environment variable
// If not set, try to use BUILD_ENV or default to 'develop'
let currentProjectId = 'ai-oncology'; //process.env.GCLOUD_PROJECT;

if (!currentProjectId) {
  const buildEnv = process.env.BUILD_ENV || 'develop';
  console.warn(`Warning: GCLOUD_PROJECT environment variable is not set`);
  console.warn(`Using BUILD_ENV=${buildEnv} to determine project ID`);
  
  // Get project ID from .firebaserc using the environment alias
  if (firebaseConfig.projects[buildEnv]) {
    currentProjectId = firebaseConfig.projects[buildEnv];
    console.log(`Resolved project ID from ${buildEnv}: ${currentProjectId}`);
  } else {
    console.error(`Error: Could not find project for environment: ${buildEnv}`);
    console.error(`Available environments: ${Object.keys(firebaseConfig.projects).join(', ')}`);
    process.exit(1);
  }
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

// First run TypeScript compilation
try {
  console.log('Running TypeScript compilation...');
  execSync('tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during TypeScript compilation:', error.message);
  process.exit(1);
}

// Then build with the appropriate mode
try {
  console.log(`Building web app for ${currentEnv} environment...`);
  execSync(`vite build --mode ${currentEnv}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error building web app:', error.message);
  process.exit(1);
}
