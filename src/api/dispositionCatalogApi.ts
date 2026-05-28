import axios from 'axios';
import type {
	DispositionCatalogModel,
	CreateDispositionCatalog,
	DispositionCatalogExportPayload,
} from '~/models/DispositionCatalogModels';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import { DEFAULT_API_URL } from './config';

/**
 * Represents a campaign with its associated disposition catalog
 */
export interface CampaignWithDispositionCatalog {
	id: number;
	name: string;
	description: string;
	clientId: number;
	userId: number;
	dispositionCatalog: {
		id: number;
		name: string;
		description: string;
		campaignId: number;
		isActive: boolean;
		isDefault: boolean;
		type: string;
		clientId: number;
		userId: number;
		createdAt: string;
		updatedAt: string;
	};
	createdAt: string;
	updatedAt: string;
}

/**
 * Payload for copying a disposition catalog to a new campaign
 */
export interface CopyDispositionCatalogPayload {
	sourceCatalogId: number;
	targetCampaignId: number;
	newCatalogName: string;
}

/**
 * Response from copying a disposition catalog
 */
export interface CopiedDispositionCatalogResponse {
	id: number;
	name: string;
	description: string;
	clientId: number;
	campaignId: number;
	isActive: boolean;
	isDefault: boolean;
	dispositionNodes: {
		id: number;
		clientId: number;
		userId: number;
		name: string;
		description: string;
		isInvalidatesNumber: boolean;
		isAbandoned: boolean;
		doNotCall: boolean;
		requiresReschedule: boolean;
		isFinal: boolean;
		order: number;
		isActive: boolean;
		isVoiceMail: boolean;
		catalogId: number;
		parentId: number | null;
		children: string[];
		createdAt: string;
		updatedAt: string;
		deletedAt: string | null;
	}[];
	activeNodesCount: number;
	inactiveNodesCount: number;
	type: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Internal Disposition Catalog API client
 * Note: Authorization handled by global Axios interceptor.
 * This API should only be used through React Query hooks in dispositionCatalogQueries.ts
 */
const dispositionCatalogApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET all disposition catalogs
		getAllDispositionCatalogs: async (queryParams?: {
			type?: string;
			[key: string]: any;
		}) => {
			const url = new URL(`${DEFAULT_API_URL}/disposition-catalogs`);

			if (queryParams) {
				Object.entries(queryParams).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						url.searchParams.append(key, String(value));
					}
				});
			}

			const response = await axios.get<DispositionCatalogModel[]>(
				url.toString()
			);
			return response.data;
		},

		// GET all disposition catalogs (paged, server-side sort)
		getAllDispositionCatalogsAllPaged: async (queryParams?: {
			limit?: number;
			offset?: number;
			sortBy?: string;
			sortOrder?: 'ASC' | 'DESC';
			type?: string;
			[key: string]: any;
		}) => {
			const url = new URL(`${DEFAULT_API_URL}/disposition-catalogs/all`);

			if (queryParams) {
				Object.entries(queryParams).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						url.searchParams.append(key, String(value));
					}
				});
			}

			const response = await axios.get<
				PaginatedResponse<DispositionCatalogModel>
			>(url.toString());
			return response.data;
		},

		// POST create disposition catalog
		createDispositionCatalog: async (data: CreateDispositionCatalog) => {
			const response = await axios.post<DispositionCatalogModel>(
				`${DEFAULT_API_URL}/disposition-catalogs`,
				data
			);
			return response.data;
		},

		// PUT update disposition catalog
		updateDispositionCatalog: async (
			id: number,
			data: CreateDispositionCatalog
		) => {
			const response = await axios.patch<DispositionCatalogModel>(
				`${DEFAULT_API_URL}/disposition-catalogs/${id}`,
				data
			);
			return response.data;
		},

		// DELETE a disposition catalog by ID
		deleteDispositionCatalog: async (id: number) => {
			await axios.delete(`${DEFAULT_API_URL}/disposition-catalogs/${id}`);
		},

		// GET current disposition flow for a campaign
		getCurrentDispositionFlow: async (campaignId: string | number) => {
			const response = await axios.get<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-catalogs/flow/current?campaignId=${campaignId}`
			);
			return response.data;
		},

		// POST save disposition configuration for a campaign
		saveDispositionConfiguration: async (
			campaignId: string | number,
			dispositionData: object
		) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/disposition-configuration`,
				dispositionData
			);
			return response.data;
		},

		// POST save disposition flow
		saveDispositionFlow: async (
			data: Partial<DispositionFlowModel> & {
				campaignId: string | number;
				name?: string; // Allow optional name for the flow
			}
		) => {
			const response = await axios.post<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-catalogs/flow`,
				data
			);
			return response.data;
		},

		// PATCH reactivate disposition catalog
		reactivateDispositionCatalog: async (catalogId: number) => {
			const response = await axios.patch<DispositionCatalogModel>(
				`${DEFAULT_API_URL}/disposition-catalogs/${catalogId}/reactivate`
			);
			return response.data;
		},

		// PATCH deactivate disposition catalog
		deactivateDispositionCatalog: async (catalogId: number) => {
			const response = await axios.patch<DispositionCatalogModel>(
				`${DEFAULT_API_URL}/disposition-catalogs/${catalogId}/deactivate`
			);
			return response.data;
		},

		// GET all campaigns that have a disposition catalog
		getCampaignsWithCatalog: async () => {
			const response = await axios.get<CampaignWithDispositionCatalog[]>(
				`${DEFAULT_API_URL}/disposition-catalogs/campaigns/with-catalog`
			);
			return response.data;
		},

		// POST copy disposition catalog to a new campaign
		copyToCampaign: async (data: CopyDispositionCatalogPayload) => {
			const response = await axios.post<CopiedDispositionCatalogResponse>(
				`${DEFAULT_API_URL}/disposition-catalogs/copy-to-campaign`,
				data
			);
			return response.data;
		},

		// GET export disposition catalog in import-compatible format
		exportDispositionCatalog: async (catalogId: number | string) => {
			const response = await axios.get<DispositionCatalogExportPayload>(
				`${DEFAULT_API_URL}/disposition-catalogs/${catalogId}/export`
			);
			return response.data;
		},
	};
};

// Internal export - only use through React Query hooks in dispositionCatalogQueries.ts
export default dispositionCatalogApi;
