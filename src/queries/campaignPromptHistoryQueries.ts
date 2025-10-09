import { useQuery } from '@tanstack/react-query';
import campaignPromptHistoryApi from '~/api/campaignPromptHistoryApi';
import type { CampaignPromptHistoryResponse } from '~/models/CampaignPromptHistoryModel';

// Get campaign prompt history
export const useGetCampaignPromptHistory = (
	campaignId: string | number,
	params?: {
		version?: number;
		userId?: number;
		limit?: number;
		offset?: number;
	}
) => {
	return useQuery<CampaignPromptHistoryResponse>({
		queryKey: ['campaign-prompt-history', campaignId, params],
		queryFn: async () => {
			const api = campaignPromptHistoryApi();
			return api.getCampaignPromptHistory(campaignId, params);
		},
		enabled: !!campaignId,
	});
};
