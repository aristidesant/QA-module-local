import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import dispositionNodesApi from '../dispositionNodesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { DispositionNode } from '~/models/DispositionNodeModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('dispositionNodesApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createNode', () => {
		it('should create a disposition node successfully', async () => {
			const mockData = { name: 'Test Node', catalogId: 1 };
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Test Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.createNode(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getNodes', () => {
		it('should get nodes without params', async () => {
			const mockResponse: DispositionNode[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					name: 'Test Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getNodes();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get nodes with params', async () => {
			const params = { catalogId: 1 };
			const mockResponse: DispositionNode[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					name: 'Test Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getNodes(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes`,
				{ params }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getNodeById', () => {
		it('should get node by id successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Test Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getNodeById(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when node not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Node not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = dispositionNodesApi();
			await expect(api.getNodeById(id)).rejects.toThrow('Node not found');
		});
	});

	describe('updateNode', () => {
		it('should update a node successfully', async () => {
			const id = 1;
			const updateData = { name: 'Updated Node' };
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Updated Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.updateNode(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteNode', () => {
		it('should delete a node successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = dispositionNodesApi();
			const result = await api.deleteNode(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('restoreNode', () => {
		it('should restore a node successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Restored Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.put as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.restoreNode(id);

			expect(axios.put).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/restore`,
				{}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getTreeByCatalog', () => {
		it('should get tree by catalog successfully', async () => {
			const catalogId = 1;
			const mockResponse: DispositionNode[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					name: 'Root Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getTreeByCatalog(catalogId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/tree/catalog/${catalogId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getRootsByCatalog', () => {
		it('should get roots by catalog successfully', async () => {
			const catalogId = 1;
			const mockResponse: DispositionNode[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					name: 'Root Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getRootsByCatalog(catalogId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/roots/catalog/${catalogId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getChildren', () => {
		it('should get children successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode[] = [
				{
					id: 2,
					clientId: 1,
					userId: 1,
					name: 'Child Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					parentId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getChildren(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/children`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAncestors', () => {
		it('should get ancestors successfully', async () => {
			const id = 2;
			const mockResponse: DispositionNode[] = [
				{
					id: 1,
					clientId: 1,
					userId: 1,
					name: 'Parent Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getAncestors(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/ancestors`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getDescendants', () => {
		it('should get descendants successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode[] = [
				{
					id: 2,
					clientId: 1,
					userId: 1,
					name: 'Child Node',
					isInvalidatesNumber: false,
					requiresReschedule: false,
					isFinal: false,
					order: 1,
					isActive: true,
					catalogId: 1,
					parentId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.getDescendants(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/descendants`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('moveNode', () => {
		it('should move node successfully', async () => {
			const id = 2;
			const parentId = 3;
			const mockResponse: DispositionNode = {
				id: 2,
				clientId: 1,
				userId: 1,
				name: 'Moved Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				parentId: 3,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.put as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.moveNode(id, parentId);

			expect(axios.put).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/move`,
				{ parentId }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('bulkUpdateOrder', () => {
		it('should bulk update order successfully', async () => {
			const orders = [{ id: 1, order: 2 }];
			const mockResponse = { success: true };
			(axios.put as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.bulkUpdateOrder(orders);

			expect(axios.put).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/bulk-order`,
				orders
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('reactivateNode', () => {
		it('should reactivate node successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Reactivated Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: true,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.reactivateNode(id);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/reactivate`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deactivateNode', () => {
		it('should deactivate node successfully', async () => {
			const id = 1;
			const mockResponse: DispositionNode = {
				id: 1,
				clientId: 1,
				userId: 1,
				name: 'Deactivated Node',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: false,
				order: 1,
				isActive: false,
				catalogId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dispositionNodesApi();
			const result = await api.deactivateNode(id);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/disposition-nodes/${id}/deactivate`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
