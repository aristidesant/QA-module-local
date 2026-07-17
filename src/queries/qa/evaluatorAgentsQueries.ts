import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createEvaluatorAgent,
	deleteEvaluatorAgent,
	getEvaluatorAgent,
	getEvaluatorAgents,
	updateEvaluatorAgent,
} from '~/api/qa/evaluatorAgentsApi';
import type {
	CreateEvaluatorAgentPayload,
	EvaluatorAgentListQueryParams,
	UpdateEvaluatorAgentPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const evaluatorAgentsQueryKey = ['qa', 'evaluator-agents'] as const;

export const evaluatorAgentsListQueryKey = (
	params?: EvaluatorAgentListQueryParams
) => ['qa', 'evaluator-agents', 'list', params ?? {}] as const;

export const evaluatorAgentQueryKey = (evaluatorAgentId: number) =>
	['qa', 'evaluator-agents', evaluatorAgentId] as const;

export function useEvaluatorAgentsQuery(
	params?: EvaluatorAgentListQueryParams,
	enabled = true
) {
	return useQuery({
		enabled,
		queryKey: evaluatorAgentsListQueryKey(params),
		queryFn: () => getEvaluatorAgents(params),
	});
}

export function useEvaluatorAgentQuery(evaluatorAgentId: number) {
	return useQuery({
		enabled: Number.isFinite(evaluatorAgentId),
		queryKey: evaluatorAgentQueryKey(evaluatorAgentId),
		queryFn: () => getEvaluatorAgent(evaluatorAgentId),
	});
}

export function useCreateEvaluatorAgentMutation() {
	return useMutation({
		mutationFn: (payload: CreateEvaluatorAgentPayload) =>
			createEvaluatorAgent(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: evaluatorAgentsQueryKey,
			});
		},
	});
}

export function useUpdateEvaluatorAgentMutation(evaluatorAgentId: number) {
	return useMutation({
		mutationFn: (payload: UpdateEvaluatorAgentPayload) =>
			updateEvaluatorAgent(evaluatorAgentId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: evaluatorAgentsQueryKey }),
				queryClient.invalidateQueries({
					queryKey: evaluatorAgentQueryKey(evaluatorAgentId),
				}),
			]);
		},
	});
}

export function useDeleteEvaluatorAgentMutation() {
	return useMutation({
		mutationFn: (evaluatorAgentId: number) =>
			deleteEvaluatorAgent(evaluatorAgentId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: evaluatorAgentsQueryKey,
			});
		},
	});
}
