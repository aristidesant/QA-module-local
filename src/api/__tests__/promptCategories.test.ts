import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import promptCategoriesApi from '../promptCategories';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { PromptCategory } from '~/models/PromptCategoryModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('promptCategoriesApi', () => {
	let api: ReturnType<typeof promptCategoriesApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = promptCategoriesApi();
	});

	describe('createPromptCategory', () => {
		it('should create a prompt category successfully', async () => {
			const promptCategoryData: Partial<PromptCategory> = {
				name: 'Sales Prompts',
				description: 'Prompts for sales conversations',
			};
			const mockResponse: PromptCategory = {
				id: 1,
				name: 'Sales Prompts',
				description: 'Prompts for sales conversations',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createPromptCategory(promptCategoryData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories`,
				promptCategoryData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const promptCategoryData: Partial<PromptCategory> = {
				name: 'Test Category',
			};
			const error = createMockAxiosError('Validation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(
				api.createPromptCategory(promptCategoryData)
			).rejects.toThrow('Validation failed');
		});
	});

	describe('findAllPromptCategories', () => {
		it('should get all prompt categories without params', async () => {
			const mockResponse: PromptCategory[] = [
				{
					id: 1,
					name: 'Sales Prompts',
					description: 'Prompts for sales conversations',
					icon: 'sales-icon',
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptCategories();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories`,
				{
					params: undefined,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get all prompt categories with params', async () => {
			const params = { search: 'sales' };
			const mockResponse: PromptCategory[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptCategories(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories`,
				{
					params,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findPromptCategory', () => {
		it('should get prompt category by id', async () => {
			const promptCategoryId = '1';
			const mockResponse: PromptCategory = {
				id: 1,
				name: 'Sales Prompts',
				description: 'Prompts for sales conversations',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findPromptCategory(promptCategoryId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories/${promptCategoryId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when category not found', async () => {
			const promptCategoryId = '999';
			const error = createMockAxiosError('Category not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.findPromptCategory(promptCategoryId)).rejects.toThrow(
				'Category not found'
			);
		});
	});

	describe('updatePromptCategory', () => {
		it('should update a prompt category successfully', async () => {
			const promptCategoryId = '1';
			const updateData: Partial<PromptCategory> = {
				name: 'Updated Sales Prompts',
				description: 'Updated description',
			};
			const mockResponse: PromptCategory = {
				id: 1,
				name: 'Updated Sales Prompts',
				description: 'Updated description',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updatePromptCategory(
				promptCategoryId,
				updateData
			);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories/${promptCategoryId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deletePromptCategory', () => {
		it('should delete a prompt category successfully', async () => {
			const promptCategoryId = '1';
			const mockResponse = { message: 'Category deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deletePromptCategory(promptCategoryId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-categories/${promptCategoryId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
