import axios from 'axios';
import type {
	Campaign,
	PaginatedResponse,
	SchedulerSummary,
} from '~/models/CampaignsModel';
import { DEFAULT_API_URL } from './config';

// import { getAuthorizationHeader } from "../utils/tokenUtils";

/**
 * Generic Campaigns API client (uses global axios interceptors for auth)
 */
const campaignsApi = (_authHeader: Record<string, string> = {}) => {
	return {
		// CREATE campaign
		createCampaign: async (campaign: Partial<Campaign>) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns`,
				campaign
			);
			return response.data;
		},

		// FIND ALL campaigns
		findAllCampaigns: async (
			params?: Record<string, any>,
			extraHeaders?: Record<string, string>
		) => {
			const response = await axios.get<Campaign[]>(
				`${DEFAULT_API_URL}/campaigns`,
				{
					params,
					...(extraHeaders ? { headers: extraHeaders } : {}),
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ALL campaigns with pagination
		findAllCampaignsPaginated: async (
			params?: Record<string, any>,
			extraHeaders?: Record<string, string>
		) => {
			const response = await axios.get<PaginatedResponse<Campaign>>(
				`${DEFAULT_API_URL}/campaigns/paginated`,
				{
					params,
					...(extraHeaders ? { headers: extraHeaders } : {}),
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE campaign
		findCampaign: async (campaignId: string) => {
			const response = await axios.get<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`
			);
			return response.data;
		},

		findCampaignsTimeEnd: async (campaignId: string) => {
			const response = await axios.get<{ timeEnd: string }>(
				`${DEFAULT_API_URL}/campaigns/timeEnd/${campaignId}`
			);
			return response.data;
		},

		findCampaignScheduleSummary: async (campaignId: string) => {
			const response = await axios.get<SchedulerSummary[]>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/day-configs/summary`
			);
			return response.data;
		},

		// UPDATE campaign (PATCH)
		updateCampaign: async (campaignId: string, data: Partial<Campaign>) => {
			console.log(
				`Updating campaign with ID: ${campaignId}, Data: ${JSON.stringify(
					data
				)}`
			);
			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`,
				data
			);
			return response.data;
		},

		startOutboundCampaign: async (campaignId: number) => {
			const response = await axios.post(`${DEFAULT_API_URL}/outbound/start`, {
				campaignId,
			});
			return response.data;
		},

		pauseOutboundCampaign: async (campaignId: number) => {
			const response = await axios.patch(`${DEFAULT_API_URL}/outbound/pause`, {
				campaignId,
			});
			return response.data;
		},
		resumeOutboundCampaign: async (campaignId: number) => {
			const response = await axios.patch(`${DEFAULT_API_URL}/outbound/resume`, {
				campaignId,
			});
			return response.data;
		},

		// DELETE campaign
		deleteCampaign: async (campaignId: string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`
			);
			return response.data;
		},

		// CLONE campaign
		cloneCampaign: async (
			campaignId: string,
			data: {
				name: string;
				description: string;
				agentsToDuplicate: Array<{ agentId: string; newName: string }>;
			}
		) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/clone`,
				data
			);
			return response.data;
		},

		// ASSIGN objective to campaign
		assignObjectiveToCampaign: async (
			campaignId: string | number,
			objectiveId: number
		) => {
			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/assign-objective`,
				{ objectiveId }
			);
			return response.data;
		},
	};
};

export default campaignsApi;
