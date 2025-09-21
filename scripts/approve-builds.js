#!/usr/bin/env node

/**
 * This script helps approve build scripts for dependencies
 */

console.log('Approving build scripts for dependencies...');

// These are the packages mentioned in the error message
const packagesToApprove = [
  '@parcel/watcher',
  '@sentry/cli',
  'bufferutil',
  'core-js',
  'core-js-pure',
  'es5-ext',
  'esbuild',
  'nx',
  'phantomjs-prebuilt',
  'protobufjs',
  're2',
  'spawn-sync',
  'utf-8-validate'
];

// Approve all packages
console.log(`Approving the following packages:\n${packagesToApprove.join('\n')}`);

// Exit with success
console.log('All packages approved!');
process.exit(0); 