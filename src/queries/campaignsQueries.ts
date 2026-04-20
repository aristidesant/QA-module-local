import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import campaignsApi, {
	type CreateCampaignWithAgentDTO,
	type CreateCampaignScheduleDTO,
	type ResumeOutboundCampaignPayload,
	type SetDraftDto,
	type ToggleCampaignAction,
} from '~/api/campaignsApi';
import type { Campaign } from '~/models/CampaignsModel';
import type { CampaignLiveMetric } from '~/models/CampaignLiveMetricModel';

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
			void error;
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
		placeholderData: keepPreviousData,
		retry: false,
	});
};

// Get campaign by id
export const useGetCampaign = (
	id: string,
	options?: Omit<
		UseQueryOptions<Campaign, unknown, Campaign, ['campaign', string]>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<Campaign, unknown, Campaign, ['campaign', string]>({
		queryKey: ['campaign', id],
		queryFn: async () => {
			const api = campaignsApi();
			return api.findCampaign(id);
		},
		enabled: options?.enabled ?? !!id,
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
			void error;
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
			void error;
		},
	});
};

// Update campaign (light version - excludes agentConfig)
export const useUpdateCampaignLight = () => {
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
			return api.updateCampaignLight(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
			}
		},
		onError: (error) => {
			void error;
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
		onSuccess: (_, { campaignId, contactGroupId }) => {
			queryClient.invalidateQueries({
				queryKey: ['contactGroup', contactGroupId],
			});
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign', String(campaignId)],
			});
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
		onSuccess: (_, { campaignId, contactGroupId }) => {
			queryClient.invalidateQueries({
				queryKey: ['contactGroup', contactGroupId],
			});
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign', String(campaignId)],
			});
		},
		onError: (error) => {
			void error;
		},
	});
};

export const useResumeOutboundCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			contactGroupId,
			ignoreWaveDelay,
		}: ResumeOutboundCampaignPayload) => {
			const api = campaignsApi();
			return api.resumeOutboundCampaign({
				campaignId,
				contactGroupId,
				ignoreWaveDelay,
			});
		},
		onSuccess: (_, { campaignId, contactGroupId }) => {
			queryClient.invalidateQueries({
				queryKey: ['contactGroup', contactGroupId],
			});
			queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
			queryClient.invalidateQueries({
				queryKey: ['campaign', String(campaignId)],
			});
		},
		onError: (error) => {
			void error;
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
			void error;
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
			void error;
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
			void error;
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
			void error;
		},
	});
};

// Set campaign draft status
export const useSetCampaignDraft = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			data,
		}: {
			campaignId: string;
			data: SetDraftDto;
		}) => {
			const api = campaignsApi();
			return api.setDraft(campaignId, data);
		},
		onSuccess: (updatedCampaign) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (updatedCampaign?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaign', String(updatedCampaign.id)],
				});
			}
		},
		onError: (error) => {
			void error;
		},
	});
};

// Sync campaign by agent
export const useSyncCampaignByAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (agentId: string) => {
			const api = campaignsApi();
			return api.syncByAgent(agentId);
		},
		onSuccess: (updatedCampaign) => {
			if (updatedCampaign?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaign', String(updatedCampaign.id)],
				});
			}
		},
		onError: (error) => {
			void error;
		},
	});
};

// Toggle campaign status (activate/inactive)
export const useToggleCampaignStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			action,
		}: {
			campaignId: number;
			action: ToggleCampaignAction;
		}) => {
			const api = campaignsApi();
			return api.toggleCampaignStatus(campaignId, action);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			if (data?.campaign?.id) {
				queryClient.invalidateQueries({
					queryKey: ['campaign', String(data.campaign.id)],
				});
			}
		},
		onError: (error) => {
			void error;
		},
	});
};
