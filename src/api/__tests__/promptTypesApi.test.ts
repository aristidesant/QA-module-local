import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import promptTypesApi from '../promptTypesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { PromptType } from '~/models/PromptTypeModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('promptTypesApi', () => {
	let api: ReturnType<typeof promptTypesApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = promptTypesApi();
	});

	describe('createPromptType', () => {
		it('should create a prompt type successfully', async () => {
			const promptTypeData: Partial<PromptType> = {
				name: 'Sales Type',
				description: 'Sales conversation types',
			};
			const mockResponse: PromptType = {
				id: 1,
				name: 'Sales Type',
				description: 'Sales conversation types',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createPromptType(promptTypeData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-types`,
				promptTypeData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const promptTypeData: Partial<PromptType> = {
				name: 'Test Type',
			};
			const error = createMockAxiosError('Validation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(api.createPromptType(promptTypeData)).rejects.toThrow(
				'Validation failed'
			);
		});
	});

	describe('findAllPromptTypes', () => {
		it('should get all prompt types without params', async () => {
			const mockResponse: PromptType[] = [
				{
					id: 1,
					name: 'Sales Type',
					description: 'Sales conversation types',
					icon: 'sales-icon',
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptTypes();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompt-types`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get all prompt types with params', async () => {
			const params = { search: 'sales' };
			const mockResponse: PromptType[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptTypes(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompt-types`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findPromptType', () => {
		it('should get prompt type by id', async () => {
			const promptTypeId = '1';
			const mockResponse: PromptType = {
				id: 1,
				name: 'Sales Type',
				description: 'Sales conversation types',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findPromptType(promptTypeId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-types/${promptTypeId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when type not found', async () => {
			const promptTypeId = '999';
			const error = createMockAxiosError('Type not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.findPromptType(promptTypeId)).rejects.toThrow(
				'Type not found'
			);
		});
	});

	describe('updatePromptType', () => {
		it('should update a prompt type successfully', async () => {
			const promptTypeId = '1';
			const updateData: Partial<PromptType> = {
				name: 'Updated Sales Type',
				description: 'Updated description',
			};
			const mockResponse: PromptType = {
				id: 1,
				name: 'Updated Sales Type',
				description: 'Updated description',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updatePromptType(promptTypeId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-types/${promptTypeId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deletePromptType', () => {
		it('should delete a prompt type successfully', async () => {
			const promptTypeId = '1';
			const mockResponse = { message: 'Type deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deletePromptType(promptTypeId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-types/${promptTypeId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
