import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import outboundApi, {
	type CleanOutboundQueuePayload,
	type GetOutboundCallTasksParams,
} from '~/api/outboundApi';
import type {
	ReorderTasksPayload,
	BulkTaskActionPayload,
} from '~/models/ContactsModel';

export const outboundTaskKeys = {
	all: ['outbound-call-tasks'] as const,
	list: (params: GetOutboundCallTasksParams) =>
		['outbound-call-tasks', 'list', params] as const,
	sortFields: (campaignId: number, contactGroupId?: number) =>
		['outbound-call-tasks', 'sort-fields', campaignId, contactGroupId] as const,
	queueProgress: (contactGroupId: number, campaignId: number) =>
		[
			'outbound-call-tasks',
			'queue-progress',
			contactGroupId,
			campaignId,
		] as const,
};

export const useGetOutboundCallTasks = (
	params: GetOutboundCallTasksParams,
	enabled = true
) => {
	return useQuery({
		queryKey: outboundTaskKeys.list(params),
		queryFn: () => outboundApi().getOutboundCallTasks(params),
		enabled,
	});
};

export const useGetOutboundTaskSortFields = (
	campaignId: number,
	contactGroupId?: number,
	enabled = true
) => {
	return useQuery({
		queryKey: outboundTaskKeys.sortFields(campaignId, contactGroupId),
		queryFn: () => outboundApi().getSortFields(campaignId, contactGroupId),
		enabled: enabled && campaignId > 0,
	});
};

export const useGetQueueProgress = (
	contactGroupId: number,
	campaignId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: outboundTaskKeys.queueProgress(contactGroupId, campaignId),
		queryFn: () => outboundApi().getQueueProgress(contactGroupId, campaignId),
		enabled: enabled && contactGroupId > 0 && campaignId > 0,
		refetchInterval: 30_000,
	});
};

export const useReorderOutboundTasks = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ReorderTasksPayload) =>
			outboundApi().reorderTasks(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const usePauseOutboundTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) =>
			outboundApi().pauseTask(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const useResumeOutboundTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => outboundApi().resumeTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const useCancelOutboundTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => outboundApi().cancelTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const useRetryOutboundTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, scheduledAt }: { id: number; scheduledAt?: string }) =>
			outboundApi().retryTask(id, scheduledAt),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const useBulkOutboundTaskAction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: BulkTaskActionPayload) =>
			outboundApi().bulkAction(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: outboundTaskKeys.all,
			});
		},
	});
};

export const useCleanOutboundQueue = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			campaignId,
			contactGroupId,
		}: CleanOutboundQueuePayload) => {
			const api = outboundApi();
			return api.cleanOutboundQueue({ campaignId, contactGroupId });
		},
		onSuccess: (_, variables) => {
			notifications.show({
				title: 'Campaign restarted',
				message: 'Outbound queue cleared successfully.',
				color: 'green',
			});

			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaigns-paginated'] });
			queryClient.refetchQueries({
				queryKey: ['campaign', String(variables.campaignId)],
			});
		},
		onError: (error) => {
			const defaultMessage = 'Failed to restart campaign.';
			const apiMessage =
				typeof error === 'object' && error !== null && 'response' in error
					? // @ts-expect-error -- guarded access to axios error response
						(error.response?.data?.message ?? defaultMessage)
					: defaultMessage;

			notifications.show({
				title: 'Error',
				message: apiMessage,
				color: 'red',
			});
			void error;
		},
	});
};
