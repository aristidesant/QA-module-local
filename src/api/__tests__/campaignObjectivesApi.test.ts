import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignObjectivesApi from '../campaignObjectivesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	CampaignObjective,
	CampaignObjectiveResponse,
	CreateCampaignObjectiveRequest,
	UpdateCampaignObjectiveRequest,
} from '~/models/CampaignObjectiveModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignObjectivesApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaignObjective', () => {
		it('should create a campaign objective successfully', async () => {
			const mockData: CreateCampaignObjectiveRequest = {
				name: 'Test Objective',
				categoryId: 1,
			};
			const mockResponse: CampaignObjective = {
				id: 1,
				name: 'Test Objective',
				active: true,
				categoryId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.createCampaignObjective(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData: CreateCampaignObjectiveRequest = {
				name: 'Test Objective',
				categoryId: 1,
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignObjectivesApi();
			await expect(api.createCampaignObjective(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('getCampaignObjectives', () => {
		it('should fetch campaign objectives without params', async () => {
			const mockResponse: CampaignObjectiveResponse = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Objective',
						active: true,
						categoryId: 1,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getCampaignObjectives();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch campaign objectives with params', async () => {
			const params = { name: 'Test', limit: 20, offset: 0 };
			const mockResponse: CampaignObjectiveResponse = {
				total: 1,
				limit: 20,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Objective',
						active: true,
						categoryId: 1,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getCampaignObjectives(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignObjectiveById', () => {
		it('should fetch a campaign objective by id', async () => {
			const id = 1;
			const mockResponse: CampaignObjective = {
				id: 1,
				name: 'Test Objective',
				active: true,
				categoryId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getCampaignObjectiveById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when objective not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Objective not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignObjectivesApi();
			await expect(api.getCampaignObjectiveById(id)).rejects.toThrow(
				'Objective not found'
			);
		});
	});

	describe('updateCampaignObjective', () => {
		it('should update a campaign objective successfully', async () => {
			const id = 1;
			const updateData: UpdateCampaignObjectiveRequest = {
				name: 'Updated Objective',
			};
			const mockResponse: CampaignObjective = {
				id: 1,
				name: 'Updated Objective',
				active: true,
				categoryId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.updateCampaignObjective(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCampaignObjective', () => {
		it('should delete a campaign objective successfully', async () => {
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			const api = campaignObjectivesApi();
			await api.deleteCampaignObjective(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/${id}`
			);
		});
	});

	describe('getActiveCampaignObjectives', () => {
		it('should fetch active campaign objectives', async () => {
			const mockResponse: CampaignObjective[] = [
				{
					id: 1,
					name: 'Active Objective',
					active: true,
					categoryId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getActiveCampaignObjectives();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/active`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getObjectivesByCategory', () => {
		it('should get objectives by category id', async () => {
			const categoryId = 1;
			const mockResponse: CampaignObjective[] = [
				{
					id: 1,
					name: 'Category Objective',
					active: true,
					categoryId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getObjectivesByCategory(categoryId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/category/${categoryId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getActiveObjectivesByCategory', () => {
		it('should get active objectives by category id', async () => {
			const categoryId = 1;
			const mockResponse: CampaignObjective[] = [
				{
					id: 1,
					name: 'Active Category Objective',
					active: true,
					categoryId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignObjectivesApi();
			const result = await api.getActiveObjectivesByCategory(categoryId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-objectives/category/${categoryId}/active`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
