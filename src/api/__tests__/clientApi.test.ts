import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import clientApi from '../clientApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	ClientModel,
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('clientApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getClientById', () => {
		it('should fetch a client by ID', async () => {
			const clientId = 1;
			const mockClient: Partial<ClientModel> = {
				id: 1,
				name: 'Test Client',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockClient));

			const api = clientApi();
			const result = await api.getClientById(clientId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/clients/${clientId}`,
				{ headers: {} }
			);
			expect(result).toEqual(mockClient);
		});

		it('should include auth headers when provided', async () => {
			const clientId = 1;
			const authHeader = { Authorization: 'Bearer token' };
			const mockClient = { id: 1, name: 'Test Client' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockClient));

			const api = clientApi(authHeader);
			await api.getClientById(clientId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/clients/${clientId}`,
				{ headers: authHeader }
			);
		});

		it('should throw error when client not found', async () => {
			const clientId = 999;
			const error = createMockAxiosError('Client not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = clientApi();
			await expect(api.getClientById(clientId)).rejects.toThrow(
				'Client not found'
			);
		});
	});

	describe('getAllClients', () => {
		it('should fetch all clients', async () => {
			const mockClients = [
				{ id: 1, name: 'Client 1' },
				{ id: 2, name: 'Client 2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockClients));

			const api = clientApi();
			const result = await api.getAllClients();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/clients`, {
				headers: {},
			});
			expect(result).toEqual(mockClients);
		});

		it('should return empty array when no clients exist', async () => {
			(axios.get as Mock).mockResolvedValue(createMockResponse([]));

			const api = clientApi();
			const result = await api.getAllClients();

			expect(result).toEqual([]);
		});
	});

	describe('createClient', () => {
		it('should create a new client', async () => {
			const clientData: CreateClientRequest = {
				name: 'New Client',
			};
			const mockResponse = { id: 1, name: 'New Client' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = clientApi();
			const result = await api.createClient(clientData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/clients`,
				clientData,
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error on invalid client data', async () => {
			const clientData = { name: '' } as CreateClientRequest;
			const error = createMockAxiosError('Invalid client data', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = clientApi();
			await expect(api.createClient(clientData)).rejects.toThrow(
				'Invalid client data'
			);
		});
	});

	describe('updateClient', () => {
		it('should update an existing client', async () => {
			const clientId = 1;
			const updateData: UpdateClientRequest = {
				name: 'Updated Client Name',
			};
			const mockResponse = { id: 1, name: 'Updated Client Name' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = clientApi();
			const result = await api.updateClient(clientId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/clients/${clientId}`,
				updateData,
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when updating non-existent client', async () => {
			const clientId = 999;
			const updateData = { name: 'Updated Name' } as UpdateClientRequest;
			const error = createMockAxiosError('Client not found', 404);
			(axios.patch as Mock).mockRejectedValue(error);

			const api = clientApi();
			await expect(api.updateClient(clientId, updateData)).rejects.toThrow(
				'Client not found'
			);
		});
	});

	describe('deleteClient', () => {
		it('should delete a client', async () => {
			const clientId = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = clientApi();
			await api.deleteClient(clientId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/clients/${clientId}`,
				{ headers: {} }
			);
		});

		it('should throw error when deleting non-existent client', async () => {
			const clientId = 999;
			const error = createMockAxiosError('Client not found', 404);
			(axios.delete as Mock).mockRejectedValue(error);

			const api = clientApi();
			await expect(api.deleteClient(clientId)).rejects.toThrow(
				'Client not found'
			);
		});

		it('should throw error when client has dependencies', async () => {
			const clientId = 1;
			const error = createMockAxiosError(
				'Cannot delete client with active campaigns',
				409
			);
			(axios.delete as Mock).mockRejectedValue(error);

			const api = clientApi();
			await expect(api.deleteClient(clientId)).rejects.toThrow(
				'Cannot delete client with active campaigns'
			);
		});
	});
});
