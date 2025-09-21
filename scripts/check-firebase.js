#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking Firebase installation...');

// Check if firebase-tools is installed globally
try {
  const globalVersion = execSync('npm list -g firebase-tools', { encoding: 'utf8' });
  console.log('Global firebase-tools installation:');
  console.log(globalVersion);
} catch (error) {
  console.log('Firebase tools not found globally:', error.message);
}

// Check if firebase is in the PATH
try {
  const whichFirebase = execSync('which firebase || echo "Not found"', { encoding: 'utf8' });
  console.log('Firebase binary location:', whichFirebase);
  
  if (whichFirebase.includes('Not found')) {
    console.log('Firebase binary not found in PATH');
  } else {
    try {
      const version = execSync('firebase --version', { encoding: 'utf8' });
      console.log('Firebase version:', version);
    } catch (e) {
      console.log('Error executing firebase --version:', e.message);
    }
  }
} catch (error) {
  console.log('Error checking firebase PATH:', error.message);
}

// Check if firebase-tools is installed locally
try {
  const localPackageJsonPath = path.join(__dirname, '..', 'node_modules', 'firebase-tools', 'package.json');
  if (fs.existsSync(localPackageJsonPath)) {
    const packageJson = require(localPackageJsonPath);
    console.log('Local firebase-tools version:', packageJson.version);
  } else {
    console.log('firebase-tools not found in node_modules');
  }
} catch (error) {
  console.log('Error checking local installation:', error.message);
}

// Check Firebase configuration
try {
  if (fs.existsSync(path.join(__dirname, '..', 'firebase.json'))) {
    console.log('firebase.json found');
    console.log(fs.readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8'));
  } else {
    console.log('firebase.json not found');
  }
} catch (error) {
  console.log('Error checking firebase.json:', error.message);
}

// Check .firebaserc
try {
  if (fs.existsSync(path.join(__dirname, '..', '.firebaserc'))) {
    console.log('.firebaserc found');
    console.log(fs.readFileSync(path.join(__dirname, '..', '.firebaserc'), 'utf8'));
  } else {
    console.log('.firebaserc not found');
  }
} catch (error) {
  console.log('Error checking .firebaserc:', error.message);
}

console.log('Firebase check complete'); 