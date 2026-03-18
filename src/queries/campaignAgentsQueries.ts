import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignAgentsApi from '~/api/campaignAgentsApi';
import type { CampaignAgent } from '~/models/CampaignAgentModel';

// filepath: src/modules/campaign_agents/queries/campaignAgentsQueries.ts

// Create campaign agent (assign agent to campaign)
export const useCreateCampaignAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		// Expects: { campaignId, agentData }
		mutationFn: async ({
			campaignId,
			agentId,
		}: {
			campaignId: number;
			agentId: string;
		}) => {
			const api = campaignAgentsApi();
			return api.assignAgentToCampaign(campaignId, agentId);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['campaignAgents'] });
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get all agents for a campaign
export const useGetCampaignAgents = (campaignId: number) => {
	return useQuery({
		queryKey: ['campaignAgents', campaignId],
		queryFn: async () => {
			const api = campaignAgentsApi();
			return api.getCampaignAgents(campaignId);
		},
		enabled: !!campaignId,
	});
};

// Get a single agent by id for a campaign
export const useGetCampaignAgent = (campaignId: number, id: number) => {
	return useQuery({
		queryKey: ['campaignAgent', campaignId, id],
		queryFn: async () => {
			const api = campaignAgentsApi();
			return api.getCampaignAgentById(campaignId, id);
		},
		enabled: !!campaignId && !!id,
	});
};

// Update campaign agent in a campaign
export const useUpdateCampaignAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		// Expects: { campaignId, id, updateData }
		mutationFn: async ({
			campaignId,
			id,
			updateData,
		}: {
			campaignId: number;
			id: number;
			updateData: Partial<
				Omit<CampaignAgent, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>
			>;
		}) => {
			const api = campaignAgentsApi();
			return api.updateCampaignAgent(campaignId, id, updateData);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['campaignAgents', data?.campaignId],
			});
			if (data?.id && data?.campaignId) {
				queryClient.invalidateQueries({
					queryKey: ['campaignAgent', data.campaignId, data.id],
				});
			}
			void data;
		},
		onError: (error) => {
			void error;
		},
	});
};

// Remove agent from campaign
export const useDeleteCampaignAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		// Expects: { campaignId, id }
		mutationFn: async ({
			campaignId,
			id,
		}: {
			campaignId: number;
			id: number;
		}) => {
			const api = campaignAgentsApi();
			return api.removeAgentFromCampaign(campaignId, id);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['campaignAgents', variables.campaignId],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaignAgent', variables.campaignId, variables.id],
			});
			void variables;
		},
		onError: (error) => {
			void error;
		},
	});
};
