/**
 * Demo mode: the app opens without login, as the same mock user the local dev
 * server uses. Enabled at build time with `VITE_APP_DEMO=true`, so a deployed
 * mockup can be shared without a backend or credentials.
 */
export const isDemoMode = import.meta.env.VITE_APP_DEMO === 'true';
