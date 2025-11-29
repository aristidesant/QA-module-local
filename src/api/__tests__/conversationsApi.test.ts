import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import conversationsApi from '../conversationsApi';
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

describe('conversationsApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createConversation', () => {
		it('should create a conversation successfully', async () => {
			const conversationData = {
				agentId: 'agent-123',
				phoneNumber: '+1234567890',
			};
			const mockResponse = { id: 'conv-123', ...conversationData };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.createConversation(conversationData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations`,
				conversationData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getConversations', () => {
		it('should fetch conversations without filters', async () => {
			const mockResponse = {
				data: [{ id: 'conv-1' }, { id: 'conv-2' }],
				total: 2,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.getConversations();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/conversations`, {
				params: {},
			});
			expect(result).toEqual(mockResponse);
		});

		it('should fetch conversations with campaign and contact group filters', async () => {
			const campaignId = 123;
			const contactGroupId = 456;
			const params = { limit: 20, search: 'test' };
			const mockResponse = {
				data: [{ id: 'conv-1' }],
				total: 1,
				page: 1,
				limit: 20,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.getConversations(
				campaignId,
				contactGroupId,
				params
			);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/conversations`, {
				params: {
					limit: 20,
					search: 'test',
					campaignId,
					contactGroupId,
				},
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('startConversation', () => {
		it('should start a conversation successfully', async () => {
			const startData = { agentId: 'agent-123', phoneNumber: '+1234567890' };
			const mockResponse = { id: 'conv-123', status: 'started' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.startConversation(startData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/start`,
				startData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('startDemoConversation', () => {
		it('should start a demo conversation successfully', async () => {
			const params = {
				agentId: 'agent-123',
				phoneNumber: '+1234567890',
				campaignId: 456,
				dynamicVariables: {
					customerName: 'John Doe',
					customerId: 'cust-123',
				},
			};
			const mockResponse = { id: 'demo-conv-123', status: 'started' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.startDemoConversation(params);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/start-demo`,
				params
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('postCallData', () => {
		it('should post call data successfully', async () => {
			const callData = { conversationId: 'conv-123', duration: 300 };
			(axios.post as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = conversationsApi();
			const result = await api.postCallData(callData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/webhook/post-call-data`,
				callData
			);
			expect(result).toBeUndefined();
		});
	});

	describe('getConversationById', () => {
		it('should fetch a conversation by id', async () => {
			const conversationId = 'conv-123';
			const mockResponse = { id: conversationId, status: 'completed' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.getConversationById(conversationId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when conversation not found', async () => {
			const conversationId = 'non-existent';
			const error = createMockAxiosError('Conversation not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = conversationsApi();
			await expect(api.getConversationById(conversationId)).rejects.toThrow(
				'Conversation not found'
			);
		});
	});

	describe('updateConversation', () => {
		it('should update a conversation successfully', async () => {
			const conversationId = 'conv-123';
			const updateData = { status: 'completed' };
			const mockResponse = { id: conversationId, status: 'completed' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = conversationsApi();
			const result = await api.updateConversation(conversationId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteConversation', () => {
		it('should delete a conversation successfully', async () => {
			const conversationId = 'conv-123';
			(axios.delete as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = conversationsApi();
			const result = await api.deleteConversation(conversationId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}`
			);
			expect(result).toBeUndefined();
		});
	});

	describe('exportConversationsCsv', () => {
		it('should export conversations as CSV with default filename', async () => {
			const params = {
				startDate: '2025-01-01T00:00:00Z',
				endDate: '2025-01-31T23:59:59Z',
				campaingType: 'outbound' as const,
			};
			const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
			const mockResponse = {
				data: mockBlob,
				headers: {},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationsCsv(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/export/csv`,
				{
					params,
					responseType: 'blob',
				}
			);
			expect(result.blob).toEqual(mockBlob);
			expect(result.filename).toBe('conversations.csv');
		});

		it('should extract filename from Content-Disposition header', async () => {
			const params = {
				startDate: '2025-01-01T00:00:00Z',
				endDate: '2025-01-31T23:59:59Z',
				campaingType: 'inbound' as const,
			};
			const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
			const mockResponse = {
				data: mockBlob,
				headers: {
					'content-disposition': 'attachment; filename="export.csv"',
				},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationsCsv(params);

			expect(result.filename).toBe('export.csv');
		});
	});

	describe('exportConversationAudio', () => {
		it('should export conversation audio with default filename', async () => {
			const conversationId = 123;
			const mockBlob = new Blob(['audio,data'], { type: 'audio/mpeg' });
			const mockResponse = {
				data: mockBlob,
				headers: {},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationAudio(conversationId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/export/${conversationId}/audio`,
				{
					responseType: 'blob',
				}
			);
			expect(result.blob).toEqual(mockBlob);
			expect(result.filename).toBe('conversation-123-audio.mp3');
		});

		it('should extract filename from Content-Disposition header', async () => {
			const conversationId = 'conv-456';
			const mockBlob = new Blob(['audio,data'], { type: 'audio/mpeg' });
			const mockResponse = {
				data: mockBlob,
				headers: {
					'content-disposition': 'attachment; filename="custom-audio.mp3"',
				},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationAudio(conversationId);

			expect(result.filename).toBe('custom-audio.mp3');
		});
	});

	describe('exportConversationPdf', () => {
		it('should export conversation as PDF with default filename', async () => {
			const conversationId = 123;
			const mockBlob = new Blob(['pdf,data'], { type: 'application/pdf' });
			const mockResponse = {
				data: mockBlob,
				headers: {},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationPdf(conversationId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}/export?format=PDF`,
				{
					responseType: 'blob',
				}
			);
			expect(result.blob).toEqual(mockBlob);
			expect(result.filename).toBe('conversation-123.pdf');
		});

		it('should extract filename from Content-Disposition header', async () => {
			const conversationId = 'conv-456';
			const mockBlob = new Blob(['pdf,data'], { type: 'application/pdf' });
			const mockResponse = {
				data: mockBlob,
				headers: {
					'content-disposition': 'attachment; filename="custom-report.pdf"',
				},
			};
			(axios.get as Mock).mockResolvedValue(mockResponse);

			const api = conversationsApi();
			const result = await api.exportConversationPdf(conversationId);

			expect(result.filename).toBe('custom-report.pdf');
		});
	});

	describe('failAndPauseConversation', () => {
		it('should fail and pause a conversation successfully', async () => {
			const conversationId = 'conv-123';
			(axios.post as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = conversationsApi();
			const result = await api.failAndPauseConversation(conversationId);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}/fail-and-pause`
			);
			expect(result).toBeUndefined();
		});
	});

	describe('fetchAndProcessConversation', () => {
		it('should fetch and process a conversation successfully', async () => {
			const conversationId = 'conv-123';
			(axios.post as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = conversationsApi();
			const result = await api.fetchAndProcessConversation(conversationId);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/conversations/${conversationId}/fetch-and-process`
			);
			expect(result).toBeUndefined();
		});
	});
});
