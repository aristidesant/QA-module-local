import { useMutation, useQuery } from '@tanstack/react-query';

import {
	bulkMarkAlertsAsRead,
	createAlert,
	getAlertStats,
	getAlerts,
	markAlertAsDismissed,
	markAlertAsRead,
} from '~/api/qa/alertsApi';
import type { AlertListQueryParams, CreateAlertPayload } from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const alertsQueryKey = ['qa', 'alerts'] as const;
export const alertsListQueryKey = (params?: AlertListQueryParams) =>
	['qa', 'alerts', 'list', params ?? {}] as const;
export const alertStatsQueryKey = (userId?: number) =>
	['qa', 'alerts', 'stats', userId] as const;

export function useAlertsQuery(params?: AlertListQueryParams) {
	return useQuery({
		queryKey: alertsListQueryKey(params),
		queryFn: () => getAlerts(params),
		staleTime: 10 * 1000, // 10 seconds - alerts are frequent
		gcTime: 1 * 60 * 1000, // 1 minute
		refetchInterval: 30 * 1000, // Poll every 30 seconds
	});
}

export function useAlertStatsQuery(userId?: number) {
	return useQuery({
		queryKey: alertStatsQueryKey(userId),
		queryFn: () => getAlertStats(userId),
		staleTime: 10 * 1000,
		gcTime: 1 * 60 * 1000,
		refetchInterval: 30 * 1000,
	});
}

export function useMarkAlertAsReadMutation() {
	return useMutation({
		mutationFn: (alertId: number) => markAlertAsRead(alertId),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: alertsQueryKey }),
				queryClient.invalidateQueries({ queryKey: alertStatsQueryKey() }),
			]);
		},
	});
}

export function useMarkAlertAsDismissedMutation() {
	return useMutation({
		mutationFn: (alertId: number) => markAlertAsDismissed(alertId),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: alertsQueryKey }),
				queryClient.invalidateQueries({ queryKey: alertStatsQueryKey() }),
			]);
		},
	});
}

export function useBulkMarkAlertsAsReadMutation() {
	return useMutation({
		mutationFn: (alertIds: number[]) => bulkMarkAlertsAsRead(alertIds),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: alertsQueryKey }),
				queryClient.invalidateQueries({ queryKey: alertStatsQueryKey() }),
			]);
		},
	});
}

export function useCreateAlertMutation() {
	return useMutation({
		mutationFn: (payload: CreateAlertPayload) => createAlert(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: alertsQueryKey });
		},
	});
}
