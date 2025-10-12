import * as path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/welcome/',  // Set base path for assets
  build: {
    outDir: 'build', // Output to 'build' directory instead of 'dist'
    sourcemap: true, // Source map generation must be turned on
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from outside container
    allowedHosts: ['aiforyou.agency'],
    strictPort: true,
    hmr: {
      host: 'aiforyou.agency',
      protocol: 'wss',
      clientPort: 443
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
    sentryVitePlugin({
      disable: process.env.NODE_ENV === 'development',
      org: 'software-guru-bogusz-pekalski',
      project: 'akademiasaas',
      // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/software-guru-bogusz-pekalski.sentry/settings/auth-tokens/
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: ['.output/public'],
        ignore: ['node_modules'],
      },
    }),
  ],
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
