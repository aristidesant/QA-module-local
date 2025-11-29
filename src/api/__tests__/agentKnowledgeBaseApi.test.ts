import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import agentKnowledgeBaseApi from '../agentKnowledgeBaseApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('agentKnowledgeBaseApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('findAllKnowledgeBases', () => {
		it('should fetch all knowledge bases without params', async () => {
			const mockResponse = [
				{ id: 1, name: 'KB 1', agentId: 'agent-1' },
				{ id: 2, name: 'KB 2', agentId: 'agent-2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.findAllKnowledgeBases();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases`,
				{
					params: undefined,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch knowledge bases with params', async () => {
			const params = { agentId: 'agent-123', status: 'active' };
			const mockResponse = [{ id: 1, name: 'KB 1', agentId: 'agent-123' }];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.findAllKnowledgeBases(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases`,
				{
					params,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findAgentKnowledgeBase', () => {
		it('should fetch knowledge bases for a specific agent', async () => {
			const agentId = 'agent-123';
			const mockResponse = [
				{ id: 1, name: 'KB 1', agentId },
				{ id: 2, name: 'KB 2', agentId },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.findAgentKnowledgeBase(agentId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/agent/${agentId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when agent knowledge base not found', async () => {
			const agentId = 'non-existent';
			const error = createMockAxiosError('Agent knowledge base not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = agentKnowledgeBaseApi();
			await expect(api.findAgentKnowledgeBase(agentId)).rejects.toThrow(
				'Agent knowledge base not found'
			);
		});
	});

	describe('findAgentKnowledgeBaseStatus', () => {
		it('should fetch knowledge base status for a specific agent', async () => {
			const agentId = 'agent-123';
			const mockResponse = [
				{ id: 1, name: 'KB 1', status: 'active' },
				{ id: 2, name: 'KB 2', status: 'inactive' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.findAgentKnowledgeBaseStatus(agentId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/agent/${agentId}/status`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findAllAgentAssignedToKnowledgeBase', () => {
		it('should fetch all agents assigned to a knowledge base', async () => {
			const knowledgeBaseId = 123;
			const mockResponse = [
				{ id: 1, agentId: 'agent-1', knowledgeBaseId },
				{ id: 2, agentId: 'agent-2', knowledgeBaseId },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result =
				await api.findAllAgentAssignedToKnowledgeBase(knowledgeBaseId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/knowledge-base/${knowledgeBaseId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('assignKnowledgeBase', () => {
		it('should assign a knowledge base to an agent', async () => {
			const body = { agentId: 'agent-123', knowledgeBaseId: 456 };
			const mockResponse = [
				{ id: 1, agentId: 'agent-123', knowledgeBaseId: 456 },
			];
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.assignKnowledgeBase(body);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/assign`,
				body
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when assignment fails', async () => {
			const body = { agentId: 'agent-123', knowledgeBaseId: 456 };
			const error = createMockAxiosError('Assignment failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = agentKnowledgeBaseApi();
			await expect(api.assignKnowledgeBase(body)).rejects.toThrow(
				'Assignment failed'
			);
		});
	});

	describe('unassignKnowledgeBase', () => {
		it('should unassign a knowledge base from an agent', async () => {
			const body = { agentId: 'agent-123', knowledgeBaseId: 456 };
			const mockResponse: any[] = [];
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.unassignKnowledgeBase(body);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/unassign`,
				body
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateKnowledgeBaseStatus', () => {
		it('should update knowledge base status for an agent', async () => {
			const agentId = 123;
			const knowledgeBaseId = 456;
			const mockResponse = [{ id: 1, status: 'updated' }];
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentKnowledgeBaseApi();
			const result = await api.updateKnowledgeBaseStatus(
				agentId,
				knowledgeBaseId
			);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-knowledge-bases/agent/${agentId}/knowledge-base/${knowledgeBaseId}/status`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
