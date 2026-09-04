import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createSupervisor,
	deleteSupervisor,
	getSupervisorDetail,
	getSupervisorTeam,
	getSupervisors,
	updateSupervisor,
} from '~/api/qa/supervisorsApi';
import type {
	CreateSupervisorPayload,
	SupervisorListQueryParams,
	UpdateSupervisorPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const supervisorsQueryKey = ['qa', 'supervisors'] as const;
export const supervisorsListQueryKey = (params?: SupervisorListQueryParams) =>
	['qa', 'supervisors', 'list', params ?? {}] as const;
export const supervisorQueryKey = (supervisorId: number) =>
	['qa', 'supervisors', supervisorId] as const;
export const supervisorTeamQueryKey = (supervisorId: number) =>
	['qa', 'supervisors', supervisorId, 'team'] as const;

export function useSupervisorsQuery(params?: SupervisorListQueryParams) {
	return useQuery({
		queryKey: supervisorsListQueryKey(params),
		queryFn: () => getSupervisors(params),
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useSupervisorDetailQuery(supervisorId: number) {
	return useQuery({
		enabled: Number.isFinite(supervisorId),
		queryKey: supervisorQueryKey(supervisorId),
		queryFn: () => getSupervisorDetail(supervisorId),
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useSupervisorTeamQuery(supervisorId: number) {
	return useQuery({
		enabled: Number.isFinite(supervisorId),
		queryKey: supervisorTeamQueryKey(supervisorId),
		queryFn: () => getSupervisorTeam(supervisorId),
		staleTime: 2 * 60 * 1000, // 2 minutes (team changes less frequently)
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateSupervisorMutation() {
	return useMutation({
		mutationFn: (payload: CreateSupervisorPayload) => createSupervisor(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: supervisorsQueryKey,
			});
		},
	});
}

export function useUpdateSupervisorMutation(supervisorId: number) {
	return useMutation({
		mutationFn: (payload: UpdateSupervisorPayload) =>
			updateSupervisor(supervisorId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: supervisorQueryKey(supervisorId),
				}),
				queryClient.invalidateQueries({
					queryKey: supervisorsQueryKey,
				}),
			]);
		},
	});
}

export function useDeleteSupervisorMutation(supervisorId: number) {
	return useMutation({
		mutationFn: () => deleteSupervisor(supervisorId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: supervisorsQueryKey,
			});
		},
	});
}
