import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import toolCategoryApi from '../toolCategoryApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import type { ToolModel } from '~/models/ToolModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('toolCategoryApi', () => {
	let api: ReturnType<typeof toolCategoryApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = toolCategoryApi();
	});

	describe('getAllToolCategories', () => {
		it('should get all tool categories successfully', async () => {
			const mockResponse: ToolCategoryModel[] = [
				{
					id: 1,
					name: 'Test Category',
					description: 'Test category description',
					icon: 'test-icon',
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getAllToolCategories();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/tool-categories`);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const error = createMockAxiosError('Server error', 500);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.getAllToolCategories()).rejects.toThrow('Server error');
		});
	});

	describe('getToolCategoryById', () => {
		it('should get tool category by ID', async () => {
			const id = 1;
			const mockResponse: ToolCategoryModel = {
				id: 1,
				name: 'Test Category',
				description: 'Test category description',
				icon: 'test-icon',
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolCategoryById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle string ID', async () => {
			const id = 'category-1';
			const mockResponse: ToolCategoryModel = {
				id: 1,
				name: 'Test Category',
				description: 'Test category description',
				icon: 'test-icon',
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolCategoryById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createToolCategory', () => {
		it('should create a tool category successfully', async () => {
			const data: Partial<ToolCategoryModel> = {
				name: 'New Category',
				description: 'New category description',
				icon: 'new-icon',
			};
			const mockResponse: ToolCategoryModel = {
				id: 1,
				name: 'New Category',
				description: 'New category description',
				icon: 'new-icon',
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createToolCategory(data);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateToolCategory', () => {
		it('should update a tool category successfully', async () => {
			const id = 1;
			const data: Partial<ToolCategoryModel> = {
				name: 'Updated Category',
				description: 'Updated description',
			};
			const mockResponse: ToolCategoryModel = {
				id: 1,
				name: 'Updated Category',
				description: 'Updated description',
				icon: 'test-icon',
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.put as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updateToolCategory(id, data);

			expect(axios.put).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories/${id}`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteToolCategory', () => {
		it('should delete a tool category successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Tool category deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deleteToolCategory(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getToolsByCategory', () => {
		it('should get tools by category successfully', async () => {
			const id = 1;
			const mockResponse: ToolModel[] = [
				{
					id: 1,
					identifier: 'category-tool',
					prompt: 'Category prompt',
					name: 'Category Tool',
					description: 'Category tool description',
					categoryId: 1,
					category: {
						id: 1,
						name: 'Test Category',
						description: 'Test category description',
						icon: 'test-icon',
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
					status: 'active',
					config: {
						id: 'config-1',
						accessInfo: {
							role: 'admin',
							isCreator: true,
							creatorName: 'Test User',
							creatorEmail: 'test@example.com',
						},
						toolConfig: {
							name: 'Category Config',
							type: 'api',
							apiSchema: {
								url: 'https://api.example.com',
								method: 'GET',
								requestHeaders: {},
								auth_connection: null,
								pathParamsSchema: {},
								requestBodySchema: {
									type: 'object',
									required: [],
									properties: {},
									description: 'Category schema',
								},
							},
							description: 'Category config description',
							dynamicVariables: {
								dynamicVariablePlaceholders: {},
							},
							responseTimeoutSecs: 30,
						},
					},
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolsByCategory(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/tool-categories/${id}/tools`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
