/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly APP_VERSION: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_CHECKOUT_PRODUCT_INFO_URL: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_FIREBASE_EMULATOR: string;
  readonly VITE_FIREBASE_EMULATOR_HOST: string;
  readonly VITE_FUNCTION_DOMAIN: string;
  readonly VITE_ENV_NAME: string;
  readonly VITE_POSTHOG_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
