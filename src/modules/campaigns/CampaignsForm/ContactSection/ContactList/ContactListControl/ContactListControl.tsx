import { ActionIcon, Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconCircleCheck,
	IconX,
} from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import type { ContactGroupQueueStatus } from '~/models/ContactGroup';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useGetCampaignRequirements,
} from '~/queries/campaignsQueries';
import { modals } from '@mantine/modals';
import { formatWaveDateTime } from '~/utils/waveUtils';

interface ContactListControlProps {
	contactGroup: ContactGroup;
	display?: 'icon' | 'button';
	onActionComplete?: () => void | Promise<unknown>;
}

export const ContactListControl = ({
	contactGroup,
	display = 'icon',
	onActionComplete,
}: ContactListControlProps) => {
	const { t, i18n } = useTranslation(['campaigns', 'common']);
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

	const normalizedStatus = contactGroup.queueStatus?.toUpperCase() as
		| ContactGroupQueueStatus
		| 'UNKNOWN';

	const handleActionSuccess = async (message: string) => {
		showSuccessNotification(message);
		await onActionComplete?.();
	};

	const requestStart = async () => {
		try {
			await startMutation.mutateAsync({
				campaignId,
				contactGroupId: contactGroup.id,
			});
			await handleActionSuccess(
				t('form.contacts.controls.notifications.running')
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.startError')
			);
		}
	};

	const requestPause = async () => {
		try {
			await pauseMutation.mutateAsync({
				campaignId,
				contactGroupId: contactGroup.id,
			});
			await handleActionSuccess(
				t('form.contacts.controls.notifications.paused')
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.pauseError')
			);
		}
	};

	const requestResume = async (ignoreWaveDelay?: boolean) => {
		try {
			await resumeMutation.mutateAsync({
				campaignId,
				contactGroupId: contactGroup.id,
				...(ignoreWaveDelay ? { ignoreWaveDelay } : {}),
			});
			await handleActionSuccess(
				ignoreWaveDelay
					? t('form.contacts.controls.notifications.resumeIgnoringDelay')
					: t('form.contacts.controls.notifications.resumeRequested')
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.resumeError')
			);
		}
	};

	const openResumeOptionsModal = () => {
		const nextWaveScheduledLabel = formatWaveDateTime(
			contactGroup.nextWaveScheduledAt,
			i18n.language,
			t('form.contacts.details.stats.notSet')
		);

		modals.open({
			modalId: `resume-contact-group-${contactGroup.id}`,
			title: t('form.contacts.controls.resumeModal.title'),
			centered: true,
			children: (
				<Stack gap='md'>
					<Text size='sm'>
						{t('form.contacts.controls.resumeModal.message')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.contacts.controls.resumeModal.scheduledFor', {
							value: nextWaveScheduledLabel,
						})}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.contacts.controls.resumeModal.scheduleNotice')}
					</Text>
					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={() => modals.closeAll()}
							disabled={resumeMutation.isPending}
						>
							{t('cancel', { ns: 'common' })}
						</Button>
						<Button
							variant='outline'
							onClick={async () => {
								modals.closeAll();
								await requestResume();
							}}
							loading={resumeMutation.isPending}
						>
							{t('form.contacts.controls.resume')}
						</Button>
						<Button
							onClick={async () => {
								modals.closeAll();
								await requestResume(true);
							}}
							loading={resumeMutation.isPending}
						>
							{t('form.contacts.controls.resumeIgnoreDelay')}
						</Button>
					</Group>
				</Stack>
			),
		});
	};

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

		if (normalizedStatus === 'PENDING') {
			await requestStart();
			return;
		}

		if (normalizedStatus === 'PAUSED') {
			if (contactGroup.nextWaveScheduledAt) {
				openResumeOptionsModal();
				return;
			}

			await requestResume();
			return;
		}

		if (normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING') {
			await requestPause();
		}
	};

	const isStatusDisabled =
		normalizedStatus === 'COMPLETED' ||
		normalizedStatus === 'FAILED' ||
		normalizedStatus === 'EXECUTED';

	const isStartOrResumeAction =
		normalizedStatus === 'PENDING' || normalizedStatus === 'PAUSED';

	const isDisabled =
		isStatusDisabled || (isStartOrResumeAction && !canStartOrResume);

	if (!canExecuteCampaign) {
		return null;
	}

	let icon = <IconPlayerPlay size={16} />;
	let tooltip = canStartOrResume
		? t('form.contacts.controls.start')
		: t('form.contacts.controls.requirementsNotMet');
	let buttonLabel = t('form.contacts.controls.start');

	if (normalizedStatus === 'PAUSED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = canStartOrResume
			? t('form.contacts.controls.resume')
			: t('form.contacts.controls.requirementsNotMet');
		buttonLabel = t('form.contacts.controls.resume');
	} else if (normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING') {
		icon = <IconPlayerPause size={16} />;
		tooltip = t('form.contacts.controls.pause');
		buttonLabel = t('form.contacts.controls.pause');
	} else if (normalizedStatus === 'COMPLETED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.completed');
		buttonLabel = t('form.contacts.controls.completed');
	} else if (normalizedStatus === 'FAILED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.failed');
		buttonLabel = t('form.contacts.controls.failed');
	} else if (normalizedStatus === 'EXECUTED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = t('form.contacts.controls.allWavesDone');
		buttonLabel = t('form.contacts.controls.allWavesDone');
	} else if (normalizedStatus === 'UNKNOWN') {
		tooltip = t('status.unknown');
		buttonLabel = t('status.unknown');
	}

	if (display === 'button') {
		return (
			<Button
				variant='filled'
				onClick={() => {
					void handleAction();
				}}
				leftSection={icon}
				loading={isLoading}
				disabled={isDisabled || isLoading}
			>
				{buttonLabel}
			</Button>
		);
	}

	return (
		<Tooltip label={tooltip} withArrow>
			<ActionIcon
				variant='light'
				onClick={() => {
					void handleAction();
				}}
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
