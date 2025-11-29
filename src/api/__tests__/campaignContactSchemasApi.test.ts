import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignContactSchemasApi from '../campaignContactSchemasApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	CampaignContactSchema,
	CampaignContactSchemaResponse,
	CreateCampaignContactSchemaRequest,
	UpdateCampaignContactSchemaRequest,
	SchemaContactDataCheck,
} from '~/models/CampaignContactSchemaModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignContactSchemasApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaignContactSchema', () => {
		it('should create a campaign contact schema successfully', async () => {
			const mockData: CreateCampaignContactSchemaRequest = {
				name: 'Test Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
			};
			const mockResponse: CampaignContactSchema = {
				id: 1,
				name: 'Test Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.createCampaignContactSchema(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData: CreateCampaignContactSchemaRequest = {
				name: 'Test Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = campaignContactSchemasApi();
			await expect(api.createCampaignContactSchema(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('getCampaignContactSchemas', () => {
		it('should fetch campaign contact schemas without params', async () => {
			const mockResponse: CampaignContactSchemaResponse = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Schema',
						code: 'TEST',
						objectiveId: 1,
						schemaFields: [],
						version: 1,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.getCampaignContactSchemas();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch campaign contact schemas with params', async () => {
			const params = { name: 'Test', limit: 20, offset: 0 };
			const mockResponse: CampaignContactSchemaResponse = {
				total: 1,
				limit: 20,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Schema',
						code: 'TEST',
						objectiveId: 1,
						schemaFields: [],
						version: 1,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.getCampaignContactSchemas(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignContactSchemaById', () => {
		it('should fetch a campaign contact schema by id', async () => {
			const id = 1;
			const mockResponse: CampaignContactSchema = {
				id: 1,
				name: 'Test Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.getCampaignContactSchemaById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when schema not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Schema not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignContactSchemasApi();
			await expect(api.getCampaignContactSchemaById(id)).rejects.toThrow(
				'Schema not found'
			);
		});
	});

	describe('updateCampaignContactSchema', () => {
		it('should update a campaign contact schema successfully', async () => {
			const id = 1;
			const updateData: UpdateCampaignContactSchemaRequest = {
				name: 'Updated Schema',
			};
			const mockResponse: CampaignContactSchema = {
				id: 1,
				name: 'Updated Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.updateCampaignContactSchema(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCampaignContactSchema', () => {
		it('should delete a campaign contact schema successfully', async () => {
			const id = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			const api = campaignContactSchemasApi();
			await api.deleteCampaignContactSchema(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/${id}`
			);
		});
	});

	describe('checkSchemaHasContactData', () => {
		it('should check if schema has contact data', async () => {
			const id = 1;
			const mockResponse: SchemaContactDataCheck = {
				hasData: true,
				contactCount: 10,
				lastContactDate: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.checkSchemaHasContactData(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/has-contact-data/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getSchemaByObjectiveId', () => {
		it('should get schema by objective id', async () => {
			const objectiveId = 1;
			const mockResponse: CampaignContactSchemaResponse = {
				total: 1,
				limit: 10,
				offset: 0,
				data: [
					{
						id: 1,
						name: 'Test Schema',
						code: 'TEST',
						objectiveId: 1,
						schemaFields: [],
						version: 1,
						userId: 1,
						clientId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
					},
				],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.getSchemaByObjectiveId(objectiveId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/objective/${objectiveId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getActiveSchemaByCampaignId', () => {
		it('should get active schema by campaign id', async () => {
			const campaignId = 1;
			const mockResponse: CampaignContactSchema = {
				id: 1,
				name: 'Test Schema',
				code: 'TEST',
				objectiveId: 1,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignContactSchemasApi();
			const result = await api.getActiveSchemaByCampaignId(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaign-contact-schemas/campaign/${campaignId}/active`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
