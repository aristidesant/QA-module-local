import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import { doNotCallApi } from '../doNotCallApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	DoNotCallModel,
	DoNotCallListResponse,
	DoNotCallCreateRequest,
	DoNotCallUpdateRequest,
	DoNotCallCheckResponse,
	DoNotCallCleanExpiredResponse,
} from '~/models/DoNotCallModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('doNotCallApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getAll', () => {
		it('should get all DNC entries without params', async () => {
			const mockResponse: DoNotCallListResponse = {
				data: [
					{
						id: 1,
						clientId: 1,
						phoneNumber: '+1234567890',
						reason: 'CUSTOMER_REQUEST',
						notes: 'Requested removal',
						expiresAt: null,
						createdByUserId: 1,
						callDispositionId: null,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
						isActive: true,
					},
				],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.getAll();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/do-not-call`, {
				params: undefined,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get all DNC entries with params', async () => {
			const params = { phoneNumber: '+1234567890', page: 1 };
			const mockResponse: DoNotCallListResponse = {
				data: [
					{
						id: 1,
						clientId: 1,
						phoneNumber: '+1234567890',
						reason: 'CUSTOMER_REQUEST',
						notes: 'Requested removal',
						expiresAt: null,
						createdByUserId: 1,
						callDispositionId: null,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
						isActive: true,
					},
				],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.getAll(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/do-not-call`, {
				params,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getById', () => {
		it('should get DNC entry by id', async () => {
			const id = 1;
			const mockResponse: DoNotCallModel = {
				id: 1,
				clientId: 1,
				phoneNumber: '+1234567890',
				reason: 'CUSTOMER_REQUEST',
				notes: 'Requested removal',
				expiresAt: null,
				createdByUserId: 1,
				callDispositionId: null,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				isActive: true,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.getById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when entry not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Entry not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(doNotCallApi.getById(id)).rejects.toThrow('Entry not found');
		});
	});

	describe('check', () => {
		it('should check if phone number is in DNC list', async () => {
			const phoneNumber = '+1234567890';
			const mockResponse: DoNotCallCheckResponse = {
				phoneNumber: '+1234567890',
				isBlocked: true,
				dncEntry: {
					id: 1,
					clientId: 1,
					phoneNumber: '+1234567890',
					reason: 'CUSTOMER_REQUEST',
					notes: 'Requested removal',
					expiresAt: null,
					createdByUserId: 1,
					callDispositionId: null,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					isActive: true,
				},
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.check(phoneNumber);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call/check/${encodeURIComponent(phoneNumber)}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('create', () => {
		it('should create a DNC entry successfully', async () => {
			const mockData: DoNotCallCreateRequest = {
				phoneNumber: '+1234567890',
				reason: 'CUSTOMER_REQUEST',
				notes: 'Requested removal',
			};
			const mockResponse: DoNotCallModel = {
				id: 1,
				clientId: 1,
				phoneNumber: '+1234567890',
				reason: 'CUSTOMER_REQUEST',
				notes: 'Requested removal',
				expiresAt: null,
				createdByUserId: 1,
				callDispositionId: null,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				isActive: true,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.create(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData: DoNotCallCreateRequest = {
				phoneNumber: '+1234567890',
				reason: 'CUSTOMER_REQUEST',
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(doNotCallApi.create(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('update', () => {
		it('should update a DNC entry successfully', async () => {
			const id = 1;
			const mockData: DoNotCallUpdateRequest = {
				reason: 'DISPOSITION_OUTCOME',
				notes: 'Updated notes',
			};
			const mockResponse: DoNotCallModel = {
				id: 1,
				clientId: 1,
				phoneNumber: '+1234567890',
				reason: 'DISPOSITION_OUTCOME',
				notes: 'Updated notes',
				expiresAt: null,
				createdByUserId: 1,
				callDispositionId: null,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				isActive: true,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.update(id, mockData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call/${id}`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('delete', () => {
		it('should delete a DNC entry successfully', async () => {
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			await doNotCallApi.delete(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call/${id}`
			);
		});
	});

	describe('cleanExpired', () => {
		it('should clean expired DNC entries successfully', async () => {
			const mockResponse: DoNotCallCleanExpiredResponse = {
				cleaned: 5,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await doNotCallApi.cleanExpired();

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/do-not-call/clean-expired`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
