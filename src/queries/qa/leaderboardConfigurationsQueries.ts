import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createLeaderboardConfiguration,
	getLeaderboardConfiguration,
	getLeaderboardPositions,
	updateLeaderboardConfiguration,
} from '~/api/qa/leaderboardConfigurationsApi';
import type {
	CreateLeaderboardConfigurationPayload,
	LeaderboardConfigurationListQueryParams,
	UpdateLeaderboardConfigurationPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const leaderboardConfigurationsQueryKey = ['qa', 'leaderboards'] as const;
export const leaderboardConfigurationsListQueryKey = (params?: LeaderboardConfigurationListQueryParams) =>
	['qa', 'leaderboards', 'list', params ?? {}] as const;
export const leaderboardConfigurationQueryKey = (supervisorId: number) =>
	['qa', 'leaderboards', supervisorId] as const;
export const leaderboardPositionsQueryKey = (supervisorId: number) =>
	['qa', 'leaderboards', supervisorId, 'positions'] as const;

export function useLeaderboardConfigurationQuery(supervisorId: number) {
	return useQuery({
		enabled: Number.isFinite(supervisorId),
		queryKey: leaderboardConfigurationQueryKey(supervisorId),
		queryFn: () => getLeaderboardConfiguration(supervisorId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useLeaderboardPositionsQuery(supervisorId: number) {
	return useQuery({
		enabled: Number.isFinite(supervisorId),
		queryKey: leaderboardPositionsQueryKey(supervisorId),
		queryFn: () => getLeaderboardPositions(supervisorId),
		staleTime: 10 * 1000,
		gcTime: 1 * 60 * 1000,
		refetchInterval: 30 * 1000,
	});
}

export function useCreateLeaderboardConfigurationMutation() {
	return useMutation({
		mutationFn: (payload: CreateLeaderboardConfigurationPayload) =>
			createLeaderboardConfiguration(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: leaderboardConfigurationsQueryKey,
			});
		},
	});
}

export function useUpdateLeaderboardConfigurationMutation(id: number) {
	return useMutation({
		mutationFn: (payload: UpdateLeaderboardConfigurationPayload) =>
			updateLeaderboardConfiguration(id, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: leaderboardConfigurationsQueryKey,
			});
		},
	});
}
