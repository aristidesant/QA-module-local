import { useMutation, useQuery } from '@tanstack/react-query';

import {
	completeEvaluation,
	createEvaluation,
	deleteEvaluation,
	getEvaluations,
	getEvaluationDetail,
	saveEvaluationAnswer,
} from '~/api/qa/evaluationsApi';
import type {
	CreateEvaluationAnswerPayload,
	CreateEvaluationPayload,
	EvaluationListQueryParams,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const evaluationsQueryKey = ['qa', 'evaluations'] as const;

export const evaluationsListQueryKey = (params?: EvaluationListQueryParams) =>
	['qa', 'evaluations', 'list', params ?? {}] as const;

export const evaluationQueryKey = (evaluationId: number) =>
	['qa', 'evaluations', evaluationId] as const;

export function useEvaluationDetailQuery(evaluationId: number) {
	return useQuery({
		enabled: Number.isFinite(evaluationId),
		queryKey: evaluationQueryKey(evaluationId),
		queryFn: () => getEvaluationDetail(evaluationId),
		// Poll while an AI evaluation is still running so results appear live.
		refetchInterval: (query) => {
			const status = query.state.data?.aiEvaluationStatus;
			return status === 'PENDING' || status === 'PROCESSING' ? 2500 : false;
		},
	});
}

export function useCreateEvaluationMutation() {
	return useMutation({
		mutationFn: (payload: CreateEvaluationPayload) => createEvaluation(payload),
		onSuccess: async (evaluation) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: evaluationsQueryKey }),
				queryClient.invalidateQueries({
					queryKey: evaluationQueryKey(evaluation.id),
				}),
			]);
		},
	});
}

export function useDeleteEvaluationMutation() {
	return useMutation({
		mutationFn: (evaluationId: number) => deleteEvaluation(evaluationId),
		onSuccess: async () => {
			// Invalidate only the list queries — not the single-evaluation detail
			// key — so the detail page a delete may originate from does not refetch a
			// now-tombstoned evaluation and log a 404.
			await queryClient.invalidateQueries({
				queryKey: [...evaluationsQueryKey, 'list'],
			});
		},
	});
}

export function useSaveEvaluationAnswerMutation(evaluationId: number) {
	return useMutation({
		mutationFn: (payload: CreateEvaluationAnswerPayload) =>
			saveEvaluationAnswer(evaluationId, payload),
		onSuccess: () =>
			queryClient.refetchQueries({
				queryKey: evaluationQueryKey(evaluationId),
				type: 'active',
			}),
	});
}

export function useCompleteEvaluationMutation(evaluationId: number) {
	return useMutation({
		mutationFn: () => completeEvaluation(evaluationId),
		onSuccess: () =>
			queryClient.refetchQueries({
				queryKey: evaluationQueryKey(evaluationId),
				type: 'active',
			}),
	});
}

export function useEvaluationsQuery(
	params?: EvaluationListQueryParams,
	enabled = true
) {
	return useQuery({
		enabled:
			enabled &&
			(params?.agentId === undefined || Number.isFinite(params.agentId)),
		queryKey: evaluationsListQueryKey(params),
		queryFn: () => getEvaluations(params),
	});
}
