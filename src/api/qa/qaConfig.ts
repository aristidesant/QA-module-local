import { useSessionStore } from '~/stores/sessionStore';

/**
 * Base URL for the QA backend (qa-backend-service). QA api modules call the
 * global axios instance with absolute URLs built from this constant, so they
 * inherit the shared auth/refresh interceptors from axiosInterceptor.ts.
 */
export const QA_API_URL = import.meta.env.VITE_APP_QA_API_URL as string;

/**
 * qa-backend expects an x-client-id header identifying the active client.
 * Derived from the impersonation target when present, matching how
 * usePermissions resolves the active client.
 */
export const qaClientHeaders = (): Record<string, string> => {
	const { targetClient, user } = useSessionStore.getState();
	const clientId = targetClient?.id ?? user?.clientId ?? user?.client?.id;
	return clientId ? { 'x-client-id': String(clientId) } : {};
};
