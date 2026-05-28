import axios from 'axios';
import type {
	CreateDispositionNodePayload,
	DispositionNode,
	DispositionNodeFilters,
	UpdateDispositionNodePayload,
} from '~/models/DispositionNodeModel';
import type {
	DispositionCatalogImportRequest,
	DispositionCatalogImportResponse,
} from '~/models/DispositionCatalogModels';
import { DEFAULT_API_URL } from './config';

const serializeQueryParams = (params?: Record<string, unknown>) => {
	if (!params) return undefined;

	return Object.fromEntries(
		Object.entries(params).flatMap(([key, value]) => {
			if (value === undefined || value === null || value === '') {
				return [];
			}

			return [[key, typeof value === 'boolean' ? String(value) : value]];
		})
	);
};

/**
 * Disposition Nodes API client
 * Note: Authorization handled by global Axios interceptor.
 */
const dispositionNodesApi = (_authHeader?: Record<string, string>) => {
	return {
		// Create new node
		createNode: async (data: CreateDispositionNodePayload) => {
			const response = await axios.post<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes`,
				data
			);
			return response.data;
		},

		// Get all nodes (with filters)
		getNodes: async (params?: DispositionNodeFilters) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes`,
				{ params: serializeQueryParams(params) }
			);
			return response.data;
		},

		// Get specific node
		getNodeById: async (id: number | string) => {
			const response = await axios.get<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}`
			);
			return response.data;
		},

		// Update node
		updateNode: async (
			id: number | string,
			data: UpdateDispositionNodePayload
		) => {
			const response = await axios.patch<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}`,
				data
			);
			return response.data;
		},

		// Soft delete node
		deleteNode: async (id: number | string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/disposition-nodes/${id}`
			);
			return response.data;
		},

		// Restore deleted node
		restoreNode: async (id: number | string) => {
			const response = await axios.put<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/restore`,
				{}
			);
			return response.data;
		},

		// Get complete tree structure for catalog
		getTreeByCatalog: async (catalogId: number | string) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes/tree/catalog/${catalogId}`
			);
			return response.data;
		},

		// Get root nodes for catalog
		getRootsByCatalog: async (catalogId: number | string) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes/roots/catalog/${catalogId}`
			);
			return response.data;
		},

		// Get direct children
		getChildren: async (id: number | string) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/children`
			);
			return response.data;
		},

		// Get all ancestors
		getAncestors: async (id: number | string) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/ancestors`
			);
			return response.data;
		},

		// Get all descendants
		getDescendants: async (id: number | string) => {
			const response = await axios.get<DispositionNode[]>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/descendants`
			);
			return response.data;
		},

		// Move node to new parent
		moveNode: async (id: number | string, parentId: number | null) => {
			const response = await axios.put<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/move`,
				{ parentId }
			);
			return response.data;
		},

		// Bulk update node orders
		bulkUpdateOrder: async (orders: Array<{ id: number; order: number }>) => {
			const response = await axios.put(
				`${DEFAULT_API_URL}/disposition-nodes/bulk-order`,
				orders
			);
			return response.data;
		},

		// Reactivate inactive node
		reactivateNode: async (id: number | string) => {
			const response = await axios.patch<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/reactivate`
			);
			return response.data;
		},

		// Deactivate active node
		deactivateNode: async (id: number | string) => {
			const response = await axios.patch<DispositionNode>(
				`${DEFAULT_API_URL}/disposition-nodes/${id}/deactivate`
			);
			return response.data;
		},

		// Import a complete disposition catalog structure
		importDispositionNodes: async (data: DispositionCatalogImportRequest) => {
			const response = await axios.post<DispositionCatalogImportResponse>(
				`${DEFAULT_API_URL}/disposition-nodes/import`,
				data
			);
			return response.data;
		},
	};
};

export default dispositionNodesApi;
