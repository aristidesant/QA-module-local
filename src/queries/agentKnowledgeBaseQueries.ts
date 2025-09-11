import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import agentKnowledgeBaseApi from '~/api/agentKnowledgeBaseApi';
import {
	AgentKnowledgeBase,
	AgentKnowledgeBaseQueryParams,
} from '~/models/AgentKnowledgeBase';

export const useGetAllAgentKnowledgeBases = () => {
	return useQuery<AgentKnowledgeBase[]>({
		queryKey: ['agent-knowledge-bases'],
		queryFn: async () => {
			const api = agentKnowledgeBaseApi();
			return api.findAllKnowledgeBases();
		},
	});
};

export const useGetAgentKnowledgeBases = (agentId: string) => {
	return useQuery<AgentKnowledgeBase[]>({
		queryKey: ['agent', agentId, 'knowledge-bases'],
		queryFn: async () => {
			const api = agentKnowledgeBaseApi();
			return api.findAgentKnowledgeBase(agentId);
		},
		enabled: !!agentId,
	});
};

export const useAssignKnowledgeBase = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: AgentKnowledgeBaseQueryParams) => {
			const api = agentKnowledgeBaseApi();
			return api.assignKnowledgeBase(data);
		},
		onSuccess: (_data, variables) => {
			// Invalidate agent-specific knowledge bases
			if (variables.agentId) {
				queryClient.invalidateQueries({
					queryKey: ['agent', variables.agentId, 'knowledge-bases'],
				});
			}
			// Invalidate all agent knowledge bases
			queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases'] });
		},
	});
};
