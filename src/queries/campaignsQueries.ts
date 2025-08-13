import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignsApi from "~/api/campaignsApi";
import type { Campaign } from "~/models/CampaignsModel";

// Create campaign
export const useCreateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaign: Partial<Campaign>) => {
			const api = campaignsApi();
			return api.createCampaign(campaign);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			// eslint-disable-next-line no-console
			console.log("Campaign created successfully:", data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error creating campaign:", error);
		},
	});
};

// Get all campaigns
export const useGetAllCampaigns = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ["campaigns", params],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findAllCampaigns(params);
		},
	});
};

// Get campaign by id
export const useGetCampaign = (id: string) => {
	return useQuery({
		queryKey: ["campaign", id],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaign(id);
		},
		enabled: !!id,
	});
};

// Update campaign
export const useUpdateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<Campaign>;
		}) => {
			const api = campaignsApi();
			console.log("Updating campaign with ID:", id, "Data:", data);
			return api.updateCampaign(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
			}
			// eslint-disable-next-line no-console
			console.log("Campaign updated successfully:", data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error updating campaign:", error);
		},
	});
};

export const usePauseOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaignId: string) => {
			const api = campaignsApi();
			return api.pauseOutboundCampaign(campaignId);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({ queryKey: ["campaign", id] });
			// eslint-disable-next-line no-console
			console.log("Campaign paused successfully:", id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error pausing campaign:", error);
		},
	});
};

// Delete campaign
export const useDeleteCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const api = campaignsApi();
			return api.deleteCampaign(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({ queryKey: ["campaign", id] });
			// eslint-disable-next-line no-console
			console.log("Campaign deleted successfully:", id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error("Error deleting campaign:", error);
		},
	});
};
