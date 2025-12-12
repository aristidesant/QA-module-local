import axios from 'axios';
import type {
	CampaignPromptHistoryItem,
	CampaignPromptHistoryResponse,
} from '~/models/CampaignPromptHistoryModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Prompt History API client
 * Note: Authorization handled by global Axios interceptor.
 */
const campaignPromptHistoryApi = (_authHeader?: Record<string, string>) => {
	type CampaignPromptHistoryParams = {
		version?: number;
		userId?: number;
		limit?: number;
		offset?: number;
	};

	return {
		// GET campaign prompt history by campaign ID
		getCampaignPromptHistory: async (
			campaignId: string | number,
			params?: CampaignPromptHistoryParams
		) => {
			const response = await axios.get<CampaignPromptHistoryResponse>(
				`${DEFAULT_API_URL}/campaign-prompt-history/campaign/${campaignId}`,
				{ params }
			);
			return response.data;
		},

		// GET campaign prompt history by campaign ID and prompt type
		getCampaignPromptHistoryByPromptType: async (
			campaignId: string | number,
			campaignPromptTypeId: string | number,
			params?: CampaignPromptHistoryParams
		) => {
			const response = await axios.get<CampaignPromptHistoryResponse>(
				`${DEFAULT_API_URL}/campaign-prompt-history/campaign/${campaignId}/prompt-type/${campaignPromptTypeId}`,
				{ params }
			);
			return response.data;
		},

		// GET latest campaign prompt version by campaign ID and prompt type
		getLatestCampaignPromptHistoryByPromptType: async (
			campaignId: string | number,
			campaignPromptTypeId: string | number
		) => {
			const response = await axios.get<CampaignPromptHistoryItem>(
				`${DEFAULT_API_URL}/campaign-prompt-history/campaign/${campaignId}/prompt-type/${campaignPromptTypeId}/latest`
			);
			return response.data;
		},
	};
};

export default campaignPromptHistoryApi;
