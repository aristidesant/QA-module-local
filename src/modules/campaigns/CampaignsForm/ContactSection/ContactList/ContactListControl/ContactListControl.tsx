import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconCircleCheck,
	IconX,
} from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useGetCampaignRequirements,
} from '~/queries/campaignsQueries';

interface ContactListControlProps {
	contactGroup: ContactGroup;
}

export const ContactListControl = ({
	contactGroup,
}: ContactListControlProps) => {
	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();

	const isLoading =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending;

	const showSuccessNotification = (message: string) => {
		notifications.show({
			title: 'Contact list updated',
			message,
			color: 'green',
			icon: <IconCircleCheck size={18} />,
			autoClose: 5000,
		});
	};

	const showErrorNotification = (error: unknown, fallbackMessage: string) => {
		const apiMessage =
			(error as { response?: { data?: { message?: string } } })?.response?.data
				?.message || (error instanceof Error ? error.message : null);

		notifications.show({
			title: 'Contact list action failed',
			message: apiMessage || fallbackMessage,
			color: 'red',
			icon: <IconX size={18} />,
			autoClose: 7000,
		});
	};

	const campaignId =
		contactGroup.schedule?.campaignId ?? contactGroup.campaignId;

	const { data: requirements } = useGetCampaignRequirements(
		campaignId?.toString() ?? ''
	);

	const canStartOrResume =
		requirements?.hasDispositionFlow && requirements?.hasActiveSchedule;

	const handleAction = () => {
		if (isDisabled || isLoading) {
			return;
		}

		if (!campaignId) {
			showErrorNotification(
				null,
				'Unable to process this contact list because the campaign is unknown. Please refresh and try again.'
			);
			return;
		}

		if (contactGroup.queueStatus === 'PENDING') {
			startMutation.mutate(
				{
					campaignId,
					contactGroupId: contactGroup.id,
				},
				{
					onSuccess: () => {
						showSuccessNotification('The contact list is now running.');
					},
					onError: (error) => {
						showErrorNotification(
							error,
							'We could not start the contact list. Please try again.'
						);
					},
				}
			);
		} else if (contactGroup.queueStatus === 'PAUSED') {
			resumeMutation.mutate(
				{
					campaignId,
					contactGroupId: contactGroup.id,
				},
				{
					onSuccess: () => {
						showSuccessNotification('The contact list has been resumed.');
					},
					onError: (error) => {
						showErrorNotification(
							error,
							'We could not resume the contact list. Please try again.'
						);
					},
				}
			);
		} else if (contactGroup.queueStatus === 'RUNNING') {
			pauseMutation.mutate(
				{
					campaignId,
					contactGroupId: contactGroup.id,
				},
				{
					onSuccess: () => {
						showSuccessNotification('The contact list has been paused.');
					},
					onError: (error) => {
						showErrorNotification(
							error,
							'We could not pause the contact list. Please try again.'
						);
					},
				}
			);
		}
	};

	const isStatusDisabled =
		contactGroup.queueStatus === 'COMPLETED' ||
		contactGroup.queueStatus === 'FAILED';

	const isStartOrResumeAction =
		contactGroup.queueStatus === 'PENDING' ||
		contactGroup.queueStatus === 'PAUSED';

	const isDisabled =
		isStatusDisabled || (isStartOrResumeAction && !canStartOrResume);

	let icon = <IconPlayerPlay size={16} />;
	let tooltip = canStartOrResume
		? 'Start contact list'
		: 'Campaign requirements not met';

	if (contactGroup.queueStatus === 'PAUSED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = canStartOrResume
			? 'Resume contact list'
			: 'Campaign requirements not met';
	} else if (contactGroup.queueStatus === 'RUNNING') {
		icon = <IconPlayerPause size={16} />;
		tooltip = 'Pause contact list';
	} else if (contactGroup.queueStatus === 'COMPLETED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = 'Contact list is complete';
	} else if (contactGroup.queueStatus === 'FAILED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = 'Contact list has failed';
	}

	return (
		<Tooltip label={tooltip} withArrow>
			<ActionIcon
				variant='subtle'
				onClick={handleAction}
				aria-label={tooltip}
				loading={isLoading}
				disabled={isDisabled || isLoading}
			>
				{icon}
			</ActionIcon>
		</Tooltip>
	);
};

export default ContactListControl;
