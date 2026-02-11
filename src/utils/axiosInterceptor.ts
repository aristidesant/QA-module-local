import axios from 'axios';
import { DEFAULT_API_URL } from '~/api/config';

// Configure global axios defaults
axios.defaults.baseURL = DEFAULT_API_URL;
axios.defaults.headers.common['Accept'] = 'application/json';

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

// Handle 401 globally
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		const requestUrl = String(error?.config?.url ?? '');
		// Skip auto-logout for auth endpoints and token-swap related calls
		const isAuthEndpoint =
			requestUrl.includes('/auth/login') ||
			requestUrl.includes('/auth/verify-otp') ||
			requestUrl.includes('/auth/change-client') ||
			requestUrl.includes('/auth/select-client') ||
			requestUrl.includes('/auth/impersonate-client') ||
			requestUrl.includes('/auth/end-impersonation') ||
			requestUrl.includes('/auth/available-clients') ||
			requestUrl.endsWith('/users/me'); // Called during token swap

		if (
			!isAuthEndpoint &&
			error?.response?.status === 401 &&
			typeof window !== 'undefined'
		) {
			// Use centralized logout utility for authenticated requests only
			import('~/utils/logout').then(({ logout }) =>
				logout('/login', { reason: 'expired' })
			);
		}
		return Promise.reject(error);
	}
);

export {}; // make this a module
