// Sentry Configuration
// For error tracking and monitoring
import * as Sentry from '@sentry/vue';

/**
 * Initialize Sentry in the application
 * @param {import('vue').App} app - Vue application instance
 * @param {import('vue-router').Router} router - Vue Router instance
 */
export function initSentry(app, router) {
  // Only initialize Sentry if the DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not provided. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    app,
    dsn: dsn,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Set environment based on mode
    environment: import.meta.env.MODE,
    // Only enable in production by default
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true',
    // Enable release tracking by using the version from package.json
    release: import.meta.env.VITE_APP_VERSION,
  });

  console.log(`Sentry initialized in ${import.meta.env.MODE} mode`);
}

// Usage instructions:
// 1. Create a Sentry account and project at https://sentry.io
// 2. Find your DSN in the Sentry dashboard
// 3. Add your Sentry DSN to your .env file as VITE_SENTRY_DSN
// 4. Import and call initSentry in your main.js file, passing your Vue app and router 