import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createAgent,
	createAgentUser,
	deleteAgent,
	getAgent,
	getAgents,
	updateAgent,
} from '~/api/qa/agentsApi';
import type {
	AgentListQueryParams,
	CreateAgentPayload,
	UpdateAgentPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const agentsQueryKey = ['qa', 'agents'] as const;

export const agentsListQueryKey = (params?: AgentListQueryParams) =>
	['qa', 'agents', 'list', params ?? {}] as const;

export const agentQueryKey = (agentId: number) =>
	['qa', 'agents', agentId] as const;

export function useAgentsQuery(params?: AgentListQueryParams) {
	return useQuery({
		queryKey: agentsListQueryKey(params),
		queryFn: () => getAgents(params),
	});
}

export function useAgentQuery(agentId: number) {
	return useQuery({
		enabled: Number.isFinite(agentId),
		queryKey: agentQueryKey(agentId),
		queryFn: () => getAgent(agentId),
	});
}

export function useCreateAgentMutation() {
	return useMutation({
		mutationFn: (payload: CreateAgentPayload) => createAgent(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: agentsQueryKey });
		},
	});
}

export function useUpdateAgentMutation(agentId: number) {
	return useMutation({
		mutationFn: (payload: UpdateAgentPayload) => updateAgent(agentId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: agentsQueryKey }),
				queryClient.invalidateQueries({ queryKey: agentQueryKey(agentId) }),
			]);
		},
	});
}

export function useDeleteAgentMutation() {
	return useMutation({
		mutationFn: (agentId: number) => deleteAgent(agentId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: agentsQueryKey });
		},
	});
}

export function useCreateAgentUserMutation() {
	return useMutation({
		mutationFn: (agentId: number) => createAgentUser(agentId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: agentsQueryKey });
		},
	});
}
