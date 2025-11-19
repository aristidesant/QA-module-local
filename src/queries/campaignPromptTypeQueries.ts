import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignPromptTypeApi from '~/api/campaignPromptTypeApi';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

// Create Campaign Prompt Type
export const useCreateCampaignPromptType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<CampaignPromptTypeModel>) => {
			const api = campaignPromptTypeApi();
			return api.createCampaignPromptType(data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaignPromptTypes'] });
			if (data?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaignPromptType', data.id],
				});
			}
			console.log('Campaign prompt type created:', data);
		},
		onError: (error) => {
			console.error('Error creating campaign prompt type:', error);
		},
	});
};

// Get all Campaign Prompt Types
export const useGetAllCampaignPromptTypes = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ['campaignPromptTypes', params],
		queryFn: async () => {
			const api = campaignPromptTypeApi();
			return api.findAllCampaignPromptTypes(params);
		},
	});
};

// Get one Campaign Prompt Type by ID
export const useGetCampaignPromptType = (id?: string | number) => {
	return useQuery({
		queryKey: ['campaignPromptType', id],
		queryFn: async () => {
			const api = campaignPromptTypeApi();
			return api.findCampaignPromptType(id as string | number);
		},
		enabled: !!id,
	});
};

// Update Campaign Prompt Type
export const useUpdateCampaignPromptType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string | number;
			data: Partial<CampaignPromptTypeModel>;
		}) => {
			const api = campaignPromptTypeApi();
			return api.updateCampaignPromptType(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaignPromptTypes'] });
			if (data?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaignPromptType', data.id],
				});
			}
			console.log('Campaign prompt type updated:', data);
		},
		onError: (error) => {
			console.error('Error updating campaign prompt type:', error);
		},
	});
};

// Delete Campaign Prompt Type
export const useDeleteCampaignPromptType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string | number) => {
			const api = campaignPromptTypeApi();
			return api.deleteCampaignPromptType(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['campaignPromptTypes'] });
			queryClient.invalidateQueries({ queryKey: ['campaignPromptType', id] });
			console.log('Campaign prompt type deleted:', id);
		},
		onError: (error) => {
			console.error('Error deleting campaign prompt type:', error);
		},
	});
};

export default {} as unknown;
