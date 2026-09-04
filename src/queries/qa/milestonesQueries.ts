import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createMilestone,
	createMilestoneAchievement,
	deleteMilestone,
	getMilestoneAchievements,
	getMilestoneDetail,
	getMilestones,
	updateMilestone,
} from '~/api/qa/milestonesApi';
import type {
	CreateMilestoneAchievementPayload,
	CreateMilestonePayload,
	MilestoneListQueryParams,
	UpdateMilestonePayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const milestonesQueryKey = ['qa', 'milestones'] as const;
export const milestonesListQueryKey = (params?: MilestoneListQueryParams) =>
	['qa', 'milestones', 'list', params ?? {}] as const;
export const milestoneQueryKey = (milestoneId: number) =>
	['qa', 'milestones', milestoneId] as const;
export const milestoneAchievementsQueryKey = (milestoneId: number) =>
	['qa', 'milestones', milestoneId, 'achievements'] as const;

export function useMilestonesQuery(params?: MilestoneListQueryParams) {
	return useQuery({
		queryKey: milestonesListQueryKey(params),
		queryFn: () => getMilestones(params),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useMilestoneDetailQuery(milestoneId: number) {
	return useQuery({
		enabled: Number.isFinite(milestoneId),
		queryKey: milestoneQueryKey(milestoneId),
		queryFn: () => getMilestoneDetail(milestoneId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useMilestoneAchievementsQuery(milestoneId: number) {
	return useQuery({
		enabled: Number.isFinite(milestoneId),
		queryKey: milestoneAchievementsQueryKey(milestoneId),
		queryFn: () => getMilestoneAchievements(milestoneId),
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useCreateMilestoneMutation() {
	return useMutation({
		mutationFn: (payload: CreateMilestonePayload) => createMilestone(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: milestonesQueryKey });
		},
	});
}

export function useUpdateMilestoneMutation(milestoneId: number) {
	return useMutation({
		mutationFn: (payload: UpdateMilestonePayload) =>
			updateMilestone(milestoneId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: milestoneQueryKey(milestoneId),
				}),
				queryClient.invalidateQueries({ queryKey: milestonesQueryKey }),
			]);
		},
	});
}

export function useDeleteMilestoneMutation(milestoneId: number) {
	return useMutation({
		mutationFn: () => deleteMilestone(milestoneId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: milestonesQueryKey });
		},
	});
}

export function useCreateMilestoneAchievementMutation(milestoneId: number) {
	return useMutation({
		mutationFn: (payload: CreateMilestoneAchievementPayload) =>
			createMilestoneAchievement(milestoneId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: milestoneAchievementsQueryKey(milestoneId),
				}),
				queryClient.invalidateQueries({ queryKey: milestonesQueryKey }),
			]);
		},
	});
}
