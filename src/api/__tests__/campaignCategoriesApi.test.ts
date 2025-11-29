import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignCategoriesApi from '../campaignCategoriesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	CampaignCategory,
	CampaignCategoryResponse,
	CreateCampaignCategoryRequest,
	UpdateCampaignCategoryRequest,
} from '~/models/CampaignCategoryModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignCategoriesApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaignCategory', () => {
		it('should create a campaign category successfully', async () => {
			const data: CreateCampaignCategoryRequest = {
				name: 'Test Category',
				code: 'TEST',
				description: 'Test description',
			};
			const mockResponse: CampaignCategory = {
				id: 1,
				name: 'Test Category',
				code: 'TEST',
				description: 'Test description',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.createCampaignCategory(data);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories`,
				data
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when creation fails', async () => {
			const data: CreateCampaignCategoryRequest = {
				name: 'Test Category',
				code: 'TEST',
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignCategoriesApi();
			await expect(api.createCampaignCategory(data)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('getCampaignCategories', () => {
		it('should get all campaign categories without params', async () => {
			const mockResponse: CampaignCategoryResponse = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Category',
						code: 'TEST',
						active: true,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.getCampaignCategories();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get campaign categories with params', async () => {
			const params = { name: 'Test', active: true, limit: 20, offset: 0 };
			const mockResponse: CampaignCategoryResponse = {
				total: 1,
				limit: 20,
				offset: 0,
				data: [],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.getCampaignCategories(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignCategoryById', () => {
		it('should get campaign category by ID', async () => {
			const id = 1;
			const mockResponse: CampaignCategory = {
				id,
				name: 'Test Category',
				code: 'TEST',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.getCampaignCategoryById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCampaignCategory', () => {
		it('should update campaign category successfully', async () => {
			const id = 1;
			const data: UpdateCampaignCategoryRequest = {
				name: 'Updated Category',
				active: false,
			};
			const mockResponse: CampaignCategory = {
				id,
				name: 'Updated Category',
				code: 'TEST',
				active: false,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.updateCampaignCategory(id, data);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories/${id}`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCampaignCategory', () => {
		it('should delete campaign category successfully', async () => {
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			const api = campaignCategoriesApi();
			await api.deleteCampaignCategory(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories/${id}`
			);
		});
	});

	describe('getActiveCampaignCategories', () => {
		it('should get active campaign categories', async () => {
			const mockResponse: CampaignCategory[] = [
				{
					id: 1,
					name: 'Active Category',
					code: 'ACTIVE',
					active: true,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignCategoriesApi();
			const result = await api.getActiveCampaignCategories();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-categories/active`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
