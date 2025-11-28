import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dispositionFlowApi, {
	type CampaignWithDispositionFlow,
	type CopyDispositionFlowPayload,
	type CopyDispositionFlowResponse,
} from '~/api/dispositionFlowApi';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';

/**
 * Hook to fetch all disposition flows
 * @returns Query result containing an array of DispositionFlowModel objects
 */
export function useDispositionFlows() {
	return useQuery<DispositionFlowModel[], Error>({
		queryKey: ['dispositionFlows'],
		queryFn: async () => {
			const api = dispositionFlowApi();
			return api.getAllDispositionFlows();
		},
		enabled: true,
	});
}

/**
 * Hook to fetch a disposition flow by ID
 * @param id - The disposition flow ID to fetch
 * @returns Query result containing a DispositionFlowModel object
 */
export function useDispositionFlow(id?: string | number) {
	return useQuery<DispositionFlowModel, Error>({
		queryKey: ['dispositionFlow', id],
		queryFn: async () => {
			if (!id) {
				throw new Error('Outcome flow ID is required');
			}
			const api = dispositionFlowApi();
			return api.getDispositionFlowById(id);
		},
		enabled: !!id,
	});
}

/**
 * Hook to fetch disposition flows by campaign ID (query parameter)
 * @param campaignId - The campaign ID to fetch disposition flows for
 * @returns Query result containing an array of DispositionFlowModel objects
 */
export function useDispositionFlowsByCampaign(campaignId?: string | number) {
	return useQuery<DispositionFlowModel[], Error>({
		queryKey: ['dispositionFlows', 'campaign', campaignId],
		queryFn: async () => {
			if (!campaignId) {
				throw new Error('Campaign ID is required');
			}
			const api = dispositionFlowApi();
			return api.getDispositionFlowsByCampaign(campaignId);
		},
		enabled: !!campaignId,
	});
}

/**
 * Hook to fetch disposition flows by campaign ID (path parameter)
 * @param campaignId - The campaign ID to fetch disposition flows for
 * @returns Query result containing an array of DispositionFlowModel objects
 */
export function useDispositionFlowsByCampaignPath(
	campaignId?: string | number
) {
	return useQuery<DispositionFlowModel, Error>({
		queryKey: ['dispositionFlows', 'campaignPath', campaignId],
		queryFn: async () => {
			if (!campaignId) {
				throw new Error('Campaign ID is required');
			}
			const api = dispositionFlowApi();
			return api.getDispositionFlowsByCampaignPath(campaignId);
		},
		enabled: !!campaignId,
	});
}

/**
 * Hook to fetch disposition flows by user ID
 * @param userId - The user ID to fetch disposition flows for
 * @returns Query result containing an array of DispositionFlowModel objects
 */
export function useDispositionFlowsByUser(userId?: string | number) {
	return useQuery<DispositionFlowModel[], Error>({
		queryKey: ['dispositionFlows', 'user', userId],
		queryFn: async () => {
			if (!userId) {
				throw new Error('User ID is required');
			}
			const api = dispositionFlowApi();
			return api.getDispositionFlowsByUser(userId);
		},
		enabled: !!userId,
	});
}

/**
 * Hook to fetch all campaigns that have a disposition flow
 * @param enabled - Whether to enable the query (defaults to true)
 * @returns Query result containing an array of CampaignWithDispositionFlow objects
 */
export function useCampaignsWithDispositionFlow(enabled = true) {
	return useQuery<CampaignWithDispositionFlow[], Error>({
		queryKey: ['campaignsWithDispositionFlow'],
		queryFn: async () => {
			const api = dispositionFlowApi();
			return api.getCampaignsWithDispositionFlow();
		},
		enabled,
	});
}

/**
 * Mutation hook to create a new disposition flow
 * @returns Mutation object with methods to create a disposition flow
 */
export function useCreateDispositionFlow() {
	const queryClient = useQueryClient();
	return useMutation<
		DispositionFlowModel,
		Error,
		Partial<DispositionFlowModel>
	>({
		mutationFn: async (data) => {
			const api = dispositionFlowApi();
			return api.createDispositionFlow(data);
		},
		onSuccess: (data) => {
			// Invalidate all disposition flows queries
			queryClient.invalidateQueries({ queryKey: ['dispositionFlows'] });
			// Invalidate campaign-specific queries if campaignId is present
			if (data.campaignId) {
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaign', data.campaignId],
				});
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaignPath', data.campaignId],
				});
			}
			// Invalidate user-specific queries if userId is present
			if (data.userId) {
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'user', data.userId],
				});
			}
		},
	});
}

/**
 * Mutation hook to update a disposition flow
 * @returns Mutation object with methods to update a disposition flow
 */
export function useUpdateDispositionFlow() {
	const queryClient = useQueryClient();
	return useMutation<
		DispositionFlowModel,
		Error,
		{ id: string | number; data: Partial<DispositionFlowModel> }
	>({
		mutationFn: async ({ id, data }) => {
			const api = dispositionFlowApi();
			return api.updateDispositionFlow(id, data);
		},
		onSuccess: (data, variables) => {
			// Invalidate the specific disposition flow query
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlow', variables.id],
			});
			// Invalidate all disposition flows queries
			queryClient.invalidateQueries({ queryKey: ['dispositionFlows'] });
			// Invalidate campaign-specific queries if campaignId is present
			if (data.campaignId) {
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaign', data.campaignId],
				});
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaignPath', data.campaignId],
				});
			}
			// Invalidate user-specific queries if userId is present
			if (data.userId) {
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'user', data.userId],
				});
			}
		},
	});
}

/**
 * Mutation hook to delete a disposition flow
 * @returns Mutation object with methods to delete a disposition flow
 */
export function useDeleteDispositionFlow() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, string | number>({
		mutationFn: async (id) => {
			const api = dispositionFlowApi();
			return api.deleteDispositionFlow(id);
		},
		onSuccess: (_, variables) => {
			// Remove the specific disposition flow from cache
			queryClient.removeQueries({
				queryKey: ['dispositionFlow', variables],
			});
			// Invalidate all disposition flows queries
			queryClient.invalidateQueries({ queryKey: ['dispositionFlows'] });
		},
	});
}

/**
 * Mutation hook to copy a disposition flow to a new campaign
 * @returns Mutation object with methods to copy a disposition flow
 */
export function useCopyDispositionFlow() {
	const queryClient = useQueryClient();
	return useMutation<
		CopyDispositionFlowResponse,
		Error,
		CopyDispositionFlowPayload
	>({
		mutationFn: async (data) => {
			const api = dispositionFlowApi();
			return api.copyToCampaign(data);
		},
		onSuccess: (data) => {
			// Invalidate disposition flows queries
			queryClient.invalidateQueries({ queryKey: ['dispositionFlows'] });
			queryClient.invalidateQueries({
				queryKey: ['campaignsWithDispositionFlow'],
			});
			// Invalidate campaign-specific queries
			if (data.campaign?.id) {
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaign', data.campaign.id],
				});
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaignPath', data.campaign.id],
				});
			}
		},
	});
}
