import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import knowledgeBaseApi from '../knowledgeBaseApi';
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

describe('knowledgeBaseApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createKnowledgeBase', () => {
		it('should post a created knowledge base using FormData', async () => {
			const data = {
				name: 'KB',
				description: 'desc',
				type: 'file',
				textContent: 'hi',
				file: new File(['hi'], 'test.txt', { type: 'text/plain' }),
			};
			const mockResponse = { id: 1, ...data };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi({ Authorization: 'Bearer token' });
			const result = await api.createKnowledgeBase(data);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases`,
				expect.any(FormData),
				{
					headers: expect.objectContaining({
						'Content-Type': 'multipart/form-data',
						Authorization: 'Bearer token',
					}),
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when creation fails', async () => {
			const error = createMockAxiosError('Create failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = knowledgeBaseApi();
			await expect(api.createKnowledgeBase({ name: 'bad' })).rejects.toThrow(
				'Create failed'
			);
		});
	});

	describe('getKnowledgeBases', () => {
		it('should fetch knowledge bases without params', async () => {
			const mockResponse = [{ id: 1 }, { id: 2 }];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi();
			const result = await api.getKnowledgeBases();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases`,
				{
					headers: {},
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch knowledge bases with params', async () => {
			const params = {
				agentId: 'agent-1',
				type: 'file',
				status: 'active',
				search: 'term',
			};
			const mockResponse = [{ id: 3 }];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi({ 'X-Test': '1' });
			const result = await api.getKnowledgeBases(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases?agentId=${encodeURIComponent(String(params.agentId))}&type=${encodeURIComponent(String(params.type))}&status=${encodeURIComponent(String(params.status))}&search=${encodeURIComponent(String(params.search))}`,
				{
					headers: { 'X-Test': '1' },
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getKnowledgeBase', () => {
		it('should fetch the knowledge base by id', async () => {
			const mockResponse = { id: 5, name: 'My KB' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi({ Authorization: 'token' });
			const result = await api.getKnowledgeBase(5);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases/5`,
				{
					headers: { Authorization: 'token' },
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when not found', async () => {
			const error = createMockAxiosError('Not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = knowledgeBaseApi();
			await expect(api.getKnowledgeBase(999)).rejects.toThrow('Not found');
		});
	});

	describe('updateKnowledgeBase', () => {
		it('should update the knowledge base', async () => {
			const id = 11;
			const data = { name: 'Updated' };
			const mockResponse = { id, ...data };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi({ Authorization: 'bearer' });
			const result = await api.updateKnowledgeBase(id, data);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases/${id}`,
				data,
				{
					headers: { Authorization: 'bearer' },
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteKnowledgeBase', () => {
		it('should delete the knowledge base', async () => {
			const id = 7;
			const mockResponse: any = {};
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = knowledgeBaseApi({ Authorization: 'bearer' });
			const result = await api.deleteKnowledgeBase(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases/${id}`,
				{
					headers: { Authorization: 'bearer' },
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('retryKnowledgeBase', () => {
		it('should retry knowledge base processing', async () => {
			const id = 88;
			const mockResponse: any = { ok: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = knowledgeBaseApi({ Authorization: 'bearer' });
			const result = await api.retryKnowledgeBase(id);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/knowledge-bases/${id}/retry`,
				{},
				{
					headers: { Authorization: 'bearer' },
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
