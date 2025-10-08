import axios from 'axios';
import type { CampaignPromptHistoryResponse } from '~/models/CampaignPromptHistoryModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Prompt History API client
 * Note: Authorization handled by global Axios interceptor.
 */
const campaignPromptHistoryApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET campaign prompt history by campaign ID
		getCampaignPromptHistory: async (
			campaignId: string | number,
			params?: {
				version?: number;
				userId?: number;
				limit?: number;
				offset?: number;
			}
		) => {
			const response = await axios.get<CampaignPromptHistoryResponse>(
				`${DEFAULT_API_URL}/campaign-prompt-history/campaign/${campaignId}`,
				{ params }
			);
			return response.data;
		},
	};
};

export default campaignPromptHistoryApi;
