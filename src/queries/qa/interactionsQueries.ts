import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createInteraction,
	getAgentInteractionSummary,
	getInteractions,
} from '~/api/qa/interactionsApi';
import type { CreateInteractionPayload, InteractionListQueryParams } from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const interactionsQueryKey = ['qa', 'interactions'] as const;
export const interactionsListQueryKey = (params?: InteractionListQueryParams) =>
	['qa', 'interactions', 'list', params ?? {}] as const;
export const agentInteractionSummaryQueryKey = (agentId: number) =>
	['qa', 'interactions', 'summary', agentId] as const;

export function useInteractionsQuery(params?: InteractionListQueryParams) {
	return useQuery({
		queryKey: interactionsListQueryKey(params),
		queryFn: () => getInteractions(params),
		staleTime: 30 * 1000,
		gcTime: 2 * 60 * 1000,
	});
}

export function useAgentInteractionSummaryQuery(agentId: number) {
	return useQuery({
		enabled: Number.isFinite(agentId),
		queryKey: agentInteractionSummaryQueryKey(agentId),
		queryFn: () => getAgentInteractionSummary(agentId),
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useCreateInteractionMutation() {
	return useMutation({
		mutationFn: (payload: CreateInteractionPayload) => createInteraction(payload),
		onSuccess: async (interaction) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: interactionsQueryKey }),
				interaction.recipientAgentId
					? queryClient.invalidateQueries({
							queryKey: agentInteractionSummaryQueryKey(interaction.recipientAgentId),
						})
					: Promise.resolve(),
			]);
		},
	});
}
