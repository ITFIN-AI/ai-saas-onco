const { execSync } = require('child_process');
const os = require('os');

try {
  if (os.platform() === 'win32') {
    console.log('Running on Windows');
    execSync('npx husky install', { stdio: 'inherit' });
  } else {
    console.log('Running on Unix-like system (macOS, Linux, etc.)');
    execSync('chmod +x ./node_modules/husky/lib/bin.js && npx husky install', { stdio: 'inherit' });
    execSync('chmod ug+x .husky/*', { stdio: 'inherit' });
  }
  console.log('Prepare script completed successfully');
} catch (error) {
  console.error('Error occurred:', error.message);
  process.exit(1);
}
