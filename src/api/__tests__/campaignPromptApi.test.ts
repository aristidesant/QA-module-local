import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignPromptsApi from '../campaignPromptApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';
import type { CampaignPromptGenerateRequest } from '~/models/CampaignPromptGenerateModel';
import type { CampaignPromptGenerateResponse } from '~/models/CampaignPromptGenerateResponse';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignPromptsApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaignPrompt', () => {
		it('should create a campaign prompt successfully', async () => {
			const mockData: CampaignPromptModel = {
				typeId: 1,
				campaignId: 1,
				prompt: 'Test prompt',
			};
			const mockResponse: CampaignPromptModel = {
				id: 1,
				typeId: 1,
				campaignId: 1,
				prompt: 'Test prompt',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.createCampaignPrompt(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData: CampaignPromptModel = {
				typeId: 1,
				campaignId: 1,
				prompt: 'Test prompt',
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignPromptsApi();
			await expect(api.createCampaignPrompt(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('createCampaignPromptsBatch', () => {
		it('should create campaign prompts batch successfully', async () => {
			const mockData = {
				prompts: [
					{
						typeId: 1,
						campaignId: 1,
						prompt: 'Test prompt',
					},
				],
			};
			const mockResponse = { success: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.createCampaignPromptsBatch(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts/batch`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignPrompts', () => {
		it('should fetch campaign prompts without params', async () => {
			const mockResponse: CampaignPromptModel[] = [
				{
					id: 1,
					typeId: 1,
					campaignId: 1,
					prompt: 'Test prompt',
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.getCampaignPrompts();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch campaign prompts with params', async () => {
			const params = { campaignId: 1, typeId: 2 };
			const mockResponse: CampaignPromptModel[] = [
				{
					id: 1,
					typeId: 2,
					campaignId: 1,
					prompt: 'Test prompt',
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.getCampaignPrompts(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignPrompt', () => {
		it('should fetch a campaign prompt by id', async () => {
			const id = 1;
			const mockResponse: CampaignPromptModel = {
				id: 1,
				typeId: 1,
				campaignId: 1,
				prompt: 'Test prompt',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.getCampaignPrompt(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when prompt not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Prompt not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignPromptsApi();
			await expect(api.getCampaignPrompt(id)).rejects.toThrow(
				'Prompt not found'
			);
		});
	});

	describe('updateCampaignPrompt', () => {
		it('should update a campaign prompt successfully', async () => {
			const id = 1;
			const updateData = { prompt: 'Updated prompt' };
			const mockResponse: CampaignPromptModel = {
				id: 1,
				typeId: 1,
				campaignId: 1,
				prompt: 'Updated prompt',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.updateCampaignPrompt(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCampaignPrompt', () => {
		it('should delete a campaign prompt successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = campaignPromptsApi();
			const result = await api.deleteCampaignPrompt(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('generateCampaignPrompt', () => {
		it('should generate a campaign prompt successfully', async () => {
			const mockData: CampaignPromptGenerateRequest = {
				prompt: 'Generate this prompt',
			};
			const mockResponse: CampaignPromptGenerateResponse = {
				identifier: 'generated-id',
				content: 'Generated content',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptsApi();
			const result = await api.generateCampaignPrompt(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompts/generate`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when generation fails', async () => {
			const mockData: CampaignPromptGenerateRequest = {
				prompt: 'Generate this prompt',
			};
			const error = createMockAxiosError('Generation failed', 500);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignPromptsApi();
			await expect(api.generateCampaignPrompt(mockData)).rejects.toThrow(
				'Generation failed'
			);
		});
	});
});
