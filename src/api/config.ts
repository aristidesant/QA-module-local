// src/api/config.ts

/**
 * Returns the API URL from Vite environment variables (client and server safe).
 */
export function getDefaultApiUrl(): string | undefined {
  // Vite exposes env vars as import.meta.env
  // Use VITE_APP_API_URL for client and server
  return import.meta.env.VITE_APP_API_URL as string | undefined;
}

const DEFAULT_API_URL = getDefaultApiUrl() as string;
export { DEFAULT_API_URL };
