import axios, { type AxiosRequestConfig } from 'axios';
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

const withQaDefaults = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
	...config,
	headers: { ...qaClientHeaders(), ...config?.headers },
});

/**
 * Thin wrapper over the global axios instance for qa-backend calls: prefixes
 * QA_API_URL and attaches x-client-id while keeping the shared auth/refresh
 * interceptors (they apply to the default instance only).
 */
export const qaHttpClient = {
	get: <T>(path: string, config?: AxiosRequestConfig) =>
		axios.get<T>(`${QA_API_URL}${path}`, withQaDefaults(config)),
	post: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
		axios.post<T>(`${QA_API_URL}${path}`, data, withQaDefaults(config)),
	patch: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
		axios.patch<T>(`${QA_API_URL}${path}`, data, withQaDefaults(config)),
	put: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
		axios.put<T>(`${QA_API_URL}${path}`, data, withQaDefaults(config)),
	delete: <T>(path: string, config?: AxiosRequestConfig) =>
		axios.delete<T>(`${QA_API_URL}${path}`, withQaDefaults(config)),
};
