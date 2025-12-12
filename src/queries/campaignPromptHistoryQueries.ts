import { useQuery } from '@tanstack/react-query';
import campaignPromptHistoryApi from '~/api/campaignPromptHistoryApi';
import type {
	CampaignPromptHistoryItem,
	CampaignPromptHistoryResponse,
} from '~/models/CampaignPromptHistoryModel';

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

// Get campaign prompt history scoped to a prompt type
export const useGetCampaignPromptHistoryByPromptType = (
	campaignId: string | number,
	campaignPromptTypeId: string | number,
	params?: {
		version?: number;
		userId?: number;
		limit?: number;
		offset?: number;
	}
) => {
	return useQuery<CampaignPromptHistoryResponse>({
		queryKey: [
			'campaign-prompt-history',
			campaignId,
			campaignPromptTypeId,
			params,
		],
		queryFn: async () => {
			const api = campaignPromptHistoryApi();
			return api.getCampaignPromptHistoryByPromptType(
				campaignId,
				campaignPromptTypeId,
				params
			);
		},
		enabled: !!campaignId && !!campaignPromptTypeId,
	});
};

// Get the latest prompt history item for a campaign and prompt type
export const useGetLatestCampaignPromptHistoryByPromptType = (
	campaignId: string | number,
	campaignPromptTypeId: string | number
) => {
	return useQuery<CampaignPromptHistoryItem>({
		queryKey: [
			'campaign-prompt-history-latest',
			campaignId,
			campaignPromptTypeId,
		],
		queryFn: async () => {
			const api = campaignPromptHistoryApi();
			return api.getLatestCampaignPromptHistoryByPromptType(
				campaignId,
				campaignPromptTypeId
			);
		},
		enabled: !!campaignId && !!campaignPromptTypeId,
	});
};
