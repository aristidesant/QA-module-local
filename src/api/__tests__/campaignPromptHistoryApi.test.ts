import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignPromptHistoryApi from '../campaignPromptHistoryApi';
import { CampaignStatus } from '~/models/CampaignStatus';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	CampaignPromptHistoryItem,
	CampaignPromptHistoryResponse,
} from '~/models/CampaignPromptHistoryModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

const mockHistoryItem: CampaignPromptHistoryItem = {
	id: 1,
	campaignId: 1,
	userId: 1,
	version: 1,
	promptText: 'Test prompt',
	agentConfig: {
		conversationConfig: {
			agent: {
				prompt: {
					prompt: 'Test prompt',
				},
			},
		},
	},
	clientId: 1,
	createdAt: '2023-01-01T00:00:00Z',
	comment: 'Test comment',
	campaign: {
		id: 1,
		name: 'Test Campaign',
		description: 'Test Description',
		clientId: 1,
		userId: 1,
		agentName: 'Test Agent',
		budget: 1000,
		configId: 'cfg_123',
		spent: 10,
		type: 'OUTBOUND',
		status: CampaignStatus.RUNNING,
		createdAt: '2023-01-01T00:00:00Z',
		updatedAt: '2023-01-01T00:00:00Z',
	},
	user: {
		id: 1,
		username: 'test_user',
		email: 'test@example.com',
		status: 'active',
		clientId: 1,
		createdAt: '2023-01-01T00:00:00Z',
		updatedAt: '2023-01-01T00:00:00Z',
		deletedAt: null,
	},
};

describe('campaignPromptHistoryApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getCampaignPromptHistory', () => {
		it('should fetch campaign prompt history without params', async () => {
			const campaignId = '1';
			const mockResponse: CampaignPromptHistoryResponse = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [mockHistoryItem],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptHistoryApi();
			const result = await api.getCampaignPromptHistory(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-history/campaign/${campaignId}`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch campaign prompt history with params', async () => {
			const campaignId = '1';
			const params = { version: 2, limit: 20, offset: 0 };
			const mockResponse: CampaignPromptHistoryResponse = {
				total: 1,
				limit: 20,
				offset: 0,
				data: [
					{
						...mockHistoryItem,
						version: 2,
						promptText: 'Test prompt v2',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptHistoryApi();
			const result = await api.getCampaignPromptHistory(campaignId, params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-history/campaign/${campaignId}`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when history fetch fails', async () => {
			const campaignId = '1';
			const error = createMockAxiosError('History not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignPromptHistoryApi();
			await expect(api.getCampaignPromptHistory(campaignId)).rejects.toThrow(
				'History not found'
			);
		});
	});

	describe('getCampaignPromptHistoryByPromptType', () => {
		it('should fetch prompt history for a campaign and prompt type', async () => {
			const campaignId = '1';
			const promptTypeId = '10';
			const params = { limit: 5, offset: 0 };
			const mockResponse: CampaignPromptHistoryResponse = {
				total: 1,
				limit: 5,
				offset: 0,
				data: [mockHistoryItem],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignPromptHistoryApi();
			const result = await api.getCampaignPromptHistoryByPromptType(
				campaignId,
				promptTypeId,
				params
			);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-history/campaign/${campaignId}/prompt-type/${promptTypeId}`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getLatestCampaignPromptHistoryByPromptType', () => {
		it('should fetch latest prompt history item for a campaign and prompt type', async () => {
			const campaignId = '1';
			const promptTypeId = '10';
			const latestItem: CampaignPromptHistoryItem = {
				...mockHistoryItem,
				version: 3,
				promptText: 'Latest prompt',
			};

			(axios.get as Mock).mockResolvedValue(createMockResponse(latestItem));

			const api = campaignPromptHistoryApi();
			const result = await api.getLatestCampaignPromptHistoryByPromptType(
				campaignId,
				promptTypeId
			);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-prompt-history/campaign/${campaignId}/prompt-type/${promptTypeId}/latest`
			);
			expect(result).toEqual(latestItem);
		});
	});
});
