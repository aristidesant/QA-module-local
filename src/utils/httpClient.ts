import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { DEFAULT_API_URL } from '~/api/config';

/**
 * Creates an HTTP client with automatic 401 error handling.
 * This client will automatically redirect to logout when receiving 401 responses.
 *
 * @param authToken - Optional authentication token to include in requests
 * @param baseURL - Optional base URL override (defaults to API_URL from env)
 * @returns Configured Axios instance
 */
export function createHttpClient(
	authToken?: string,
	baseURL: string = DEFAULT_API_URL
): AxiosInstance {
	const client = axios.create({
		baseURL,
		headers: {
			'Content-Type': 'application/json',
		},
		// Set a reasonable timeout (30 seconds)
		timeout: 30000,
	});

	// Request interceptor to add auth token
	client.interceptors.request.use(
		(config) => {
			if (authToken) {
				config.headers.Authorization = `Bearer ${authToken}`;
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Response interceptor to handle 401 errors
	client.interceptors.response.use(
		(response: AxiosResponse) => {
			// Return successful responses as-is
			return response;
		},
		(error) => {
			// Handle 401 Unauthorized errors
			if (error.response?.status === 401) {
				console.warn(
					'HTTP 401: Authentication failed, redirecting to logout...'
				);

				// Only handle redirect on client side
				if (typeof window !== 'undefined') {
					// Use centralized logout utility
					import('~/utils/logout').then(({ logout }) =>
						logout('/login', { reason: 'expired' })
					);
				}
			}

			// Re-throw the error so TanStack Query can handle it appropriately
			return Promise.reject(error);
		}
	);

	return client;
}

/**
 * Default HTTP client instance without authentication
 * Useful for public endpoints like login
 */
export const httpClient = createHttpClient();

/**
 * Creates an authenticated HTTP client with the provided token
 * @param token - JWT token for authentication
 * @returns Authenticated Axios instance
 */
export const createAuthenticatedHttpClient = (token: string) => {
	return createHttpClient(token);
};

/**
 * Utility type for API error responses
 */
export interface ApiError {
	message: string | string[];
	statusCode: number;
	error?: string;
	details?: any;
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiError(
	error: any
): error is { response: { data: ApiError } } {
	return (
		error?.response?.data &&
		typeof error.response.data === 'object' &&
		'message' in error.response.data
	);
}

/**
 * Extracts error message from various error types
 * Useful for consistent error handling in components
 */
export function getErrorMessage(error: any): string {
	if (isApiError(error)) {
		const message = error.response.data.message;
		// Handle array of messages from validation errors
		if (Array.isArray(message)) {
			return message.join(', ');
		}
		return message;
	}

	if (error?.response?.data?.message) {
		const message = error.response.data.message;
		// Handle array of messages from validation errors
		if (Array.isArray(message)) {
			return message.join(', ');
		}
		return message;
	}

	if (error?.message) {
		return error.message;
	}

	return 'An unexpected error occurred';
}
