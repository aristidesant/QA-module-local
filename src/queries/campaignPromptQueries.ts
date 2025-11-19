import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import campaignPromptsApi from '~/api/campaignPromptApi';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';
import type { CampaignPromptGenerateResponse } from '~/models/CampaignPromptGenerateResponse';
import { CampaignPromptGenerateRequest } from '~/models/CampaignPromptGenerateModel';

// Create campaign prompt
export const useCreateCampaignPrompt = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CampaignPromptModel) => {
			const api = campaignPromptsApi();
			return api.createCampaignPrompt(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaign-prompts'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign prompt:', error);
		},
	});
};

// Create campaign prompts batch
export const useCreateCampaignPromptsBatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: { prompts: CampaignPromptModel[] }) => {
			const api = campaignPromptsApi();
			return api.createCampaignPromptsBatch(data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-prompts'] });
			const campaignId = variables.prompts[0]?.campaignId;
			if (campaignId) {
				queryClient.invalidateQueries({
					queryKey: ['campaign', String(campaignId)],
				});
			}
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign prompts batch:', error);
		},
	});
};

// Get all campaign prompts
export type CampaignPromptsQueryParams = {
	campaignId?: number;
	typeId?: number;
} & Record<string, any>;

export const useGetCampaignPrompts = (
	params?: CampaignPromptsQueryParams,
	options?: Omit<
		UseQueryOptions<
			CampaignPromptModel[],
			unknown,
			CampaignPromptModel[],
			[
				'campaign-prompts',
				number | undefined,
				number | undefined,
				CampaignPromptsQueryParams | undefined,
			]
		>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<
		CampaignPromptModel[],
		unknown,
		CampaignPromptModel[],
		[
			'campaign-prompts',
			number | undefined,
			number | undefined,
			CampaignPromptsQueryParams | undefined,
		]
	>({
		queryKey: ['campaign-prompts', params?.campaignId, params?.typeId, params],
		queryFn: async () => {
			const api = campaignPromptsApi();
			return api.getCampaignPrompts(params);
		},
		...options,
	});
};

// Get campaign prompt by id
export const useGetCampaignPrompt = (
	id: number,
	options?: Omit<
		UseQueryOptions<
			CampaignPromptModel,
			unknown,
			CampaignPromptModel,
			['campaign-prompt', number]
		>,
		'queryKey' | 'queryFn' | 'enabled'
	>
) => {
	return useQuery<
		CampaignPromptModel,
		unknown,
		CampaignPromptModel,
		['campaign-prompt', number]
	>({
		queryKey: ['campaign-prompt', id],
		queryFn: async () => {
			const api = campaignPromptsApi();
			return api.getCampaignPrompt(id);
		},
		enabled: !!id,
		...options,
	});
};

// Update campaign prompt
export const useUpdateCampaignPrompt = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: Partial<CampaignPromptModel>;
		}) => {
			const api = campaignPromptsApi();
			return api.updateCampaignPrompt(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-prompts'] });
			if (data?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaign-prompt', data.id],
				});
			}
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating campaign prompt:', error);
		},
	});
};

// Delete campaign prompt
export const useDeleteCampaignPrompt = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = campaignPromptsApi();
			return api.deleteCampaignPrompt(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-prompts'] });
			queryClient.invalidateQueries({ queryKey: ['campaign-prompt', id] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting campaign prompt:', error);
		},
	});
};

// Generate campaign prompt with AI
export const useGenerateCampaignPrompt = () => {
	return useMutation<
		CampaignPromptGenerateResponse,
		unknown,
		CampaignPromptGenerateRequest
	>({
		mutationFn: async (data: CampaignPromptGenerateRequest) => {
			const api = campaignPromptsApi();
			return api.generateCampaignPrompt(data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error generating campaign prompt:', error);
		},
	});
};
