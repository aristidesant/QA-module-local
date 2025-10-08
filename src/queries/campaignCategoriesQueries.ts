import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignCategoriesApi from '../api/campaignCategoriesApi';
import type {
	CampaignCategoryApiParams,
	CreateCampaignCategoryRequest,
	UpdateCampaignCategoryRequest,
} from '../models/CampaignCategoryModel';

// Create campaign category
export const useCreateCampaignCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateCampaignCategoryRequest) => {
			const api = campaignCategoriesApi();
			return api.createCampaignCategory(data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-categories'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-categories-active'],
			});
			// eslint-disable-next-line no-console
			console.log('Campaign category created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign category:', error);
		},
	});
};

// Get all campaign categories
export const useGetCampaignCategories = (
	params?: CampaignCategoryApiParams
) => {
	return useQuery({
		queryKey: ['campaign-categories', params],
		queryFn: async () => {
			const api = campaignCategoriesApi();
			return api.getCampaignCategories(params);
		},
	});
};

// Get campaign category by ID
export const useGetCampaignCategoryById = (id: number, enabled = true) => {
	return useQuery({
		queryKey: ['campaign-category', id],
		queryFn: async () => {
			const api = campaignCategoriesApi();
			return api.getCampaignCategoryById(id);
		},
		enabled: enabled && !!id,
	});
};

// Update campaign category
export const useUpdateCampaignCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: UpdateCampaignCategoryRequest;
		}) => {
			const api = campaignCategoriesApi();
			return api.updateCampaignCategory(id, data);
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-categories'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-categories-active'],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaign-category', variables.id],
			});
			// eslint-disable-next-line no-console
			console.log('Campaign category updated successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating campaign category:', error);
		},
	});
};

// Delete campaign category
export const useDeleteCampaignCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = campaignCategoriesApi();
			return api.deleteCampaignCategory(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['campaign-categories'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-categories-active'],
			});
			queryClient.removeQueries({ queryKey: ['campaign-category', id] });
			// eslint-disable-next-line no-console
			console.log('Campaign category deleted successfully');
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting campaign category:', error);
		},
	});
};

// Get active campaign categories
export const useGetActiveCampaignCategories = () => {
	return useQuery({
		queryKey: ['campaign-categories-active'],
		queryFn: async () => {
			const api = campaignCategoriesApi();
			return api.getActiveCampaignCategories();
		},
	});
};
