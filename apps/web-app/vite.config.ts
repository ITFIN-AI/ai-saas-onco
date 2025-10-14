import * as path from 'path';
import { createRequire } from 'module';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgr from 'vite-plugin-svgr';

const require = createRequire(import.meta.url);

// Function to get Sentry plugin if available
function getSentryPlugin(): Plugin | null {
  try {
    // Try to dynamically require the module
    const { sentryVitePlugin } = require('@sentry/vite-plugin');
    return sentryVitePlugin({
      disable: process.env.NODE_ENV === 'development',
      org: 'software-guru-bogusz-pekalski',
      project: 'akademiasaas',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: ['.output/public'],
        ignore: ['node_modules'],
      },
    });
  } catch (e) {
    console.warn('⚠️  Sentry Vite Plugin not available, continuing without it...');
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',  // Set base path for assets
  build: {
    outDir: 'build', // Output to 'build' directory instead of 'dist'
    sourcemap: true, // Source map generation must be turned on
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from outside container
    allowedHosts: ['oncopomoc.pl', 'localhost'],
    strictPort: true,
    watch: {
      usePolling: process.env.NODE_ENV === 'development', // Enable polling in Docker
      interval: 1000, // Poll every 1 second
      ignored: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    hmr: process.env.NODE_ENV === 'production' ? {
      host: 'oncopomoc.pl',
      protocol: 'wss',
      clientPort: 443
    } : {
      // For local development (Docker)
      host: 'localhost',
      protocol: 'ws',
      port: 3000
    }
  },
  optimizeDeps: {
    include: ['**/*.scss'], // Include all .scss files
  },
  css: {
    modules: {
      // Enable CSS Modules for all .scss files
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [
    svgr(),
    react(),
    pluginRewriteAll(),
    // Conditionally add Sentry plugin if available
    getSentryPlugin(),
  ].filter((plugin): plugin is Plugin => plugin !== null),
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    // Force Firebase emulator host for Docker environment
    'import.meta.env.VITE_FIREBASE_EMULATOR_HOST': JSON.stringify(process.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost'),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
