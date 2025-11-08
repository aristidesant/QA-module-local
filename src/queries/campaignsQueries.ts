import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import campaignsApi, {
	type CreateCampaignWithAgentDTO,
	type CreateCampaignScheduleDTO,
} from '~/api/campaignsApi';
import type { Campaign } from '~/models/CampaignsModel';
import type { CampaignLiveMetric } from '~/models/CampaignLiveMetricModel';
import type ContactGroup from '~/models/ContactGroup';

// Create campaign
export const useCreateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (campaign: Partial<Campaign>) => {
			const api = campaignsApi();
			return api.createCampaign(campaign);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
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
		retry: false,
	});
};

// Get campaign by id
export const useGetCampaign = (
	id: string,
	options?: Omit<
		UseQueryOptions<Campaign, unknown, Campaign, ['campaign', string]>,
		'queryKey' | 'queryFn' | 'enabled'
	>
) => {
	return useQuery<Campaign, unknown, Campaign, ['campaign', string]>({
		queryKey: ['campaign', id],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaign(id);
		},
		enabled: !!id,
		...options,
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

export const useCreateCampaignSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			data,
		}: {
			campaignId: string;
			data: CreateCampaignScheduleDTO;
		}) => {
			const api = campaignsApi();
			return api.createCampaignSchedule(campaignId, data);
		},
		onSuccess: (_, { campaignId }) => {
			queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
			queryClient.invalidateQueries({
				queryKey: ['campaign-schedule-summary', campaignId],
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign schedule:', error);
		},
	});
};

export const useGetCampaignRequirements = (campaignId: string) => {
	return useQuery({
		queryKey: ['campaign-requirements', campaignId],
		queryFn: async () => {
			const api = campaignsApi();
			return api.getCampaignRequirements(campaignId);
		},
		enabled: !!campaignId,
		retry: false,
	});
};

export const useGetCampaignLiveMetrics = (
	campaignId: string,
	range: '5m' | '15m' | '1h' | 'today'
) => {
	return useQuery<
		CampaignLiveMetric,
		unknown,
		CampaignLiveMetric,
		['campaign-live-metrics', string, string]
	>({
		queryKey: ['campaign-live-metrics', campaignId, range],
		queryFn: async () => {
			const api = campaignsApi();
			return api.getLiveMetrics(campaignId, range);
		},
		enabled: !!campaignId,
		retry: false,
		refetchInterval: 5000,
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
			return api.updateCampaign(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
			}
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
		mutationFn: async ({
			campaignId,
			contactGroupId,
		}: {
			campaignId: number;
			contactGroupId: number;
		}) => {
			const api = campaignsApi();
			return api.startOutboundCampaign(campaignId, contactGroupId);
		},
		onSuccess: (_, { contactGroupId }) => {
			// Update contact group status
			queryClient.setQueryData(
				['contactGroup', contactGroupId],
				(oldData: ContactGroup | undefined) => {
					if (!oldData) return oldData;
					return { ...oldData, queueStatus: 'RUNNING' };
				}
			);
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error starting outbound campaign:', error);
		},
	});
};

export const usePauseOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			contactGroupId,
		}: {
			campaignId: number;
			contactGroupId: number;
		}) => {
			const api = campaignsApi();
			return api.pauseOutboundCampaign(campaignId, contactGroupId);
		},
		onSuccess: (_, { contactGroupId }) => {
			// Update contact group status
			queryClient.setQueryData(
				['contactGroup', contactGroupId],
				(oldData: ContactGroup | undefined) => {
					if (!oldData) return oldData;
					return { ...oldData, queueStatus: 'PAUSED' };
				}
			);
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error pausing outbound campaign:', error);
		},
	});
};

export const useResumeOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			contactGroupId,
		}: {
			campaignId: number;
			contactGroupId: number;
		}) => {
			const api = campaignsApi();
			return api.resumeOutboundCampaign(campaignId, contactGroupId);
		},
		onSuccess: (_, { contactGroupId }) => {
			// Update contact group status
			queryClient.setQueryData(
				['contactGroup', contactGroupId],
				(oldData: ContactGroup | undefined) => {
					if (!oldData) return oldData;
					return { ...oldData, queueStatus: 'RUNNING' };
				}
			);
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error resuming outbound campaign:', error);
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error cloning campaign:', error);
		},
	});
};

export const useAssignCampaignObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			objectiveId,
		}: {
			campaignId: string | number;
			objectiveId: number;
		}) => {
			const api = campaignsApi();
			return api.assignObjectiveToCampaign(campaignId, objectiveId);
		},
		onSuccess: (data) => {
			// Invalidate campaign and list queries to reflect objective assignment
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
			}
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error assigning objective to campaign:', error);
		},
	});
};

// Create campaign with agent
export const useCreateCampaignWithAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateCampaignWithAgentDTO) => {
			const api = campaignsApi();
			return api.createCampaignWithAgent(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error creating campaign with agent:', error);
		},
	});
};
