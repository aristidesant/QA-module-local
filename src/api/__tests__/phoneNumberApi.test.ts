import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import { getPhoneNumbers, getSimplePhoneNumberList } from '../phoneNumberApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	PhoneNumberListParams,
	PhoneNumberListResponse,
	SimplePhoneNumberListParams,
	SimplePhoneNumber,
} from '../phoneNumberApi';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('phoneNumberApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getPhoneNumbers', () => {
		it('should get phone numbers without params', async () => {
			const mockResponse: PhoneNumberListResponse = {
				data: [
					{
						id: 1,
						identifier: 'twilio-123',
						label: 'Main Line',
						status: 'Active',
						description: 'Primary outbound number',
						provider: 'twilio',
						type: 'OUTBOUND',
						phoneNumber: '+1234567890',
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
				],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getPhoneNumbers();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/phone-numbers`, {
				params: undefined,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get phone numbers with params', async () => {
			const params: PhoneNumberListParams = {
				status: 'Active',
				type: 'OUTBOUND',
				page: 1,
				limit: 20,
			};
			const mockResponse: PhoneNumberListResponse = {
				data: [
					{
						id: 1,
						identifier: 'twilio-456',
						label: 'Main Line',
						status: 'Active',
						description: 'Primary outbound number',
						provider: 'twilio',
						type: 'OUTBOUND',
						phoneNumber: '+1234567890',
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
				],
				total: 1,
				page: 1,
				limit: 20,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getPhoneNumbers(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/phone-numbers`, {
				params,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should use custom API URL', async () => {
			const customUrl = 'http://custom-api.example.com';
			const mockResponse: PhoneNumberListResponse = {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getPhoneNumbers({}, customUrl);

			expect(axios.get).toHaveBeenCalledWith(`${customUrl}/phone-numbers`, {
				params: {},
			});
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const params: PhoneNumberListParams = { status: 'Active' };
			const error = createMockAxiosError('Server error', 500);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(getPhoneNumbers(params)).rejects.toThrow('Server error');
		});
	});

	describe('getSimplePhoneNumberList', () => {
		it('should get simple phone number list without params', async () => {
			const mockResponse: SimplePhoneNumber[] = [
				{
					id: 1,
					phoneNumber: '+1234567890',
					label: 'Main Line',
				},
				{
					id: 2,
					phoneNumber: '+0987654321',
					label: 'Secondary Line',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getSimplePhoneNumberList();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/phone-numbers/simple/list`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get simple phone number list with type filter', async () => {
			const params: SimplePhoneNumberListParams = { type: 'INBOUND' };
			const mockResponse: SimplePhoneNumber[] = [
				{
					id: 3,
					phoneNumber: '+1111111111',
					label: 'Inbound Line',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getSimplePhoneNumberList(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/phone-numbers/simple/list`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should use custom API URL', async () => {
			const customUrl = 'http://custom-api.example.com';
			const mockResponse: SimplePhoneNumber[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getSimplePhoneNumberList({}, customUrl);

			expect(axios.get).toHaveBeenCalledWith(
				`${customUrl}/phone-numbers/simple/list`,
				{ params: {} }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const params: SimplePhoneNumberListParams = { type: 'OUTBOUND' };
			const error = createMockAxiosError('Unauthorized', 401);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(getSimplePhoneNumberList(params)).rejects.toThrow(
				'Unauthorized'
			);
		});
	});
});
