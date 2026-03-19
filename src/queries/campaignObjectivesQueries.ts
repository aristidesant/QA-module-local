import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignObjectivesApi from '../api/campaignObjectivesApi';
import type {
	CampaignObjectiveApiParams,
	CreateCampaignObjectiveRequest,
	UpdateCampaignObjectiveRequest,
} from '../models/CampaignObjectiveModel';

// Create campaign objective
export const useCreateCampaignObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateCampaignObjectiveRequest) => {
			const api = campaignObjectivesApi();
			return api.createCampaignObjective(data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-objectives'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-objectives-active'],
			});
			// Invalidate category-specific queries if categoryId exists
			if (data.categoryId) {
				queryClient.invalidateQueries({
					queryKey: ['campaign-objectives-by-category', data.categoryId],
				});
				queryClient.invalidateQueries({
					queryKey: ['campaign-objectives-by-category-active', data.categoryId],
				});
			}
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get all campaign objectives
export const useGetCampaignObjectives = (
	params?: CampaignObjectiveApiParams
) => {
	return useQuery({
		queryKey: ['campaign-objectives', params],
		queryFn: async () => {
			const api = campaignObjectivesApi();
			return api.getCampaignObjectives(params);
		},
	});
};

// Get campaign objective by ID
export const useGetCampaignObjectiveById = (id: number, enabled = true) => {
	return useQuery({
		queryKey: ['campaign-objective', id],
		queryFn: async () => {
			const api = campaignObjectivesApi();
			return api.getCampaignObjectiveById(id);
		},
		enabled: enabled && !!id,
	});
};

// Update campaign objective
export const useUpdateCampaignObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateCampaignObjectiveRequest;
		}) => {
			const api = campaignObjectivesApi();
			return api.updateCampaignObjective(id, data);
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-objectives'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-objectives-active'],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaign-objective', variables.id],
			});
			// Invalidate category-specific queries if categoryId exists
			if (data.categoryId) {
				queryClient.invalidateQueries({
					queryKey: ['campaign-objectives-by-category', data.categoryId],
				});
				queryClient.invalidateQueries({
					queryKey: ['campaign-objectives-by-category-active', data.categoryId],
				});
			}
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Delete campaign objective
export const useDeleteCampaignObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = campaignObjectivesApi();
			return api.deleteCampaignObjective(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-objectives'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-objectives-active'],
			});
			queryClient.removeQueries({ queryKey: ['campaign-objective', id] });
			// Invalidate all category-specific queries since we don't know which category this belonged to
			queryClient.invalidateQueries({
				queryKey: ['campaign-objectives-by-category'],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaign-objectives-by-category-active'],
			});
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get active campaign objectives
export const useGetActiveCampaignObjectives = () => {
	return useQuery({
		queryKey: ['campaign-objectives-active'],
		queryFn: async () => {
			const api = campaignObjectivesApi();
			return api.getActiveCampaignObjectives();
		},
	});
};

// Get objectives by category ID
export const useGetObjectivesByCategory = (
	categoryId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['campaign-objectives-by-category', categoryId],
		queryFn: async () => {
			const api = campaignObjectivesApi();
			return api.getObjectivesByCategory(categoryId);
		},
		enabled: enabled && !!categoryId,
	});
};

// Get active objectives by category ID
export const useGetActiveObjectivesByCategory = (
	categoryId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['campaign-objectives-by-category-active', categoryId],
		queryFn: async () => {
			const api = campaignObjectivesApi();
			return api.getActiveObjectivesByCategory(categoryId);
		},
		enabled: enabled && !!categoryId,
	});
};
