import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agentApi, {
	FindAllAgentsResponse,
	DuplicateAgentDto,
	AgentsWithCampaignsResponse,
} from '~/api/agentApi';
import type {
	AgentUpdateModel,
	AgentWithCampaignsQueryParams,
} from '~/models/AgentListObject';
import type { Campaign } from '~/models/CampaignsModel';

// Duplicate agent
export const useDuplicateAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			agentId,
			data,
		}: {
			agentId: string;
			data: DuplicateAgentDto;
		}) => {
			const api = agentApi();
			return api.duplicateAgent(agentId, data);
		},
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: ['agents'] });
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get all agents
export const useGetAllAgents = (params?: Record<string, unknown>) => {
	return useQuery<FindAllAgentsResponse>({
		queryKey: ['agents', params],
		queryFn: async () => {
			const api = agentApi();
			return api.findAllAgents(params);
		},
	});
};

// Get agents with campaigns
export const useAgentsWithCampaigns = (
	params?: AgentWithCampaignsQueryParams,
	enabled = true
) => {
	return useQuery<AgentsWithCampaignsResponse>({
		queryKey: ['agents', 'with-campaigns', params],
		queryFn: async () => {
			const api = agentApi();
			return api.findAgentsWithCampaigns(params);
		},
		enabled,
	});
};

// Get one agent by id
export const useGetAgent = (id: string) => {
	return useQuery({
		queryKey: ['agent', id],
		queryFn: async () => {
			const api = agentApi();
			return api.findAgent(id);
		},
		enabled: !!id,
	});
};

// Get agent campaigns
export const useGetAgentCampaigns = (agentId: string) => {
	return useQuery<Campaign[]>({
		queryKey: ['agent', agentId, 'campaigns'],
		queryFn: async () => {
			const api = agentApi();
			return api.getAgentCampaigns(agentId);
		},
		enabled: !!agentId,
		retry: false,
	});
};

// Update agent
export const useUpdateAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<AgentUpdateModel>;
		}) => {
			const api = agentApi();
			return api.updateAgent(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['agents'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['agent', data.id] });
			}
		},
		onError: (error) => {
			void error;
		},
	});
};

// Delete agent
export const useDeleteAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const api = agentApi();
			return api.deleteAgent(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['agents'] });
			queryClient.invalidateQueries({ queryKey: ['agent', id] });
		},
		onError: (error) => {
			void error;
		},
	});
};
