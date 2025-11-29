/**
 * API Test Utilities
 *
 * This module provides helper functions for mocking axios in API tests.
 * All API tests should use these utilities for consistent mocking behavior.
 */
import { vi, type Mock, type Mocked } from 'vitest';
import axios from 'axios';

// Mock axios module
vi.mock('axios');

// Type-safe axios mock
export const mockedAxios = axios as Mocked<typeof axios>;

/**
 * Resets all axios mocks before each test
 */
export function resetAxiosMocks() {
	vi.clearAllMocks();
	(axios.get as Mock).mockReset();
	(axios.post as Mock).mockReset();
	(axios.patch as Mock).mockReset();
	(axios.put as Mock).mockReset();
	(axios.delete as Mock).mockReset();
}

/**
 * Creates a mock response object
 */
export function createMockResponse<T>(data: T, status = 200) {
	return {
		data,
		status,
		statusText: 'OK',
		headers: {},
		config: {},
	};
}

/**
 * Creates a mock axios error
 */
export function createMockAxiosError(
	message: string,
	status: number,
	data?: unknown
) {
	const error = new Error(message) as any;
	error.isAxiosError = true;
	error.response = {
		status,
		data: data ?? { message },
		statusText: message,
		headers: {},
		config: {},
	};
	return error;
}

// Default API URL for tests
export const TEST_API_URL = 'http://test-api.example.com';
