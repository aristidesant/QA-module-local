import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import dispositionFlowApi from '../dispositionFlowApi';
import { resetAxiosMocks, createMockResponse } from './setup';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import type {
	CampaignWithDispositionFlow,
	CopyDispositionFlowPayload,
	CopyDispositionFlowResponse,
} from '../dispositionFlowApi';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';
const mockFlowJson: DispositionCatalogModel = {
	id: 1,
	name: 'Test Flow',
	description: 'Test Description',
	clientId: 1,
	campaignId: 1,
	isActive: true,
	isDefault: true,
	type: 'INBOUND',
	dispositionNodes: [],
	createdAt: '2023-01-01T00:00:00Z',
	updatedAt: '2023-01-01T00:00:00Z',
};

describe('dispositionFlowApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getAllDispositionFlows', () => {
		it('should get all disposition flows successfully', async () => {
			const mockResponse: DispositionFlowModel[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					campaignId: 1,
					flowJson: mockFlowJson,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getAllDispositionFlows();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDispositionFlowById', () => {
		it('should get disposition flow by id successfully', async () => {
			const id = '1';
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: mockFlowJson,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getDispositionFlowById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createDispositionFlow', () => {
		it('should create a disposition flow successfully', async () => {
			const mockData = { campaignId: 1, flowJson: mockFlowJson };
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: mockFlowJson,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.createDispositionFlow(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateDispositionFlow', () => {
		it('should update a disposition flow successfully', async () => {
			const id = '1';
			const mockData = {
				flowJson: {
					...mockFlowJson,
					name: 'Updated',
					updatedAt: '2023-01-02T00:00:00Z',
				},
			};
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: {
					...mockFlowJson,
					name: 'Updated',
					updatedAt: '2023-01-02T00:00:00Z',
				},
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.updateDispositionFlow(id, mockData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/${id}`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteDispositionFlow', () => {
		it('should delete a disposition flow successfully', async () => {
			const id = '1';
			const mockResponse = { message: 'Deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = dispositionFlowApi();
			const result = await api.deleteDispositionFlow(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDispositionFlowsByCampaign', () => {
		it('should get disposition flows by campaign successfully', async () => {
			const campaignId = '1';
			const mockResponse: DispositionFlowModel[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					campaignId: 1,
					flowJson: mockFlowJson,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getDispositionFlowsByCampaign(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows?campaignId=${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDispositionFlowsByCampaignPath', () => {
		it('should get disposition flows by campaign path successfully', async () => {
			const campaignId = '1';
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: mockFlowJson,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getDispositionFlowsByCampaignPath(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/campaign/${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDispositionFlowsByUser', () => {
		it('should get disposition flows by user successfully', async () => {
			const userId = '1';
			const mockResponse: DispositionFlowModel[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					campaignId: 1,
					flowJson: mockFlowJson,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getDispositionFlowsByUser(userId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows?userId=${userId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignsWithDispositionFlow', () => {
		it('should get campaigns with disposition flow successfully', async () => {
			const mockResponse: CampaignWithDispositionFlow[] = [
				{
					id: 1,
					name: 'Test Campaign',
					description: 'Test Description',
					status: 'active',
					clientId: 1,
					userId: 1,
					flowId: 1,
					dispositionFlow: {
						id: 1,
						name: 'Test Flow',
						description: 'Test Description',
						campaignId: 1,
						isActive: true,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.getCampaignsWithDispositionFlow();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/campaigns`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('copyToCampaign', () => {
		it('should copy disposition flow to campaign successfully', async () => {
			const mockData: CopyDispositionFlowPayload = {
				sourceFlowId: 1,
				targetCampaignId: 2,
			};
			const mockResponse: CopyDispositionFlowResponse = {
				flow: {
					id: 2,
					clientId: 1,
					campaignId: 2,
					userId: 1,
					flowJson: {},
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
				campaign: {
					id: 2,
					name: 'Target Campaign',
					description: 'Test Description',
					status: 'active',
					type: 'OUTBOUND',
					budget: 1000,
					spent: 0,
					objectiveId: 1,
					promptId: 1,
					dispositionFlowId: 2,
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					dispositionCatalog: null,
				},
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionFlowApi();
			const result = await api.copyToCampaign(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-flows/copy-to-campaign`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
