import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createAlertConfiguration,
	deleteAlertConfiguration,
	getAlertConfigurationDetail,
	getAlertConfigurations,
	updateAlertConfiguration,
} from '~/api/qa/alertConfigurationsApi';
import type {
	AlertConfigurationListQueryParams,
	CreateAlertConfigurationPayload,
	UpdateAlertConfigurationPayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const alertConfigurationsQueryKey = ['qa', 'alertConfigurations'] as const;
export const alertConfigurationsListQueryKey = (params?: AlertConfigurationListQueryParams) =>
	['qa', 'alertConfigurations', 'list', params ?? {}] as const;
export const alertConfigurationQueryKey = (configId: number) =>
	['qa', 'alertConfigurations', configId] as const;

export function useAlertConfigurationsQuery(params?: AlertConfigurationListQueryParams) {
	return useQuery({
		queryKey: alertConfigurationsListQueryKey(params),
		queryFn: () => getAlertConfigurations(params),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useAlertConfigurationDetailQuery(configId: number) {
	return useQuery({
		enabled: Number.isFinite(configId),
		queryKey: alertConfigurationQueryKey(configId),
		queryFn: () => getAlertConfigurationDetail(configId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateAlertConfigurationMutation() {
	return useMutation({
		mutationFn: (payload: CreateAlertConfigurationPayload) =>
			createAlertConfiguration(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: alertConfigurationsQueryKey,
			});
		},
	});
}

export function useUpdateAlertConfigurationMutation(configId: number) {
	return useMutation({
		mutationFn: (payload: UpdateAlertConfigurationPayload) =>
			updateAlertConfiguration(configId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: alertConfigurationQueryKey(configId),
				}),
				queryClient.invalidateQueries({
					queryKey: alertConfigurationsQueryKey,
				}),
			]);
		},
	});
}

export function useDeleteAlertConfigurationMutation(configId: number) {
	return useMutation({
		mutationFn: () => deleteAlertConfiguration(configId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: alertConfigurationsQueryKey,
			});
		},
	});
}
