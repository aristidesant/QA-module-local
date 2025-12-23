import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignPromptTypeApi from '../campaignPromptTypeApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignPromptTypeApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaignPromptType', () => {
		it('should create a campaign prompt type successfully', async () => {
			const mockData = { name: 'Test Type', icon: 'icon' };
			const mockResponse: CampaignPromptTypeModel = {
				id: 1,
				name: 'Test Type',
				icon: 'icon',
				order: 1,
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.createCampaignPromptType(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData = { name: 'Test Type', icon: 'icon' };
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignPromptTypeApi();
			await expect(api.createCampaignPromptType(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('findAllCampaignPromptTypes', () => {
		it('should fetch all campaign prompt types without params', async () => {
			const mockResponse: CampaignPromptTypeModel[] = [
				{
					id: 1,
					name: 'Test Type',
					icon: 'icon',
					order: 1,
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.findAllCampaignPromptTypes();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch campaign prompt types with params', async () => {
			const params = { name: 'Test' };
			const mockResponse: CampaignPromptTypeModel[] = [
				{
					id: 1,
					name: 'Test Type',
					icon: 'icon',
					order: 1,
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.findAllCampaignPromptTypes(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findCampaignPromptType', () => {
		it('should fetch a campaign prompt type by id', async () => {
			const id = '1';
			const mockResponse: CampaignPromptTypeModel = {
				id: 1,
				name: 'Test Type',
				icon: 'icon',
				order: 1,
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.findCampaignPromptType(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when type not found', async () => {
			const id = '999';
			const error = createMockAxiosError('Type not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignPromptTypeApi();
			await expect(api.findCampaignPromptType(id)).rejects.toThrow(
				'Type not found'
			);
		});
	});

	describe('updateCampaignPromptType', () => {
		it('should update a campaign prompt type successfully', async () => {
			const id = '1';
			const updateData = { name: 'Updated Type' };
			const mockResponse: CampaignPromptTypeModel = {
				id: 1,
				name: 'Updated Type',
				icon: 'icon',
				order: 1,
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.updateCampaignPromptType(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCampaignPromptType', () => {
		it('should delete a campaign prompt type successfully', async () => {
			const id = '1';
			const mockResponse = { message: 'Deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = campaignPromptTypeApi();
			const result = await api.deleteCampaignPromptType(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('reassignCampaignPromptType', () => {
		it('should reassign campaign prompt types successfully', async () => {
			const mockData = {
				items: [
					{
						campaignId: 1,
						oldCampaignPromptTypeId: 1,
						newCampaignPromptTypeId: 2,
						newPrompt: 'New Prompt',
					},
				],
			};
			const mockResponse = { success: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.reassignCampaignPromptType(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types/reassign`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAvailableCampaignPromptTypes', () => {
		it('should fetch available campaign prompt types for a campaign', async () => {
			const campaignId = 1;
			const mockResponse: CampaignPromptTypeModel[] = [
				{
					id: 2,
					name: 'Available Type',
					icon: 'icon',
					order: 2,
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptTypeApi();
			const result = await api.getAvailableCampaignPromptTypes(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-types/available/${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
