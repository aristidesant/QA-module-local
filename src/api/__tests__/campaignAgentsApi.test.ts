import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignAgentsApi from '../campaignAgentsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CampaignAgent } from '~/models/CampaignAgentModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignAgentsApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('assignAgentToCampaign', () => {
		it('should assign agent to campaign successfully', async () => {
			const campaignId = 1;
			const agentId = 'agent123';
			const mockResponse: CampaignAgent = {
				id: 1,
				campaignId,
				agentId,
				agent: {} as any,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignAgentsApi();
			const result = await api.assignAgentToCampaign(campaignId, agentId);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/agents`,
				{ agentId, campaignId }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when assignment fails', async () => {
			const campaignId = 1;
			const agentId = 'agent123';
			const error = createMockAxiosError('Assignment failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignAgentsApi();
			await expect(
				api.assignAgentToCampaign(campaignId, agentId)
			).rejects.toThrow('Assignment failed');
		});
	});

	describe('getCampaignAgents', () => {
		it('should get all agents for a campaign', async () => {
			const campaignId = 1;
			const mockResponse: CampaignAgent[] = [
				{
					id: 1,
					campaignId,
					agentId: 'agent1',
					agent: {} as any,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignAgentsApi();
			const result = await api.getCampaignAgents(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/agents`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignAgentById', () => {
		it('should get a single agent by ID', async () => {
			const campaignId = 1;
			const id = 1;
			const mockResponse: CampaignAgent = {
				id,
				campaignId,
				agentId: 'agent1',
				agent: {} as any,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignAgentsApi();
			const result = await api.getCampaignAgentById(campaignId, id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/agents/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCampaignAgent', () => {
		it('should update agent in campaign', async () => {
			const campaignId = 1;
			const id = 1;
			const updateData = { userId: 2 };
			const mockResponse: CampaignAgent = {
				id,
				campaignId,
				agentId: 'agent1',
				agent: {} as any,
				userId: 2,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignAgentsApi();
			const result = await api.updateCampaignAgent(campaignId, id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/agents/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeAgentFromCampaign', () => {
		it('should remove agent from campaign', async () => {
			const campaignId = 1;
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			const api = campaignAgentsApi();
			await api.removeAgentFromCampaign(campaignId, id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/agents/${id}`
			);
		});
	});
});
