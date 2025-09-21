import firebase from 'firebase/compat/app';
import {
  AppStore,
  createStore,
  DEFAULT_FIREBASE_REGION,
  FirestoreUtils,
  StoreDependencies,
} from '@akademiasaas/shared';
import { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import 'firebase/compat/functions';
import 'firebase/compat/database';
import 'firebase/compat/performance';
import 'firebase/compat/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { NoOpAnalyticsService, WebAnalyticsService } from '~/services/WebAnalyticsService';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
  VITE_FIREBASE_EMULATOR,
  VITE_FIREBASE_EMULATOR_HOST,
  VITE_POSTHOG_API_KEY,
  VITE_USE_ANALYTICS,
  VITE_USE_PERFORMANCE_MONITORING,
} = import.meta.env;

// Debug: Log all environment variables
console.log('DEBUG: All import.meta.env:', import.meta.env);
console.log('DEBUG: VITE_FIREBASE_EMULATOR:', VITE_FIREBASE_EMULATOR);
console.log('DEBUG: VITE_FIREBASE_EMULATOR_HOST:', VITE_FIREBASE_EMULATOR_HOST);

export const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

export let db: firebase.firestore.Firestore | null = null;
export let functions: firebase.functions.Functions | null = null;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  const storage = firebase.storage();
  functions = firebase.app().functions(DEFAULT_FIREBASE_REGION);

  if (VITE_FIREBASE_EMULATOR === 'true') {
    // eslint-disable-next-line no-console
    console.warn('Running on Firebase emulator!');
    
    // Use environment variable for emulator host, with fallback to 'firebase' for Docker
    // Since we're running in Docker, default to 'firebase' service name
    const emulatorHost = VITE_FIREBASE_EMULATOR_HOST || 'firebase';
    
    // eslint-disable-next-line no-console
    console.log('Firebase emulator host:', emulatorHost);
    // eslint-disable-next-line no-console
    console.log('All VITE env vars:', { VITE_FIREBASE_EMULATOR, VITE_FIREBASE_EMULATOR_HOST });
    
    db.useEmulator(emulatorHost, 8080);
    firebase.auth().useEmulator(`http://${emulatorHost}:9099/`);
    functions.useEmulator(emulatorHost, 5001);
    storage.useEmulator(emulatorHost, 9199);
    firebase.database().useEmulator(emulatorHost, 9000);
  }
}

export const perf = VITE_USE_PERFORMANCE_MONITORING === 'true' ? firebase.performance() : null; // TODO: FIX PERFORMANCE MONITORING
const analyticsService =
  VITE_USE_ANALYTICS === 'true'
    ? new WebAnalyticsService({
        // TODO: FIX ANALYTICS
        postHogApiKey: VITE_POSTHOG_API_KEY || '',
      })
    : new NoOpAnalyticsService();

export const { store } = createStore({
  firestore: firebase.firestore,
  auth: firebase.auth,
  analytics: analyticsService,
  db: db || firebase.firestore(),
  functions: functions || firebase.app().functions(DEFAULT_FIREBASE_REGION),
  database: firebase.database,
  config: {
    APP_FUNCTION_DOMAIN: import.meta.env.VITE_FUNCTION_DOMAIN,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<AppStore, StoreDependencies & FirestoreUtils, AnyAction>;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
