import { ActionIcon, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconCircleCheck,
	IconX,
} from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
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
	const { t } = useTranslation('campaigns');
	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();
	const { canPerformAction } = usePermissions();

	const isLoading =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending;

	const showSuccessNotification = (message: string) => {
		notifications.show({
			title: t('form.contacts.controls.notifications.successTitle'),
			message,
			color: 'green',
			icon: <IconCircleCheck size={18} />,
			autoClose: 5000,
		});
	};

	const showErrorNotification = (error: unknown, fallbackMessage: string) => {
		console.log({ error, fallbackMessage });

		const apiMessage =
			(error as { response?: { data?: { message?: string } } })?.response?.data
				?.message || (error instanceof Error ? error.message : null);

		notifications.show({
			title: t('form.contacts.controls.notifications.errorTitle'),
			message: apiMessage || fallbackMessage,
			color: 'red',
			icon: <IconX size={18} />,
			autoClose: 7000,
		});
	};

	const campaignId =
		contactGroup.schedule?.campaignId ?? contactGroup.campaignId;

	const canExecuteCampaign = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.EXECUTE
	);

	const { data: requirements } = useGetCampaignRequirements(
		canExecuteCampaign && campaignId ? campaignId.toString() : ''
	);

	const canStartOrResume = Boolean(
		requirements?.hasDispositionFlow && requirements?.hasActiveSchedule
	);

	const handleAction = async () => {
		if (isDisabled || isLoading) {
			return;
		}

		if (!campaignId) {
			showErrorNotification(
				null,
				t('form.contacts.controls.notifications.unknownCampaign')
			);
			return;
		}

		if (contactGroup.queueStatus === 'PENDING') {
			try {
				await startMutation.mutateAsync({
					campaignId,
					contactGroupId: contactGroup.id,
				});
				showSuccessNotification(
					t('form.contacts.controls.notifications.running')
				);
			} catch (error) {
				showErrorNotification(
					error,
					t('form.contacts.controls.notifications.startError')
				);
			}
		} else if (contactGroup.queueStatus === 'PAUSED') {
			try {
				await resumeMutation.mutateAsync({
					campaignId,
					contactGroupId: contactGroup.id,
				});
				showSuccessNotification(
					t('form.contacts.controls.notifications.resumed')
				);
			} catch (error) {
				showErrorNotification(
					error,
					t('form.contacts.controls.notifications.resumeError')
				);
			}
		} else if (contactGroup.queueStatus === 'RUNNING') {
			try {
				await pauseMutation.mutateAsync({
					campaignId,
					contactGroupId: contactGroup.id,
				});
				showSuccessNotification(
					t('form.contacts.controls.notifications.paused')
				);
			} catch (error) {
				showErrorNotification(
					error,
					t('form.contacts.controls.notifications.pauseError')
				);
			}
		}
	};

	const isStatusDisabled =
		contactGroup.queueStatus === 'COMPLETED' ||
		contactGroup.queueStatus === 'FAILED' ||
		contactGroup.queueStatus === 'EXECUTED';

	const isStartOrResumeAction =
		contactGroup.queueStatus === 'PENDING' ||
		contactGroup.queueStatus === 'PAUSED';

	const isDisabled =
		isStatusDisabled || (isStartOrResumeAction && !canStartOrResume);

	if (!canExecuteCampaign) {
		return null;
	}

	let icon = <IconPlayerPlay size={16} />;
	let tooltip = canStartOrResume
		? t('form.contacts.controls.start')
		: t('form.contacts.controls.requirementsNotMet');

	if (contactGroup.queueStatus === 'PAUSED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = canStartOrResume
			? t('form.contacts.controls.resume')
			: t('form.contacts.controls.requirementsNotMet');
	} else if (contactGroup.queueStatus === 'RUNNING') {
		icon = <IconPlayerPause size={16} />;
		tooltip = t('form.contacts.controls.pause');
	} else if (contactGroup.queueStatus === 'COMPLETED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.completed');
	} else if (contactGroup.queueStatus === 'FAILED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.failed');
	} else if (contactGroup.queueStatus === 'EXECUTED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.allWavesDone');
	}

	return (
		<Tooltip label={tooltip} withArrow>
			<ActionIcon
				variant='light'
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
