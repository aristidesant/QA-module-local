import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	KnowledgeBaseModel,
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';

/**
 * Params for creating a knowledge base entry
 */
export type CreateKnowledgeBaseParams = {
	name?: string;
	description?: string;
	type?: string;
	sourceUrl?: string;
	textContent?: string;
	file?: File | Blob | null;
};

export type FindKnowledgeBasesParams = {
	agentId?: string;
	type?: KnowledgeBaseType | string;
	status?: KnowledgeBaseStatus | string;
	search?: string;
	/** Server-side sorting: field name to sort by (e.g. "name") */
	sortBy?: string;
	/** Server-side sorting order: 'asc' | 'desc' */
	sortOrder?: 'asc' | 'desc';
	/** Pagination: number of items to return */
	limit?: number;
	/** Pagination: number of items to skip */
	offset?: number;
};

export type KnowledgeBasesPaginatedResponse = {
	data: KnowledgeBaseModel[];
	total: number;
	page?: number;
	totalPages?: number;
	limit?: number;
};

/**
 * Knowledge Base API client
 * Supports creating knowledge bases (multipart/form-data for file uploads)
 */
const knowledgeBaseApi = (_authHeader?: Record<string, string>) => {
	return {
		/**
		 * Create a knowledge base entry. Accepts multipart/form-data fields:
		 * - name: string
		 * - description: string
		 * - type: string
		 * - sourceUrl: string
		 * - textContent: string
		 * - file: binary file
		 */
		createKnowledgeBase: async (data: CreateKnowledgeBaseParams) => {
			const formData = new FormData();
			if (typeof data.name !== 'undefined')
				formData.append('name', data.name as string);
			if (typeof data.description !== 'undefined')
				formData.append('description', data.description as string);
			if (typeof data.type !== 'undefined')
				formData.append('type', data.type as string);
			if (typeof data.sourceUrl !== 'undefined')
				formData.append('sourceUrl', data.sourceUrl as string);
			if (typeof data.textContent !== 'undefined')
				formData.append('textContent', data.textContent as string);
			if (data.file) formData.append('file', data.file as any);

			const response = await axios.post(
				`${DEFAULT_API_URL}/knowledge-bases`,
				formData,
				{
					headers: {
						// Let axios/set interceptors manage auth; set multipart header to let browser add boundary
						...(_authHeader || {}),
					},
				}
			);

			return response.data;
		},
		/**
		 * Retrieve knowledge bases with optional filters and sorting.
		 * Supported query params: agentId, type, status, search, sortBy, sortOrder, limit, offset
		 */
		getKnowledgeBases: async (params?: FindKnowledgeBasesParams) => {
			const search = new URLSearchParams();
			if (params) {
				// Append pagination first
				if (typeof params.limit !== 'undefined' && params.limit !== null)
					search.append('limit', String(params.limit));
				if (typeof params.offset !== 'undefined' && params.offset !== null)
					search.append('offset', String(params.offset));
				// Then filters and sorting
				if (typeof params.agentId !== 'undefined' && params.agentId !== null)
					search.append('agentId', String(params.agentId));
				if (typeof params.type !== 'undefined' && params.type !== null)
					search.append('type', String(params.type));
				if (typeof params.status !== 'undefined' && params.status !== null)
					search.append('status', String(params.status));
				if (typeof params.search !== 'undefined' && params.search !== null)
					search.append('search', String(params.search));
				if (typeof params.sortBy !== 'undefined' && params.sortBy !== null)
					search.append('sortBy', String(params.sortBy));
				if (
					typeof params.sortOrder !== 'undefined' &&
					params.sortOrder !== null
				)
					search.append('sortOrder', String(params.sortOrder));
			}

			const url = `${DEFAULT_API_URL}/knowledge-bases${search.toString() ? `?${search.toString()}` : ''}`;
			const response = await axios.get(url, {
				headers: {
					...(_authHeader || {}),
				},
			});

			const raw = response.data as any;
			// Normalize shape: backend may return array or { data: KnowledgeBaseModel[] }
			if (Array.isArray(raw)) {
				return raw as KnowledgeBaseModel[];
			}
			if (raw && Array.isArray(raw.data)) {
				return raw.data as KnowledgeBaseModel[];
			}
			// Fallback to empty array to prevent runtime errors
			return [] as KnowledgeBaseModel[];
		},
		/**
		 * Retrieve knowledge bases with optional filters, sorting, and pagination, returning total count.
		 * Attempts to read total from response.data.total or X-Total-Count headers; falls back to data length.
		 */
		getKnowledgeBasesPaginated: async (
			params?: FindKnowledgeBasesParams
		): Promise<KnowledgeBasesPaginatedResponse> => {
			const search = new URLSearchParams();
			if (params) {
				// Append pagination first
				if (typeof params.limit !== 'undefined' && params.limit !== null)
					search.append('limit', String(params.limit));
				if (typeof params.offset !== 'undefined' && params.offset !== null)
					search.append('offset', String(params.offset));
				// Then filters and sorting
				if (typeof params.agentId !== 'undefined' && params.agentId !== null)
					search.append('agentId', String(params.agentId));
				if (typeof params.type !== 'undefined' && params.type !== null)
					search.append('type', String(params.type));
				if (typeof params.status !== 'undefined' && params.status !== null)
					search.append('status', String(params.status));
				if (typeof params.search !== 'undefined' && params.search !== null)
					search.append('search', String(params.search));
				if (typeof params.sortBy !== 'undefined' && params.sortBy !== null)
					search.append('sortBy', String(params.sortBy));
				if (
					typeof params.sortOrder !== 'undefined' &&
					params.sortOrder !== null
				)
					search.append('sortOrder', String(params.sortOrder));
			}

			const url = `${DEFAULT_API_URL}/knowledge-bases${search.toString() ? `?${search.toString()}` : ''}`;
			const response = await axios.get(url, {
				headers: {
					...(_authHeader || {}),
				},
			});

			const raw = response.data as any;
			const data: KnowledgeBaseModel[] = Array.isArray(raw)
				? (raw as KnowledgeBaseModel[])
				: (raw?.data as KnowledgeBaseModel[]) || [];
			const headerTotal =
				(response.headers &&
					(Number(response.headers['x-total-count']) ||
						Number(response.headers['x-total']) ||
						Number(response.headers['x-total-results']))) ||
				undefined;
			const total: number =
				typeof raw?.total === 'number'
					? raw.total
					: typeof headerTotal === 'number' && !Number.isNaN(headerTotal)
						? headerTotal
						: Array.isArray(raw)
							? (raw as KnowledgeBaseModel[]).length
							: Array.isArray(raw?.data)
								? raw.data.length
								: 0;

			const totalPages =
				typeof raw?.totalPages === 'number' ? raw.totalPages : undefined;
			const limit = typeof raw?.limit === 'number' ? raw.limit : undefined;

			return { data, total, totalPages, limit };
		},
		/**
		 * Get a knowledge base by id
		 */
		getKnowledgeBase: async (id: number) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/knowledge-bases/${id}`,
				{
					headers: {
						...(_authHeader || {}),
					},
				}
			);

			return response.data as KnowledgeBaseModel;
		},

		/**
		 * Update a knowledge base by id (patch semantics)
		 */
		updateKnowledgeBase: async (
			id: number,
			data: Partial<CreateKnowledgeBaseParams>
		) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/knowledge-bases/${id}`,
				data,
				{
					headers: {
						...(_authHeader || {}),
					},
				}
			);

			return response.data as KnowledgeBaseModel;
		},

		/**
		 * Delete a knowledge base by id
		 */
		deleteKnowledgeBase: async (id: number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/knowledge-bases/${id}`,
				{
					headers: {
						...(_authHeader || {}),
					},
				}
			);

			return response.data;
		},
		/**
		 * Retry upload/processing for a knowledge base
		 * POST /knowledge-bases/{id}/retry
		 */
		retryKnowledgeBase: async (id: number) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/knowledge-bases/${id}/retry`,
				{},
				{
					headers: {
						...(_authHeader || {}),
					},
				}
			);

			return response.data;
		},
	};
};

export default knowledgeBaseApi;
