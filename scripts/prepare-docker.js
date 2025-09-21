const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Create .husky directory if it doesn't exist
const huskyDir = path.join(__dirname, '..', '.husky');
if (!fs.existsSync(huskyDir)) {
  console.log('.husky directory does not exist, creating it');
  fs.mkdirSync(huskyDir, { recursive: true });
}

// Use a minimal environment to avoid E2BIG errors
const minimalEnv = {
  PATH: process.env.PATH,
  NODE_PATH: process.env.NODE_PATH,
  HOME: process.env.HOME,
  SHELL: process.env.SHELL
};

try {
  // Check if git is available
  try {
    execSync('git --version', { stdio: 'pipe', env: minimalEnv });
    console.log('Git is available');
    
    if (os.platform() === 'win32') {
      console.log('Running on Windows');
      execSync('npx husky install', { stdio: 'inherit', env: minimalEnv });
    } else {
      console.log('Running on Unix-like system (macOS, Linux, etc.)');
      execSync('chmod +x ./node_modules/husky/lib/bin.js && npx husky install', { stdio: 'inherit', env: minimalEnv });
      
      // Only chmod .husky/* if files exist
      const huskyFiles = fs.readdirSync(huskyDir);
      if (huskyFiles.length > 0) {
        console.log('Making husky files executable');
        execSync('chmod ug+x .husky/*', { stdio: 'inherit', env: minimalEnv });
      } else {
        console.log('No husky files found to make executable');
        
        // Create a placeholder file so that .husky/* glob works next time
        fs.writeFileSync(path.join(huskyDir, 'pre-commit'), '#!/bin/sh\n# Placeholder for husky pre-commit hook\nexit 0\n');
        console.log('Created placeholder pre-commit hook');
        execSync('chmod ug+x .husky/*', { stdio: 'inherit', env: minimalEnv });
      }
    }
  } catch (gitError) {
    console.log('Git is not available, skipping husky setup');
    
    // Create placeholder files for Docker environment
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }
    fs.writeFileSync(path.join(huskyDir, 'pre-commit'), '#!/bin/sh\n# Placeholder for husky pre-commit hook\nexit 0\n');
    console.log('Created placeholder pre-commit hook');
    
    if (os.platform() !== 'win32') {
      execSync('chmod ug+x .husky/*', { stdio: 'inherit', env: minimalEnv });
    }
  }
  
  console.log('Prepare script completed successfully');
} catch (error) {
  console.error('Error occurred:', error.message);
  // Don't exit with error in Docker environment
  console.log('Continuing despite error to allow Docker build to proceed');
} 