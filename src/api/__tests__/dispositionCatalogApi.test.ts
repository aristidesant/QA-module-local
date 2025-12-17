import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import dispositionCatalogApi from '../dispositionCatalogApi';
import { resetAxiosMocks, createMockResponse } from './setup';
import type {
	DispositionCatalogModel,
	CreateDispositionCatalog,
} from '~/models/DispositionCatalogModels';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type {
	CampaignWithDispositionCatalog,
	CopyDispositionCatalogPayload,
	CopiedDispositionCatalogResponse,
} from '../dispositionCatalogApi';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('dispositionCatalogApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getAllDispositionCatalogs', () => {
		it('should get all disposition catalogs without params', async () => {
			const mockResponse: DispositionCatalogModel[] = [
				{
					id: 1,
					name: 'Test Catalog',
					description: 'Test Description',
					clientId: 1,
					isActive: true,
					isDefault: true,
					type: 'INBOUND',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getAllDispositionCatalogs();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get all disposition catalogs with params', async () => {
			const queryParams = { type: 'INBOUND' };
			const mockResponse: DispositionCatalogModel[] = [
				{
					id: 1,
					name: 'Test Catalog',
					description: 'Test Description',
					clientId: 1,
					isActive: true,
					isDefault: true,
					type: 'INBOUND',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getAllDispositionCatalogs(queryParams);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs?type=INBOUND`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAllDispositionCatalogsAllPaged', () => {
		it('should get paged disposition catalogs without params', async () => {
			const mockResponse: PaginatedResponse<DispositionCatalogModel> = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Catalog',
						description: 'Test Description',
						clientId: 1,
						isActive: true,
						isDefault: true,
						type: 'INBOUND',
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getAllDispositionCatalogsAllPaged();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/all`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get paged disposition catalogs with params', async () => {
			const queryParams = {
				limit: 10,
				offset: 20,
				sortBy: 'createdAt',
				sortOrder: 'DESC' as const,
			};
			const mockResponse: PaginatedResponse<DispositionCatalogModel> = {
				total: 100,
				limit: 10,
				offset: 20,
				data: [],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getAllDispositionCatalogsAllPaged(queryParams);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/all?limit=10&offset=20&sortBy=createdAt&sortOrder=DESC`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createDispositionCatalog', () => {
		it('should create a disposition catalog successfully', async () => {
			const mockData: CreateDispositionCatalog = {
				name: 'New Catalog',
				description: 'New Description',
				isDefault: false,
				type: 'OUTBOUND',
			};
			const mockResponse: DispositionCatalogModel = {
				id: 1,
				name: 'New Catalog',
				description: 'New Description',
				clientId: 1,
				isActive: true,
				isDefault: false,
				type: 'OUTBOUND',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.createDispositionCatalog(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateDispositionCatalog', () => {
		it('should update a disposition catalog successfully', async () => {
			const id = 1;
			const mockData: CreateDispositionCatalog = {
				name: 'Updated Catalog',
			};
			const mockResponse: DispositionCatalogModel = {
				id: 1,
				name: 'Updated Catalog',
				description: 'Test Description',
				clientId: 1,
				isActive: true,
				isDefault: true,
				type: 'INBOUND',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.updateDispositionCatalog(id, mockData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/${id}`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteDispositionCatalog', () => {
		it('should delete a disposition catalog successfully', async () => {
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			const api = dispositionCatalogApi();
			await api.deleteDispositionCatalog(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/${id}`
			);
		});
	});

	describe('getCurrentDispositionFlow', () => {
		it('should get current disposition flow successfully', async () => {
			const campaignId = '1';
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: {
					id: 1,
					name: 'Test Flow',
					description: 'Test Description',
					clientId: 1,
					isActive: true,
					isDefault: true,
					type: 'INBOUND',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getCurrentDispositionFlow(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/flow/current?campaignId=${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('saveDispositionConfiguration', () => {
		it('should save disposition configuration successfully', async () => {
			const campaignId = '1';
			const dispositionData = { config: 'test' };
			const mockResponse = { success: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.saveDispositionConfiguration(
				campaignId,
				dispositionData
			);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/disposition-configuration`,
				dispositionData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('saveDispositionFlow', () => {
		it('should save disposition flow successfully', async () => {
			const mockData = {
				campaignId: 1,
				name: 'Test Flow',
			};
			const mockResponse: DispositionFlowModel = {
				id: 1,
				clientId: 1,
				userId: 1,
				campaignId: 1,
				flowJson: {
					id: 1,
					name: 'Test Catalog',
					description: 'Test Description',
					clientId: 1,
					isActive: true,
					isDefault: true,
					type: 'INBOUND',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.saveDispositionFlow(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/flow`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('reactivateDispositionCatalog', () => {
		it('should reactivate disposition catalog successfully', async () => {
			const catalogId = 1;
			const mockResponse: DispositionCatalogModel = {
				id: 1,
				name: 'Test Catalog',
				description: 'Test Description',
				clientId: 1,
				isActive: true,
				isDefault: true,
				type: 'INBOUND',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.reactivateDispositionCatalog(catalogId);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/${catalogId}/reactivate`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deactivateDispositionCatalog', () => {
		it('should deactivate disposition catalog successfully', async () => {
			const catalogId = 1;
			const mockResponse: DispositionCatalogModel = {
				id: 1,
				name: 'Test Catalog',
				description: 'Test Description',
				clientId: 1,
				isActive: false,
				isDefault: true,
				type: 'INBOUND',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.deactivateDispositionCatalog(catalogId);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/${catalogId}/deactivate`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignsWithCatalog', () => {
		it('should get campaigns with catalog successfully', async () => {
			const mockResponse: CampaignWithDispositionCatalog[] = [
				{
					id: 1,
					name: 'Test Campaign',
					description: 'Test Description',
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					dispositionCatalog: {
						id: 1,
						name: 'Test Catalog',
						description: 'Test Description',
						campaignId: 1,
						isActive: true,
						isDefault: true,
						type: 'INBOUND',
						clientId: 1,
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.getCampaignsWithCatalog();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/campaigns/with-catalog`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('copyToCampaign', () => {
		it('should copy disposition catalog to campaign successfully', async () => {
			const mockData: CopyDispositionCatalogPayload = {
				sourceCatalogId: 1,
				targetCampaignId: 2,
				newCatalogName: 'Copied Catalog',
			};
			const mockResponse: CopiedDispositionCatalogResponse = {
				id: 2,
				name: 'Copied Catalog',
				description: 'Test Description',
				clientId: 1,
				campaignId: 2,
				isActive: true,
				isDefault: false,
				dispositionNodes: [],
				activeNodesCount: 5,
				inactiveNodesCount: 0,
				type: 'INBOUND',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionCatalogApi();
			const result = await api.copyToCampaign(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-catalogs/copy-to-campaign`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
