import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignsApi from '~/api/campaignsApi';
import type { Campaign, PaginatedResponse } from '~/models/CampaignsModel';

// Create campaign
export const useCreateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaign: Partial<Campaign>) => {
			const api = campaignsApi();
			return api.createCampaign(campaign);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			// eslint-disable-next-line no-console
			console.log('Campaign created successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign:', error);
		},
	});
};

// Get all campaigns
export const useGetAllCampaigns = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ['campaigns', params],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findAllCampaigns(params);
		},
	});
};

// Get all campaigns with pagination
export const useGetAllCampaignsPaginated = (params?: Record<string, any>) => {
	return useQuery({
		queryKey: ['campaigns-paginated', params],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findAllCampaignsPaginated(params);
		},
	});
};

// Get campaign by id
export const useGetCampaign = (id: string) => {
	return useQuery({
		queryKey: ['campaign', id],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaign(id);
		},
		enabled: !!id,
	});
};

export const useGetCampaignsTimeEnd = (campaignId: string) => {
	return useQuery({
		queryKey: ['campaigns-timeEnd', campaignId],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaignsTimeEnd(campaignId);
		},
		enabled: !!campaignId,
		retry: false,
	});
};

export const useGetCampaignScheduleSummary = (campaignId: string) => {
	return useQuery({
		queryKey: ['campaign-schedule-summary', campaignId],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaignScheduleSummary(campaignId);
		},
		enabled: !!campaignId,
		retry: false,
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
			console.log('Updating campaign with ID:', id, 'Data:', data);
			return api.updateCampaign(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
			}
			// eslint-disable-next-line no-console
			console.log('Campaign updated successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error updating campaign:', error);
		},
	});
};

export const useStartOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaignId: number) => {
			const api = campaignsApi();
			return api.startOutboundCampaign(campaignId);
		},
		onSuccess: (_, campaignId) => {
			// Update the campaigns list cache directly
			queryClient.setQueryData(
				['campaigns-paginated'],
				(oldData: PaginatedResponse<Campaign> | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						data: oldData.data.map((campaign) =>
							campaign.id === campaignId
								? { ...campaign, status: 'RUNNING' as const }
								: campaign
						),
					};
				}
			);

			// Force immediate refetch as backup
			queryClient.refetchQueries({ queryKey: ['campaigns'] });
			queryClient.refetchQueries({ queryKey: ['campaigns-paginated'] });
			queryClient.refetchQueries({
				queryKey: ['campaign', campaignId],
			});

			// Also invalidate all campaign-related queries as backup
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === 'campaigns' ||
					query.queryKey[0] === 'campaigns-paginated' ||
					query.queryKey[0] === 'campaign',
			});
			// eslint-disable-next-line no-console
			console.log('Campaign started successfully:', campaignId);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error starting campaign:', error);
		},
	});
};

export const usePauseOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaignId: number) => {
			const api = campaignsApi();
			return api.pauseOutboundCampaign(campaignId);
		},
		onSuccess: (_, campaignId) => {
			// Update the campaigns list cache directly
			queryClient.setQueryData(
				['campaigns-paginated'],
				(oldData: PaginatedResponse<Campaign> | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						data: oldData.data.map((campaign) =>
							campaign.id === campaignId
								? { ...campaign, status: 'PAUSED' as const }
								: campaign
						),
					};
				}
			);

			// Force immediate refetch as backup
			queryClient.refetchQueries({ queryKey: ['campaigns'] });
			queryClient.refetchQueries({ queryKey: ['campaigns-paginated'] });
			queryClient.refetchQueries({
				queryKey: ['campaign', campaignId],
			});

			// Also invalidate all campaign-related queries as backup
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === 'campaigns' ||
					query.queryKey[0] === 'campaigns-paginated' ||
					query.queryKey[0] === 'campaign',
			});
			// eslint-disable-next-line no-console
			console.log('Campaign paused successfully:', campaignId);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error pausing campaign:', error);
		},
	});
};

export const useResumeOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaignId: number) => {
			const api = campaignsApi();
			return api.resumeOutboundCampaign(campaignId);
		},
		onSuccess: (_, campaignId) => {
			// Update the campaigns list cache directly
			queryClient.setQueryData(
				['campaigns-paginated'],
				(oldData: PaginatedResponse<Campaign> | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						data: oldData.data.map((campaign) =>
							campaign.id === campaignId
								? { ...campaign, status: 'RUNNING' as const }
								: campaign
						),
					};
				}
			);

			// Force immediate refetch as backup
			queryClient.refetchQueries({ queryKey: ['campaigns'] });
			queryClient.refetchQueries({ queryKey: ['campaigns-paginated'] });
			queryClient.refetchQueries({
				queryKey: ['campaign', campaignId],
			});

			// Also invalidate all campaign-related queries as backup
			queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === 'campaigns' ||
					query.queryKey[0] === 'campaigns-paginated' ||
					query.queryKey[0] === 'campaign',
			});
			// eslint-disable-next-line no-console
			console.log('Campaign resumed successfully:', campaignId);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error resuming campaign:', error);
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
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			queryClient.invalidateQueries({ queryKey: ['campaign', id] });
			// eslint-disable-next-line no-console
			console.log('Campaign deleted successfully:', id);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error deleting campaign:', error);
		},
	});
};

// Clone campaign
export const useCloneCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			data,
		}: {
			campaignId: string;
			data: {
				name: string;
				description: string;
				agentsToDuplicate: Array<{ agentId: string; newName: string }>;
			};
		}) => {
			const api = campaignsApi();
			return api.cloneCampaign(campaignId, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			// eslint-disable-next-line no-console
			console.log('Campaign cloned successfully:', data);
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error cloning campaign:', error);
		},
	});
};
