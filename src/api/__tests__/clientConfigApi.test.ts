import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import clientConfigApi, {
	getClientConfigs,
	getClientConfigByName,
	createClientConfig,
	updateClientConfig,
	deleteClientConfig,
	getContactColumnsMapping,
	updateContactColumnsMapping,
} from '../clientConfigApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	ClientConfig,
	ClientConfigResponse,
	CreateClientConfig,
	UpdateClientConfig,
	ContactColumnMapping,
} from '~/models/ClientConfig';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('clientConfigApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('clientConfigApi function', () => {
		describe('getClientConfig', () => {
			it('should get client config by name', async () => {
				const name = 'test-config';
				const mockResponse: ClientConfig = {
					id: 1,
					name,
					description: 'Test config',
					value: 'test value',
					type: 'string',
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				};
				(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

				const api = clientConfigApi();
				const result = await api.getClientConfig(name);

				expect(axios.get).toHaveBeenCalledWith(
					`${TEST_API_URL}/client-configs/${name}`,
					{ timeout: 5000 }
				);
				expect(result).toEqual(mockResponse);
			});
		});
	});

	describe('getClientConfigs', () => {
		it('should get all client configs without params', async () => {
			const mockResponse: ClientConfigResponse = {
				configs: [
					{
						id: 1,
						name: 'config1',
						description: 'Config 1',
						value: 'value1',
						type: 'string',
						clientId: 1,
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getClientConfigs();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/client-configs`, {
				params: undefined,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get client configs with params', async () => {
			const params = { limit: 20, offset: 10 };
			const mockResponse: ClientConfigResponse = {
				configs: [],
				total: 0,
				limit: 20,
				offset: 10,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getClientConfigs(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/client-configs`, {
				params,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getClientConfigByName', () => {
		it('should get client config by name', async () => {
			const name = 'test-config';
			const mockResponse: ClientConfig = {
				id: 1,
				name,
				description: 'Test config',
				value: 'test value',
				type: 'string',
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getClientConfigByName(name);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs/${name}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createClientConfig', () => {
		it('should create client config successfully', async () => {
			const data: CreateClientConfig = {
				name: 'new-config',
				description: 'New config',
				value: 'new value',
				type: 'string',
			};
			const mockResponse: ClientConfig = {
				id: 1,
				name: 'new-config',
				description: 'New config',
				value: 'new value',
				type: 'string',
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await createClientConfig(data);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs`,
				data
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when creation fails', async () => {
			const data: CreateClientConfig = {
				name: 'new-config',
				description: 'New config',
				value: 'new value',
				type: 'string',
			};
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(createClientConfig(data)).rejects.toThrow('Creation failed');
		});
	});

	describe('updateClientConfig', () => {
		it('should update client config successfully', async () => {
			const name = 'test-config';
			const data: UpdateClientConfig = {
				description: 'Updated config',
				value: 'updated value',
				type: 'string',
			};
			const mockResponse: ClientConfig = {
				id: 1,
				name,
				description: 'Updated config',
				value: 'updated value',
				type: 'string',
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await updateClientConfig(name, data);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs/${name}`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteClientConfig', () => {
		it('should delete client config successfully', async () => {
			const name = 'test-config';
			(axios.delete as Mock).mockResolvedValue(createMockResponse({}));

			await deleteClientConfig(name);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs/${name}`
			);
		});
	});

	describe('getContactColumnsMapping', () => {
		it('should get contact columns mapping', async () => {
			const mockResponse: ContactColumnMapping[] = [
				{ name: 'name', label: 'Name' },
				{ name: 'email', label: 'Email' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await getContactColumnsMapping();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs/contact-columns/mapping`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateContactColumnsMapping', () => {
		it('should update contact columns mapping', async () => {
			const columns = ['name', 'email', 'phone'];
			const mockResponse: ContactColumnMapping[] = [
				{ name: 'name', label: 'Name' },
				{ name: 'email', label: 'Email' },
				{ name: 'phone', label: 'Phone' },
			];
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await updateContactColumnsMapping(columns);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/client-configs/contact-columns/mapping`,
				columns
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
