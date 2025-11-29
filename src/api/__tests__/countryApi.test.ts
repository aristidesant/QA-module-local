import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import countryApi from '../countryApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CountryModel } from '~/models/CountryModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('countryApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getCountries', () => {
		it('should fetch countries successfully', async () => {
			const mockResponse: CountryModel[] = [
				{
					id: 1,
					isoCode: 'US',
					name: 'United States',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = countryApi();
			const result = await api.getCountries();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/countries`, {
				headers: {},
			});
			expect(result).toEqual(mockResponse);
		});

		it('should include auth headers when provided', async () => {
			const authHeader = { Authorization: 'Bearer token' };
			const mockResponse: CountryModel[] = [
				{
					id: 1,
					isoCode: 'US',
					name: 'United States',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = countryApi(authHeader);
			const result = await api.getCountries();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/countries`, {
				headers: authHeader,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when fetch fails', async () => {
			const error = createMockAxiosError('Fetch failed', 500);
			(axios.get as Mock).mockRejectedValue(error);

			const api = countryApi();
			await expect(api.getCountries()).rejects.toThrow('Fetch failed');
		});
	});
});
