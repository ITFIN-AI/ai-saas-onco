#!/usr/bin/env node

/**
 * This script runs Firebase emulators directly without using turbo or pnpm scripts
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Firebase emulators directly without turbo...');

// Determine the appropriate firebase binary to use
let firebaseBin = 'firebase'; // default to expecting it in PATH

// Check if firebase-tools is installed locally
const localFirebaseBin = path.join(__dirname, '..', 'node_modules', '.bin', 'firebase');
if (fs.existsSync(localFirebaseBin)) {
  console.log(`Found local Firebase binary at: ${localFirebaseBin}`);
  firebaseBin = localFirebaseBin;
} else {
  console.log('Using firebase from PATH');
}

// Ensure emulator-data directory exists
const emulatorDataDir = path.join(__dirname, '..', 'emulator-data');
if (!fs.existsSync(emulatorDataDir)) {
  console.log(`Creating emulator-data directory at: ${emulatorDataDir}`);
  fs.mkdirSync(emulatorDataDir, { recursive: true });
}

// Run the Firebase emulators
console.log(`Executing: ${firebaseBin} emulators:start --import ./emulator-data --export-on-exit ./emulator-data`);

const emulatorProcess = spawn(firebaseBin, 
  ['emulators:start', '--import', './emulator-data', '--export-on-exit', './emulator-data'], 
  { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  }
);

// Handle process events
emulatorProcess.on('error', (err) => {
  console.error('Failed to start Firebase emulators:', err);
  process.exit(1);
});

emulatorProcess.on('close', (code) => {
  console.log(`Firebase emulators exited with code ${code}`);
  process.exit(code);
});

// Handle signals to properly shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}, shutting down Firebase emulators...`);
    emulatorProcess.kill(signal);
  });
}); 