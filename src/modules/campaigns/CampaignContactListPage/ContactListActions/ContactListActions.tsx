import { Button, Group, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	IconCircleCheck,
	IconPlayerPause,
	IconPlayerPlay,
	IconX,
} from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import type { ContactGroupQueueStatus } from '~/models/ContactGroup';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import ExtendWavesModal from '~/modules/campaigns/components/ExtendWavesModal';
import {
	useGetCampaignRequirements,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useStartOutboundCampaign,
} from '~/queries/campaignsQueries';
import {
	useCompleteContactGroup,
	useExtendContactGroupWaves,
} from '~/queries/contactGroupQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { formatWaveDateTime } from '~/utils/waveUtils';
import classes from './ContactListActions.module.css';
import ExecutionControlAction from './ExecutionControlAction';
import ResumeWaitingNowAction from './ResumeWaitingNowAction';
import ExtendWavesAction from './ExtendWavesAction';
import CompleteListAction from './CompleteListAction';
import ReloadAction from './ReloadAction';
type StatusKey = ContactGroupQueueStatus | 'UNKNOWN';

interface ContactListActionsProps {
	contactGroup: ContactGroup;
	campaignId: number;
	onActionComplete: () => void | Promise<unknown>;
}

const ContactListActions = ({
	contactGroup,
	campaignId,
	onActionComplete,
}: ContactListActionsProps) => {
	const { t, i18n } = useTranslation([
		'campaign.contact-list',
		'campaign.form.contacts',
		'common',
	]);
	const { canPerformAction } = usePermissions();
	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();
	const extendMutation = useExtendContactGroupWaves();
	const completeMutation = useCompleteContactGroup();

	const resolvedCampaignId =
		contactGroup.schedule?.campaignId ?? contactGroup.campaignId ?? campaignId;
	const normalizedStatus = (contactGroup.queueStatus?.toUpperCase() ??
		'UNKNOWN') as StatusKey;
	const canExecuteCampaign = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.EXECUTE
	);

	const { data: requirements } = useGetCampaignRequirements(
		canExecuteCampaign && resolvedCampaignId ? String(resolvedCampaignId) : ''
	);

	const isActionLoading =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending ||
		extendMutation.isPending ||
		completeMutation.isPending;

	const canStartOrResume = Boolean(
		requirements?.hasDispositionFlow && requirements?.hasActiveSchedule
	);

	const showSuccessNotification = (message: string) => {
		notifications.show({
			title: t('form.contacts.controls.notifications.successTitle', {
				ns: 'campaign.form.contacts',
			}),
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
			title: t('form.contacts.controls.notifications.errorTitle', {
				ns: 'campaign.form.contacts',
			}),
			message: apiMessage || fallbackMessage,
			color: 'red',
			icon: <IconX size={18} />,
			autoClose: 7000,
		});
	};

	const handleActionSuccess = async (message: string) => {
		showSuccessNotification(message);
		await onActionComplete();
	};

	const requestStart = async () => {
		try {
			await startMutation.mutateAsync({
				campaignId: resolvedCampaignId,
				contactGroupId: contactGroup.id,
			});
			await handleActionSuccess(
				t('form.contacts.controls.notifications.running', {
					ns: 'campaign.form.contacts',
				})
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.startError', {
					ns: 'campaign.form.contacts',
				})
			);
		}
	};

	const requestPause = async () => {
		try {
			await pauseMutation.mutateAsync({
				campaignId: resolvedCampaignId,
				contactGroupId: contactGroup.id,
			});
			await handleActionSuccess(
				t('form.contacts.controls.notifications.paused', {
					ns: 'campaign.form.contacts',
				})
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.pauseError', {
					ns: 'campaign.form.contacts',
				})
			);
		}
	};

	const requestResume = async (ignoreWaveDelay?: boolean) => {
		try {
			await resumeMutation.mutateAsync({
				campaignId: resolvedCampaignId,
				contactGroupId: contactGroup.id,
				...(ignoreWaveDelay ? { ignoreWaveDelay } : {}),
			});
			await handleActionSuccess(
				ignoreWaveDelay
					? t('form.contacts.controls.notifications.resumeIgnoringDelay', {
							ns: 'campaign.form.contacts',
						})
					: t('form.contacts.controls.notifications.resumeRequested', {
							ns: 'campaign.form.contacts',
						})
			);
		} catch (error) {
			showErrorNotification(
				error,
				t('form.contacts.controls.notifications.resumeError', {
					ns: 'campaign.form.contacts',
				})
			);
		}
	};

	const openResumeOptionsModal = () => {
		const nextWaveScheduledLabel = formatWaveDateTime(
			contactGroup.nextWaveScheduledAt,
			i18n.language,
			t('summary.notSet', { ns: 'campaign.contact-list' })
		);

		modals.open({
			modalId: `resume-contact-group-${contactGroup.id}`,
			title: t('form.contacts.controls.resumeModal.title', {
				ns: 'campaign.form.contacts',
			}),
			centered: true,
			children: (
				<Stack gap='md'>
					<Text size='sm'>
						{t('form.contacts.controls.resumeModal.message', {
							ns: 'campaign.form.contacts',
						})}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.contacts.controls.resumeModal.scheduledFor', {
							ns: 'campaign.form.contacts',
							value: nextWaveScheduledLabel,
						})}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.contacts.controls.resumeModal.scheduleNotice', {
							ns: 'campaign.form.contacts',
						})}
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
							onClick={() => {
								modals.closeAll();
								void requestResume();
							}}
							loading={resumeMutation.isPending}
						>
							{t('form.contacts.controls.resume', {
								ns: 'campaign.form.contacts',
							})}
						</Button>
						<Button
							onClick={() => {
								modals.closeAll();
								void requestResume(true);
							}}
							loading={resumeMutation.isPending}
						>
							{t('form.contacts.controls.resumeIgnoreDelay', {
								ns: 'campaign.form.contacts',
							})}
						</Button>
					</Group>
				</Stack>
			),
		});
	};

	const handleExecutionAction = async () => {
		if (isActionLoading) {
			return;
		}

		if (!resolvedCampaignId) {
			showErrorNotification(
				null,
				t('form.contacts.controls.notifications.unknownCampaign', {
					ns: 'campaign.form.contacts',
				})
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

	const handleResumeWaitingNow = () => {
		if (normalizedStatus !== 'WAITING') {
			return;
		}

		const scheduledFor = formatWaveDateTime(
			contactGroup.nextWaveScheduledAt,
			i18n.language,
			t('summary.notSet', { ns: 'campaign.contact-list' })
		);

		modals.openConfirmModal({
			title: t('contacts.details.actions.resumeWaitingConfirmTitle', {
				ns: 'campaign.contact-list',
			}),
			centered: true,
			children: (
				<Stack gap='xs'>
					<Text size='sm'>
						{t('contacts.details.actions.resumeWaitingConfirmMessage', {
							ns: 'campaign.contact-list',
						})}
					</Text>
					{contactGroup.nextWaveScheduledAt ? (
						<Text size='sm' c='dimmed'>
							{t('contacts.details.actions.resumeWaitingScheduledFor', {
								ns: 'campaign.contact-list',
								value: scheduledFor,
							})}
						</Text>
					) : null}
					<Text size='sm' c='dimmed'>
						{t('contacts.details.actions.resumeWaitingScheduleNotice', {
							ns: 'campaign.contact-list',
						})}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('contacts.details.actions.resumeWaitingHelper', {
							ns: 'campaign.contact-list',
						})}
					</Text>
				</Stack>
			),
			labels: {
				confirm: t('contacts.details.actions.resumeWaiting', {
					ns: 'campaign.contact-list',
				}),
				cancel: t('cancel', { ns: 'common' }),
			},
			confirmProps: {
				color: 'orange',
				loading: resumeMutation.isPending,
			},
			onConfirm: async () => {
				try {
					await resumeMutation.mutateAsync({
						campaignId: resolvedCampaignId,
						contactGroupId: contactGroup.id,
						ignoreWaveDelay: true,
					});
					notifications.show({
						title: t(
							'contacts.details.notifications.resumedIgnoringDelay.title',
							{ ns: 'campaign.contact-list' }
						),
						message: t(
							'contacts.details.notifications.resumedIgnoringDelay.message',
							{ ns: 'campaign.contact-list' }
						),
						color: 'green',
					});
					await onActionComplete();
				} catch (error) {
					notifications.show({
						title: t('actions.error', { ns: 'campaign.contact-list' }),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const handleExtendWaves = () => {
		if (normalizedStatus !== 'EXECUTED') {
			return;
		}

		modals.open({
			title: t('contacts.details.actions.extendWaves', {
				ns: 'campaign.contact-list',
			}),
			centered: true,
			withCloseButton: false,
			children: (
				<ExtendWavesModal
					onSubmit={async (wavesToAdd) => {
						try {
							await extendMutation.mutateAsync({
								id: contactGroup.id,
								additionalWaves: wavesToAdd,
							});
							notifications.show({
								title: t('contacts.details.notifications.wavesExtended.title', {
									ns: 'campaign.contact-list',
								}),
								message: t(
									'contacts.details.notifications.wavesExtended.message',
									{
										ns: 'campaign.contact-list',
										count: wavesToAdd,
									}
								),
								color: 'green',
							});
							await onActionComplete();
							modals.closeAll();
						} catch (error) {
							notifications.show({
								title: t('actions.error', { ns: 'campaign.contact-list' }),
								message: getErrorMessage(error),
								color: 'red',
							});
						}
					}}
					onCancel={() => modals.closeAll()}
					loading={extendMutation.isPending}
				/>
			),
		});
	};

	const handleCompleteList = () => {
		if (normalizedStatus !== 'EXECUTED') {
			return;
		}

		modals.openConfirmModal({
			title: t('contacts.details.actions.completeList', {
				ns: 'campaign.contact-list',
			}),
			children: (
				<Text size='sm'>
					{t('status.confirmCompleteList', { ns: 'campaign.contact-list' })}
				</Text>
			),
			labels: {
				confirm: t('contacts.details.confirm.complete', {
					ns: 'campaign.contact-list',
				}),
				cancel: t('contacts.details.confirm.cancel', {
					ns: 'campaign.contact-list',
				}),
			},
			confirmProps: { color: 'green', loading: completeMutation.isPending },
			onConfirm: async () => {
				try {
					await completeMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t('contacts.details.notifications.completed.title', {
							ns: 'campaign.contact-list',
						}),
						message: t('contacts.details.notifications.completed.message', {
							ns: 'campaign.contact-list',
						}),
						color: 'green',
					});
					await onActionComplete();
				} catch (error) {
					notifications.show({
						title: t('actions.error', { ns: 'campaign.contact-list' }),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const executionTooltip = (() => {
		if (normalizedStatus === 'PAUSED') {
			return canStartOrResume
				? t('form.contacts.controls.resume', { ns: 'campaign.form.contacts' })
				: t('form.contacts.controls.requirementsNotMet', {
						ns: 'campaign.form.contacts',
					});
		}

		if (normalizedStatus === 'PENDING') {
			return canStartOrResume
				? t('form.contacts.controls.start', { ns: 'campaign.form.contacts' })
				: t('form.contacts.controls.requirementsNotMet', {
						ns: 'campaign.form.contacts',
					});
		}

		if (normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING') {
			return t('form.contacts.controls.pause', {
				ns: 'campaign.form.contacts',
			});
		}

		return '';
	})();

	const showExecutionAction =
		canExecuteCampaign &&
		(normalizedStatus === 'PENDING' ||
			normalizedStatus === 'PAUSED' ||
			normalizedStatus === 'RUNNING' ||
			normalizedStatus === 'WAITING');

	const executionIcon =
		normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING'
			? IconPlayerPause
			: IconPlayerPlay;

	return (
		<div className={classes.root}>
			<div className={classes.primaryActions}>
				{showExecutionAction && (
					<div className={classes.action}>
						<ExecutionControlAction
							tooltip={executionTooltip}
							icon={executionIcon}
							onClick={() => {
								void handleExecutionAction();
							}}
							loading={
								startMutation.isPending ||
								pauseMutation.isPending ||
								resumeMutation.isPending
							}
							disabled={
								isActionLoading ||
								((normalizedStatus === 'PENDING' ||
									normalizedStatus === 'PAUSED') &&
									!canStartOrResume)
							}
							color={
								normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING'
									? 'orange'
									: 'blue'
							}
						/>
					</div>
				)}

				{canExecuteCampaign && normalizedStatus === 'WAITING' && (
					<div className={classes.action}>
						<ResumeWaitingNowAction
							tooltip={t('form.contacts.controls.resumeIgnoreDelay', {
								ns: 'campaign.form.contacts',
							})}
							onClick={handleResumeWaitingNow}
							loading={resumeMutation.isPending}
							disabled={isActionLoading}
						/>
					</div>
				)}

				{canExecuteCampaign && normalizedStatus === 'EXECUTED' && (
					<div className={classes.action}>
						<ExtendWavesAction
							tooltip={t('contacts.details.actions.extendWaves', {
								ns: 'campaign.contact-list',
							})}
							onClick={handleExtendWaves}
							loading={extendMutation.isPending}
							disabled={isActionLoading}
						/>
					</div>
				)}

				{canExecuteCampaign && normalizedStatus === 'EXECUTED' && (
					<div className={classes.action}>
						<CompleteListAction
							tooltip={t('contacts.details.actions.completeList', {
								ns: 'campaign.contact-list',
							})}
							onClick={handleCompleteList}
							loading={completeMutation.isPending}
							disabled={isActionLoading}
						/>
					</div>
				)}
			</div>

			<div className={classes.secondaryActions}>
				<ReloadAction
					tooltip={t('contacts.tooltips.reload', {
						ns: 'campaign.contact-list',
					})}
					onClick={() => {
						void onActionComplete();
					}}
					disabled={isActionLoading}
				/>
			</div>
		</div>
	);
};

export default ContactListActions;
