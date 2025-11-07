import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import outboundApi, { type CleanOutboundQueuePayload } from '~/api/outboundApi';

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
			console.error('Error cleaning outbound queue:', error);
		},
	});
};
