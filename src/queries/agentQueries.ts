import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agentApi, {
	FindAllAgentsResponse,
	DuplicateAgentDto,
} from '~/api/agentApi';
import type { AgentUpdateModel } from '~/models/AgentListObject';
import type { Campaign } from '~/models/CampaignsModel';

// Create agent
export const useCreateAgent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (agent: any) => {
			const api = agentApi();
			return api.createAgent(agent);
		},
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: ['agents'] });
		},
		onError: (error) => {
			console.error('Error creating agent:', error);
		},
	});
};

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
			console.error('Error duplicating agent:', error);
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
			console.error('Error updating agent:', error);
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
			console.error('Error deleting agent:', error);
		},
	});
};
