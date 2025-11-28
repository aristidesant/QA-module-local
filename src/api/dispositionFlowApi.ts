import axios from 'axios';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import { DEFAULT_API_URL } from './config';

/**
 * Represents a campaign with its associated disposition flow and catalog info
 */
export interface CampaignWithDispositionFlow {
	id: number;
	name: string;
	description: string;
	status: string;
	clientId: number;
	userId: number;
	flowId: number | null;
	dispositionFlow?: {
		id: number;
		name: string;
		description: string;
		campaignId: number;
		isActive: boolean;
		createdAt: string;
		updatedAt: string;
	} | null;
	dispositionCatalog?: {
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
	} | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Payload for copying a disposition flow to a new campaign
 */
export interface CopyDispositionFlowPayload {
	sourceFlowId: number;
	targetCampaignId: number;
}

/**
 * Response from copying a disposition flow
 */
export interface CopyDispositionFlowResponse {
	flow: {
		id: number;
		clientId: number;
		campaignId: number;
		userId: number;
		flowJson: Record<string, unknown>;
		createdAt: string;
		updatedAt: string;
	};
	campaign: {
		id: number;
		name: string;
		description: string;
		status: string;
		type: string;
		budget: number;
		spent: number;
		objectiveId: number;
		promptId: number;
		dispositionFlowId: number;
		clientId: number;
		userId: number;
		createdAt: string;
		updatedAt: string;
		dispositionCatalog: {
			id: number;
			name: string;
			description: string;
			type: string;
			isActive: boolean;
			isDefault: boolean;
			clientId: number;
			userId: number;
			campaignId: number;
			createdAt: string;
			updatedAt: string;
		} | null;
	};
}

/**
 * Disposition Flow API client
 * Note: Authorization handled by global Axios interceptor.
 */
const dispositionFlowApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET all disposition flows
		getAllDispositionFlows: async () => {
			const response = await axios.get<DispositionFlowModel[]>(
				`${DEFAULT_API_URL}/disposition-flows`
			);
			return response.data;
		},

		// GET disposition flow by ID
		getDispositionFlowById: async (id: string | number) => {
			const response = await axios.get<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-flows/${id}`
			);
			return response.data;
		},

		// POST create disposition flow
		createDispositionFlow: async (data: Partial<DispositionFlowModel>) => {
			const response = await axios.post<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-flows`,
				data
			);
			return response.data;
		},

		// PATCH update disposition flow
		updateDispositionFlow: async (
			id: string | number,
			data: Partial<DispositionFlowModel>
		) => {
			const response = await axios.patch<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-flows/${id}`,
				data
			);
			return response.data;
		},

		// DELETE disposition flow
		deleteDispositionFlow: async (id: string | number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/disposition-flows/${id}`
			);
			return response.data;
		},

		// GET disposition flows by campaign ID (query parameter)
		getDispositionFlowsByCampaign: async (campaignId: string | number) => {
			const response = await axios.get<DispositionFlowModel[]>(
				`${DEFAULT_API_URL}/disposition-flows?campaignId=${campaignId}`
			);
			return response.data;
		},

		// GET disposition flows by campaign ID (path parameter)
		getDispositionFlowsByCampaignPath: async (campaignId: string | number) => {
			const response = await axios.get<DispositionFlowModel>(
				`${DEFAULT_API_URL}/disposition-flows/campaign/${campaignId}`
			);
			return response.data;
		},

		// GET disposition flows by user ID
		getDispositionFlowsByUser: async (userId: string | number) => {
			const response = await axios.get<DispositionFlowModel[]>(
				`${DEFAULT_API_URL}/disposition-flows?userId=${userId}`
			);
			return response.data;
		},

		// GET all campaigns with disposition flow
		getCampaignsWithDispositionFlow: async () => {
			const response = await axios.get<CampaignWithDispositionFlow[]>(
				`${DEFAULT_API_URL}/disposition-flows/campaigns`
			);
			return response.data;
		},

		// POST copy disposition flow to a new campaign
		copyToCampaign: async (data: CopyDispositionFlowPayload) => {
			const response = await axios.post<CopyDispositionFlowResponse>(
				`${DEFAULT_API_URL}/disposition-flows/copy-to-campaign`,
				data
			);
			return response.data;
		},
	};
};

export default dispositionFlowApi;
