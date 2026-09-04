import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createCallMarker,
	getCallMarkers,
	updateCallMarker,
} from '~/api/qa/callMarkersApi';
import type {
	CallMarkerListQueryParams,
	CreateCallMarkerPayload,
	UpdateCallMarkerPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const callMarkersQueryKey = ['qa', 'callMarkers'] as const;
export const callMarkersListQueryKey = (params?: CallMarkerListQueryParams) =>
	['qa', 'callMarkers', 'list', params ?? {}] as const;
export const evaluationMarkersQueryKey = (evaluationId: number) =>
	['qa', 'callMarkers', 'evaluation', evaluationId] as const;

export function useCallMarkersQuery(params?: CallMarkerListQueryParams) {
	return useQuery({
		queryKey: callMarkersListQueryKey(params),
		queryFn: () => getCallMarkers(params),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateCallMarkerMutation() {
	return useMutation({
		mutationFn: (payload: CreateCallMarkerPayload) => createCallMarker(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: callMarkersQueryKey });
		},
	});
}

export function useUpdateCallMarkerMutation(markerId: number) {
	return useMutation({
		mutationFn: (payload: UpdateCallMarkerPayload) =>
			updateCallMarker(markerId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: callMarkersQueryKey });
		},
	});
}
