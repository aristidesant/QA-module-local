import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createEvaluationDispute,
	getDispute,
	getDisputes,
	getEvaluationDisputes,
} from '~/api/qa/disputesApi';
import type {
	CreateEvaluationDisputePayload,
	EvaluationDisputeListQueryParams,
} from '~/models/qa';
import {
	evaluationQueryKey,
	evaluationsQueryKey,
} from '~/queries/qa/evaluationsQueries';
import { queryClient } from '~/queries/queryClient';

export const disputesQueryKey = ['qa', 'disputes'] as const;

export const disputesListQueryKey = (
	params?: EvaluationDisputeListQueryParams
) => ['qa', 'disputes', 'list', params ?? {}] as const;

export const disputeQueryKey = (disputeId: number) =>
	['qa', 'disputes', disputeId] as const;

export const evaluationDisputesQueryKey = (evaluationId: number) =>
	['qa', 'evaluations', evaluationId, 'disputes'] as const;

export function useEvaluationDisputesQuery(
	evaluationId: number,
	enabled = true
) {
	return useQuery({
		enabled: enabled && Number.isFinite(evaluationId),
		queryKey: evaluationDisputesQueryKey(evaluationId),
		queryFn: () => getEvaluationDisputes(evaluationId),
	});
}

export function useDisputesQuery(
	params?: EvaluationDisputeListQueryParams,
	enabled = true
) {
	return useQuery({
		enabled,
		queryKey: disputesListQueryKey(params),
		queryFn: () => getDisputes(params),
	});
}

export function useDisputeQuery(disputeId: number) {
	return useQuery({
		enabled: Number.isFinite(disputeId),
		queryKey: disputeQueryKey(disputeId),
		queryFn: () => getDispute(disputeId),
	});
}

export function useCreateEvaluationDisputeMutation(evaluationId: number) {
	return useMutation({
		mutationFn: (payload: CreateEvaluationDisputePayload) =>
			createEvaluationDispute(evaluationId, payload),
		onSuccess: async (dispute) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: evaluationsQueryKey }),
				queryClient.invalidateQueries({ queryKey: disputesQueryKey }),
				queryClient.invalidateQueries({
					queryKey: evaluationQueryKey(evaluationId),
				}),
				queryClient.invalidateQueries({
					queryKey: evaluationQueryKey(dispute.resultingEvaluationId),
				}),
				queryClient.invalidateQueries({
					queryKey: evaluationDisputesQueryKey(evaluationId),
				}),
			]);
		},
	});
}
