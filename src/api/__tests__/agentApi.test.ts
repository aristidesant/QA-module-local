import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import agentApi from '../agentApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type AgentListObject from '~/models/AgentListObject';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('agentApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createAgent', () => {
		it('should create an agent successfully', async () => {
			const mockAgent = { name: 'Test Agent' };
			const mockResponse = { id: '123', name: 'Test Agent' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.createAgent(mockAgent as any);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents`,
				mockAgent
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockAgent = { name: 'Test Agent' };
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = agentApi();
			await expect(api.createAgent(mockAgent as any)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('duplicateAgent', () => {
		it('should duplicate an agent successfully', async () => {
			const agentId = '123';
			const duplicateData = { name: 'Duplicated Agent' };
			const mockResponse = { id: '456', name: 'Duplicated Agent' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.duplicateAgent(agentId, duplicateData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/${agentId}/duplicate`,
				duplicateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findAllAgents', () => {
		it('should fetch all agents without params', async () => {
			const mockResponse = {
				data: [{ id: '1', name: 'Agent 1' }],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.findAllAgents();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/agents`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should fetch agents with params', async () => {
			const params = { agentType: 'INBOUND' as const, page: 1, limit: 20 };
			const mockResponse = {
				data: [{ id: '1', name: 'Agent 1' }],
				total: 1,
				page: 1,
				limit: 20,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.findAllAgents(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/agents`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should include extra headers when provided', async () => {
			const extraHeaders = { 'X-Custom-Header': 'value' };
			const mockResponse = {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			await api.findAllAgents(undefined, extraHeaders);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/agents`, {
				params: undefined,
				headers: extraHeaders,
				timeout: 5000,
			});
		});
	});

	describe('findAgent', () => {
		it('should fetch a single agent by id', async () => {
			const agentId = '123';
			const mockAgent: Partial<AgentListObject> = {
				id: '123',
				name: 'Test Agent',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockAgent));

			const api = agentApi();
			const result = await api.findAgent(agentId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/${agentId}`
			);
			expect(result).toEqual(mockAgent);
		});

		it('should throw error when agent not found', async () => {
			const agentId = 'non-existent';
			const error = createMockAxiosError('Agent not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = agentApi();
			await expect(api.findAgent(agentId)).rejects.toThrow('Agent not found');
		});
	});

	describe('findAgentsWithCampaigns', () => {
		it('should fetch agents with campaigns', async () => {
			const mockResponse = {
				data: [{ id: '1', name: 'Agent 1', campaigns: [] }],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.findAgentsWithCampaigns();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/with-campaigns/list`,
				{
					params: undefined,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should include params and headers', async () => {
			const params = { agentType: 'OUTBOUND' as const };
			const extraHeaders = { Authorization: 'Bearer token' };
			const mockResponse = {
				data: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			await api.findAgentsWithCampaigns(params, extraHeaders);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/with-campaigns/list`,
				{
					params,
					headers: extraHeaders,
					timeout: 5000,
				}
			);
		});
	});

	describe('updateAgent', () => {
		it('should update an agent successfully', async () => {
			const agentId = '123';
			const updateData = { name: 'Updated Agent' };
			const mockResponse = { id: '123', name: 'Updated Agent' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentApi();
			const result = await api.updateAgent(agentId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/${agentId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteAgent', () => {
		it('should delete an agent successfully', async () => {
			const agentId = '123';
			const mockResponse = { message: 'Agent deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = agentApi();
			const result = await api.deleteAgent(agentId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/${agentId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAgentCampaigns', () => {
		it('should return campaigns array when response has campaign property', async () => {
			const agentId = '123';
			const mockCampaign = { id: 1, name: 'Campaign 1' };
			(axios.get as Mock).mockResolvedValue(
				createMockResponse({ campaign: mockCampaign })
			);

			const api = agentApi();
			const result = await api.getAgentCampaigns(agentId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agents/${agentId}/campaign`
			);
			expect(result).toEqual([mockCampaign]);
		});

		it('should return campaigns array when response is already an array', async () => {
			const agentId = '123';
			const mockCampaigns = [
				{ id: 1, name: 'Campaign 1' },
				{ id: 2, name: 'Campaign 2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockCampaigns));

			const api = agentApi();
			const result = await api.getAgentCampaigns(agentId);

			expect(result).toEqual(mockCampaigns);
		});

		it('should wrap single campaign object in array', async () => {
			const agentId = '123';
			const mockCampaign = { id: 1, name: 'Campaign 1' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockCampaign));

			const api = agentApi();
			const result = await api.getAgentCampaigns(agentId);

			expect(result).toEqual([mockCampaign]);
		});

		it('should return empty array for unexpected response structure', async () => {
			const agentId = '123';
			(axios.get as Mock).mockResolvedValue(createMockResponse({}));

			const api = agentApi();
			const result = await api.getAgentCampaigns(agentId);

			expect(result).toEqual([]);
		});

		it('should return empty array for null response', async () => {
			const agentId = '123';
			(axios.get as Mock).mockResolvedValue(createMockResponse(null));

			const api = agentApi();
			const result = await api.getAgentCampaigns(agentId);

			expect(result).toEqual([]);
		});
	});
});
