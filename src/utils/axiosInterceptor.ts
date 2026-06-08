import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { DEFAULT_API_URL } from '~/api/config';
import { refreshAccessToken } from '~/api/authApi';
import { useSessionStore } from '~/stores/sessionStore';

// Configure global axios defaults
axios.defaults.baseURL = DEFAULT_API_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
if (import.meta.env.DEV) {
	axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

// Attach a request interceptor to inject the Bearer token and appropriate content-type
axios.interceptors.request.use(
	(config) => {
		try {
			// If payload is FormData, let the browser/axios set the correct multipart boundary
			const isFormData =
				typeof FormData !== 'undefined' && config.data instanceof FormData;

			if (isFormData) {
				// Remove any preset content-type so axios can set it with the boundary
				if (config.headers['Content-Type'])
					delete config.headers['Content-Type'];
				if (config.headers['content-type'])
					delete config.headers['content-type'];
			} else {
				// Ensure JSON content-type by default for non-FormData requests
				if (
					!config.headers['Content-Type'] &&
					!config.headers['content-type']
				) {
					config.headers['Content-Type'] = 'application/json';
				}
			}

			// Add Authorization if not explicitly provided per-request
			const hasAuthHeader = Boolean(
				(config.headers &&
					(config.headers['Authorization'] ||
						config.headers['authorization'])) ||
				false
			);
			if (!hasAuthHeader && typeof window !== 'undefined') {
				const token = window.sessionStorage?.getItem('accessToken');
				if (token) {
					config.headers['Authorization'] = `Bearer ${token}`;
				}
			}
		} catch (_) {
			// noop
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Concurrency state for refresh token flow
let isRefreshing = false;
type QueueEntry = {
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
};
let pendingQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
	pendingQueue.forEach((entry) => {
		if (error) {
			entry.reject(error);
		} else {
			entry.resolve(token as string);
		}
	});
	pendingQueue = [];
}

// Handle 401 globally
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error?.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};
		const requestUrl = String(originalRequest?.url ?? '');

		// Skip refresh logic for auth endpoints and token-swap related calls
		const isAuthEndpoint =
			requestUrl.includes('/auth/login') ||
			requestUrl.includes('/auth/verify-otp') ||
			requestUrl.includes('/auth/change-client') ||
			requestUrl.includes('/auth/select-client') ||
			requestUrl.includes('/auth/impersonate-client') ||
			requestUrl.includes('/auth/end-impersonation') ||
			requestUrl.includes('/auth/available-clients') ||
			requestUrl.includes('/auth/refresh') ||
			requestUrl.endsWith('/users/me'); // Called during token swap

		if (
			!isAuthEndpoint &&
			error?.response?.status === 401 &&
			!originalRequest?._retry &&
			typeof window !== 'undefined'
		) {
			const storedRefreshToken = window.sessionStorage?.getItem('refreshToken');

			// No refresh token available — log out immediately
			if (!storedRefreshToken) {
				import('~/utils/logout').then(({ logout }) =>
					logout('/login', { reason: 'expired' })
				);
				return Promise.reject(error);
			}

			// If a refresh is already in flight, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					pendingQueue.push({
						resolve: (token) => {
							originalRequest.headers['Authorization'] = `Bearer ${token}`;
							resolve(axios(originalRequest));
						},
						reject,
					});
				});
			}

			// Mark this request so it won't be retried again on another 401
			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const tokens = await refreshAccessToken(storedRefreshToken);

				// Persist the new tokens
				const { setToken, setRefreshToken } = useSessionStore.getState();
				setToken(tokens.accessToken);
				setRefreshToken(tokens.refreshToken);

				// Update the Authorization header on the original request and retry
				originalRequest.headers['Authorization'] =
					`Bearer ${tokens.accessToken}`;

				processQueue(null, tokens.accessToken);
				return axios(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				import('~/utils/logout').then(({ logout }) =>
					logout('/login', { reason: 'expired' })
				);
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export {}; // make this a module
