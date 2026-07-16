import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createAiEvaluation,
	deleteConversation,
	getConversationTranscript,
	getTranscriptionStatus,
	transcribeConversation,
} from '~/api/qa/conversationsApi';
import type {
	ConversationTranscriptProfile,
	CreateAiEvaluationPayload,
	TranscribeConversationPayload,
} from '~/models/qa';
import { campaignsQueryKey } from '~/queries/qa/campaignsQueries';
import { evaluationsQueryKey } from '~/queries/qa/evaluationsQueries';
import { queryClient } from '~/queries/queryClient';

export const transcriptionStatusQueryKey = (conversationId: number) =>
	['qa', 'conversations', conversationId, 'transcription-status'] as const;

export const conversationTranscriptQueryKey = (
	conversationId: number,
	profile: ConversationTranscriptProfile
) => ['qa', 'conversations', conversationId, 'transcript', profile] as const;

/**
 * Polls the STT job status while it is still running (PENDING/PROCESSING) and
 * stops once it reaches a terminal state (COMPLETED/FAILED).
 */
export function useTranscriptionStatusQuery(
	conversationId: number,
	enabled = true
) {
	return useQuery({
		enabled: enabled && Number.isFinite(conversationId),
		queryKey: transcriptionStatusQueryKey(conversationId),
		queryFn: () => getTranscriptionStatus(conversationId),
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === 'PENDING' || status === 'PROCESSING' ? 2000 : false;
		},
	});
}

export function useConversationTranscriptQuery(
	conversationId: number,
	profile: ConversationTranscriptProfile = 'FULL',
	enabled = true
) {
	return useQuery({
		enabled: enabled && Number.isFinite(conversationId),
		queryKey: conversationTranscriptQueryKey(conversationId, profile),
		queryFn: () => getConversationTranscript(conversationId, profile),
		retry: false,
	});
}

export function useTranscribeConversationMutation(conversationId: number) {
	return useMutation({
		mutationFn: (payload: TranscribeConversationPayload = {}) =>
			transcribeConversation(conversationId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: transcriptionStatusQueryKey(conversationId),
			});
			await queryClient.invalidateQueries({
				queryKey: ['qa', 'conversations', conversationId, 'transcript'],
			});
			await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
		},
	});
}

export function useDeleteConversationMutation() {
	return useMutation({
		mutationFn: (conversationId: number) => deleteConversation(conversationId),
		onSuccess: async () => {
			// Conversation lists are nested under the campaigns key.
			await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
		},
	});
}

export function useCreateAiEvaluationMutation(conversationId: number) {
	return useMutation({
		mutationFn: (payload: CreateAiEvaluationPayload) =>
			createAiEvaluation(conversationId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: evaluationsQueryKey });
		},
	});
}
