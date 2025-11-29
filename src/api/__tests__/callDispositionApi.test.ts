import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import callDispositionApi from '../callDispositionApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CallDispositionModel } from '~/models/CallDispositionModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('callDispositionApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCallDisposition', () => {
		it('should create a call disposition successfully', async () => {
			const mockData: Partial<CallDispositionModel> = {
				conversationId: 123,
				dispositionName: 'Test Disposition',
			};
			const mockResponse: CallDispositionModel = {
				id: 1,
				conversationId: 123,
				dispositionName: 'Test Disposition',
				dispositionDescription: 'Description',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.createCallDisposition(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when creation fails', async () => {
			const mockData: Partial<CallDispositionModel> = {
				conversationId: 123,
				dispositionName: 'Test Disposition',
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = callDispositionApi();
			await expect(api.createCallDisposition(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('findAllCallDispositions', () => {
		it('should fetch all call dispositions by conversationId', async () => {
			const params = { conversationId: '123' };
			const mockResponse: CallDispositionModel = {
				id: 1,
				conversationId: 123,
				dispositionName: 'Disposition 1',
				dispositionDescription: 'Description',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.findAllCallDispositions(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/details`,
				{
					params,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findCallDispositionByConversationId', () => {
		it('should fetch call disposition by conversationId', async () => {
			const conversationId = 123;
			const mockResponse = { id: 1, conversationId: 123 };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result =
				await api.findCallDispositionByConversationId(conversationId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/conversation/${conversationId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findCallDisposition', () => {
		it('should fetch a single call disposition by id', async () => {
			const id = '123';
			const mockResponse: CallDispositionModel = {
				id: 1,
				conversationId: 123,
				dispositionName: 'Disposition 1',
				dispositionDescription: 'Description',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.findCallDisposition(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCallDisposition', () => {
		it('should update a call disposition successfully', async () => {
			const id = '123';
			const updateData: Partial<CallDispositionModel> = {
				dispositionName: 'Updated Disposition',
			};
			const mockResponse: CallDispositionModel = {
				id: 1,
				conversationId: 123,
				dispositionName: 'Updated Disposition',
				dispositionDescription: 'Description',
				createdAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.updateCallDisposition(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCallDisposition', () => {
		it('should delete a call disposition successfully', async () => {
			const id = '123';
			const mockResponse = { message: 'Deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = callDispositionApi();
			const result = await api.deleteCallDisposition(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCallDispositionReport', () => {
		it('should get call disposition report', async () => {
			const params = {
				dispositionName: 'Test',
				campaignId: 1,
				agentId: 'agent1',
			};
			const mockResponse = { report: 'data' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.getCallDispositionReport(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/report`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCallDispositionReportParents', () => {
		it('should get call disposition report parents without dispositionName', async () => {
			const params = { campaignId: 1 };
			const mockResponse = { parents: [] };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.getCallDispositionReportParents(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/report/disposition`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get call disposition report parents with dispositionName', async () => {
			const params = { campaignId: 1, dispositionName: 'Test Disposition' };
			const mockResponse = { parents: [] };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = callDispositionApi();
			const result = await api.getCallDispositionReportParents(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/call-dispositions/report/disposition/Test Disposition`,
				{ params: { campaignId: 1 } }
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
