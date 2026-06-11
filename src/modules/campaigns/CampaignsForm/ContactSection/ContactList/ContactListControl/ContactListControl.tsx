import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Button,
	Group,
	Menu,
	Slider,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconArrowUpRight,
	IconCircleCheck,
	IconDotsVertical,
	IconEdit,
	IconGauge,
	IconInfoCircle,
	IconPlayerPause,
	IconPlayerPlay,
	IconRefresh,
	IconToggleLeft,
	IconToggleRight,
	IconTrash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router';
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
import {
	useDeleteContactGroup,
	useGetContactGroups,
	useToggleContactGroupStatus,
	useUpdateContactGroup,
	useExtendContactGroupWaves,
	useCompleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import ExtendWavesModal from '~/modules/campaigns/components/ExtendWavesModal';
import ContactLimits from '../../ContactLimits';
import { calculateHumanEquivalentValues } from '../../ContactLimits/humanEquivalentCalculations';
import { formatWaveDateTime } from '~/utils/waveUtils';

interface ContactListControlProps {
	contactGroup: ContactGroup;
	campaignId?: string | number;
	objectiveId?: number;
	onActionComplete?: () => void | Promise<unknown>;
}

export const ContactListControl = ({
	contactGroup,
	campaignId,
	objectiveId,
	onActionComplete,
}: ContactListControlProps) => {
	const { t, i18n } = useTranslation(['campaign.form.contacts', 'common']);
	const navigate = useNavigate();
	const { canAccessModule, canPerformAction } = usePermissions();
	const campaignTargetId = campaignId ?? contactGroup.campaignId;

	const toggleMutation = useToggleContactGroupStatus();
	const updateMutation = useUpdateContactGroup();
	const deleteMutation = useDeleteContactGroup();
	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();
	const extendWavesMutation = useExtendContactGroupWaves();
	const completeGroupMutation = useCompleteContactGroup();
	const cleanQueueMutation = useCleanOutboundQueue();

	const { data: activeSchedule } = useCampaignActiveSchedule(campaignTargetId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId: campaignTargetId,
	});

	const canAccessCampaigns = canAccessModule(ModuleEnum.CAMPAIGNS);
	const canUpdateCampaigns = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.UPDATE
	);
	const canDeleteCampaigns = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.DELETE
	);
	const canExecuteCampaigns = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.EXECUTE
	);
	const canReadCampaigns = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.READ
	);

	const canToggleContactList = canAccessCampaigns && canUpdateCampaigns;
	const canEditContactList = canAccessCampaigns && canUpdateCampaigns;
	const canDeleteContactList = canAccessCampaigns && canDeleteCampaigns;
	const canCleanContactQueue = canAccessCampaigns && canExecuteCampaigns;
	const canNavigateToContactList = canAccessCampaigns && canReadCampaigns;

	const { data: requirements } = useGetCampaignRequirements(
		canExecuteCampaigns && campaignTargetId ? campaignTargetId.toString() : ''
	);
	const isLoading =
		toggleMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending ||
		extendWavesMutation.isPending ||
		completeGroupMutation.isPending ||
		cleanQueueMutation.isPending;

	const showSuccessNotification = (message: string) => {
		notifications.show({
			title: t('form.contacts.controls.notifications.successTitle'),
			message,
			color: 'green',
		});
	};

	const showErrorNotification = (error: unknown, fallbackMessage: string) => {
		const apiMessage =
			(error as { response?: { data?: { message?: string } } })?.response?.data
				?.message || (error instanceof Error ? error.message : null);

		notifications.show({
			title: t('form.contacts.controls.notifications.errorTitle'),
			message: apiMessage || fallbackMessage,
			color: 'red',
		});
	};

	const normalizedStatus = contactGroup.queueStatus?.toUpperCase() as
		| ContactGroupQueueStatus
		| 'UNKNOWN';

	const canStartOrResume = Boolean(
		requirements?.hasDispositionFlow && requirements?.hasActiveSchedule
	);

	const isStatusDisabled =
		normalizedStatus === 'COMPLETED' ||
		normalizedStatus === 'FAILED' ||
		normalizedStatus === 'EXECUTED';

	const isStartOrResumeAction =
		normalizedStatus === 'PENDING' || normalizedStatus === 'PAUSED';

	const isQuickActionDisabled =
		isStatusDisabled || (isStartOrResumeAction && !canStartOrResume);

	const handleActionSuccess = async (message: string) => {
		showSuccessNotification(message);
		await onActionComplete?.();
	};

	const requestStart = async () => {
		try {
			await startMutation.mutateAsync({
				campaignId: Number(campaignTargetId),
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
				campaignId: Number(campaignTargetId),
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
				campaignId: Number(campaignTargetId),
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

	const handleStatusAction = async () => {
		if (!campaignTargetId || isQuickActionDisabled || isLoading) {
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

	const handleEdit = () => {
		if (!canEditContactList) {
			return;
		}

		modals.open({
			modalId: 'contact-list-modal',
			title: t('form.contacts.details.actions.editContactList'),
			children: (
				<ContactLimits
					contactGroup={contactGroup}
					onComplete={() => {
						void onActionComplete?.();
						modals.close('contact-list-modal');
					}}
					objectiveId={objectiveId}
					campaignId={campaignId}
				/>
			),
			size: 'xl',
			centered: true,
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	};

	const handleToggleStatus = () => {
		if (!canToggleContactList || isLoading) {
			return;
		}

		if (contactGroup.isActive) {
			modals.openConfirmModal({
				modalId: 'toggle-contact-status',
				title: t('form.contacts.details.dialogs.deactivate.title'),
				children: (
					<Text size='sm'>
						{t('form.contacts.details.dialogs.deactivate.message', {
							name: contactGroup.name,
						})}
					</Text>
				),
				labels: {
					confirm: t('save', { ns: 'common' }),
					cancel: t('cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'blue' },
				onConfirm: async () => {
					modals.close('toggle-contact-status');
					try {
						await toggleMutation.mutateAsync({
							id: contactGroup.id,
							isActive: false,
						});
						await onActionComplete?.();
					} catch (error) {
						showErrorNotification(
							error,
							t('form.contacts.details.dialogs.deactivate.message', {
								name: contactGroup.name,
							})
						);
					}
				},
			});
			return;
		}

		const calculations = calculateHumanEquivalentValues(
			contactGroups?.data || [],
			activeSchedule,
			undefined
		);

		const { maxAvailableHumanEquivalent } = calculations;

		if (maxAvailableHumanEquivalent < 1) {
			modals.open({
				title: t('form.contacts.details.dialogs.activate.capacityErrorTitle'),
				children: (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('form.contacts.details.dialogs.activate.noCapacityTitle')}
						color='red'
					>
						{t('form.contacts.details.dialogs.activate.capacityErrorMessage', {
							name: contactGroup.name,
						})}
					</Alert>
				),
				centered: true,
			});
			return;
		}

		const ActivateModalContent = () => {
			const [selectedHumanEquivalent, setSelectedHumanEquivalent] = useState(
				contactGroup.humanEquivalent || 1
			);
			const [isSubmitting, setIsSubmitting] = useState(false);

			return (
				<Stack gap='md'>
					<Text size='sm'>
						{t('form.contacts.details.dialogs.activate.message', {
							name: contactGroup.name,
						})}
					</Text>
					<div>
						<Group justify='space-between' mb='xs'>
							<Text size='sm' fw={500}>
								{t('form.contacts.details.stats.humanEquivalent')}:{' '}
								{selectedHumanEquivalent}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.details.dialogs.activate.available', {
									count: maxAvailableHumanEquivalent,
								})}
							</Text>
						</Group>
						<Alert color='blue' variant='light' icon={<IconGauge size={16} />}>
							{t(
								'form.contacts.details.dialogs.activate.capacityErrorMessage',
								{
									name: contactGroup.name,
								}
							)}
						</Alert>
						<Slider
							value={selectedHumanEquivalent}
							onChange={setSelectedHumanEquivalent}
							min={1}
							max={maxAvailableHumanEquivalent}
							step={1}
							label={(value) => `${value}`}
							disabled={isSubmitting}
						/>
					</div>
					<Group justify='flex-end' gap='sm'>
						<Button
							variant='outline'
							onClick={() => modals.closeAll()}
							disabled={isSubmitting}
						>
							{t('cancel', { ns: 'common' })}
						</Button>
						<Button
							onClick={async () => {
								if (isSubmitting) return;
								setIsSubmitting(true);
								try {
									await updateMutation.mutateAsync({
										id: contactGroup.id,
										updateData: {
											isActive: true,
											humanEquivalent: selectedHumanEquivalent,
										},
									});
									await onActionComplete?.();
									modals.closeAll();
								} catch (error) {
									showErrorNotification(
										error,
										t(
											'form.contacts.details.dialogs.activate.capacityErrorMessage',
											{
												name: contactGroup.name,
											}
										)
									);
								} finally {
									setIsSubmitting(false);
								}
							}}
							loading={isSubmitting}
						>
							{t('form.contacts.details.dialogs.activate.confirm')}
						</Button>
					</Group>
				</Stack>
			);
		};

		modals.open({
			modalId: 'toggle-contact-status',
			title: t('form.contacts.details.dialogs.activate.title'),
			children: <ActivateModalContent />,
			size: 'md',
			centered: true,
		});
	};

	const handleDelete = () => {
		if (!canDeleteContactList) {
			return;
		}

		modals.openConfirmModal({
			title: t('form.contacts.details.dialogs.delete.title'),
			children: (
				<Text size='sm'>
					{t('form.contacts.details.dialogs.delete.message', {
						name: contactGroup.name,
					})}
				</Text>
			),
			labels: {
				confirm: t('delete', { ns: 'common' }),
				cancel: t('cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t('form.contacts.details.dialogs.delete.success'),
						message: t('form.contacts.details.dialogs.delete.successMessage', {
							name: contactGroup.name,
						}),
						color: 'green',
					});
					await onActionComplete?.();
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						t('form.contacts.details.dialogs.delete.errorMessage');
					notifications.show({
						title: t('form.contacts.details.dialogs.delete.error'),
						message: errorMessage,
						color: 'red',
					});
				}
			},
		});
	};

	const handleCleanQueue = () => {
		if (!canCleanContactQueue || !campaignTargetId) {
			return;
		}

		modals.openConfirmModal({
			title: t('form.contacts.details.dialogs.cleanQueue.title'),
			children: (
				<Text size='sm'>
					{t('form.contacts.details.dialogs.cleanQueue.message', {
						name: contactGroup.name,
					})}
				</Text>
			),
			labels: {
				confirm: t('form.contacts.details.dialogs.cleanQueue.confirm'),
				cancel: t('cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'orange' },
			onConfirm: async () => {
				try {
					await cleanQueueMutation.mutateAsync({
						campaignId: Number(campaignTargetId),
						contactGroupId: contactGroup.id,
					});
					await onActionComplete?.();
				} catch (error) {
					showErrorNotification(
						error,
						t('form.contacts.details.dialogs.cleanQueue.message', {
							name: contactGroup.name,
						})
					);
				}
			},
		});
	};

	const handleNavigate = () => {
		if (!canNavigateToContactList || !campaignTargetId) {
			return;
		}

		navigate(`/campaign/${campaignTargetId}/contact-list/${contactGroup.id}`);
	};

	const handleExtendWaves = () => {
		if (contactGroup.queueStatus !== 'EXECUTED') {
			return;
		}

		modals.open({
			title: t('form.contacts.details.dialogs.extendWaves.title'),
			centered: true,
			children: (
				<ExtendWavesModal
					onSubmit={async (wavesToAdd) => {
						try {
							await extendWavesMutation.mutateAsync({
								id: contactGroup.id,
								additionalWaves: wavesToAdd,
							});
							notifications.show({
								title: t('form.contacts.details.dialogs.extendWaves.success'),
								message: t(
									'form.contacts.details.dialogs.extendWaves.successMessage',
									{ count: wavesToAdd }
								),
								color: 'green',
							});
							await onActionComplete?.();
							modals.closeAll();
						} catch (error) {
							const apiMessage =
								(error as { response?: { data?: { message?: string } } })
									?.response?.data?.message ||
								(error instanceof Error ? error.message : null) ||
								t('form.contacts.details.dialogs.complete.error');
							notifications.show({
								title: t('form.contacts.details.dialogs.extendWaves.error'),
								message: apiMessage,
								color: 'red',
							});
						}
					}}
					onCancel={() => modals.closeAll()}
					loading={extendWavesMutation.isPending}
				/>
			),
			withCloseButton: false,
		});
	};

	const handleCompleteGroup = () => {
		if (contactGroup.queueStatus !== 'EXECUTED') {
			return;
		}

		modals.openConfirmModal({
			title: t('form.contacts.details.dialogs.complete.title'),
			children: (
				<Text size='sm'>
					{t('form.contacts.details.dialogs.complete.message')}
				</Text>
			),
			labels: {
				confirm: t('save', { ns: 'common' }),
				cancel: t('cancel', { ns: 'common' }),
			},
			confirmProps: {
				color: 'green',
				loading: completeGroupMutation.isPending,
			},
			onConfirm: async () => {
				try {
					await completeGroupMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t('form.contacts.details.dialogs.complete.success'),
						message: t('form.contacts.details.dialogs.complete.successMessage'),
						color: 'green',
					});
					await onActionComplete?.();
				} catch (error) {
					const apiMessage =
						(error as { response?: { data?: { message?: string } } })?.response
							?.data?.message ||
						(error instanceof Error ? error.message : null) ||
						t('form.contacts.details.dialogs.complete.error');
					notifications.show({
						title: t('form.contacts.details.dialogs.complete.error'),
						message: apiMessage,
						color: 'red',
					});
				}
			},
		});
	};

	const shouldRenderMenu =
		canToggleContactList ||
		canEditContactList ||
		canDeleteContactList ||
		canCleanContactQueue ||
		canNavigateToContactList ||
		canExecuteCampaigns ||
		contactGroup.queueStatus === 'EXECUTED';

	if (!shouldRenderMenu) {
		return null;
	}

	const quickActionLabel = (() => {
		if (normalizedStatus === 'PAUSED') {
			return canStartOrResume
				? t('form.contacts.controls.resume')
				: t('form.contacts.controls.requirementsNotMet');
		}
		if (normalizedStatus === 'RUNNING' || normalizedStatus === 'WAITING') {
			return t('form.contacts.controls.pause');
		}
		if (normalizedStatus === 'COMPLETED') {
			return t('form.contacts.controls.completed');
		}
		if (normalizedStatus === 'FAILED') {
			return t('form.contacts.controls.failed');
		}
		if (normalizedStatus === 'EXECUTED') {
			return t('form.contacts.controls.allWavesDone');
		}
		if (normalizedStatus === 'UNKNOWN') {
			return t('form.contacts.controls.unknown');
		}
		return t('form.contacts.controls.start');
	})();

	const hasManageSection =
		canUpdateCampaigns &&
		(contactGroup.queueStatus === 'EXECUTED' || canEditContactList);
	const hasOperationsSection = canNavigateToContactList || canCleanContactQueue;
	const hasStatusSection = canExecuteCampaigns;
	const hasDangerSection = canDeleteContactList;
	const hasAnySection =
		hasManageSection ||
		hasOperationsSection ||
		hasStatusSection ||
		hasDangerSection;

	return (
		<Menu shadow='md' position='bottom-end' withinPortal>
			<Menu.Target>
				<ActionIcon
					variant='subtle'
					color='gray'
					radius='xl'
					size='sm'
					aria-label={t('form.contacts.details.actions.moreActions')}
					onClick={(event) => event.stopPropagation()}
					disabled={!shouldRenderMenu || isLoading}
				>
					<IconDotsVertical size={15} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown onClick={(event) => event.stopPropagation()}>
				{hasAnySection && (
					<>
						{hasManageSection && (
							<>
								<Menu.Label>
									{t('form.contacts.details.actions.actionsGroupManage')}
								</Menu.Label>
								<Menu.Item
									leftSection={<IconEdit size={14} />}
									onClick={handleEdit}
								>
									{t('form.contacts.details.actions.editContactList')}
								</Menu.Item>
								{contactGroup.queueStatus === 'EXECUTED' && (
									<>
										<Menu.Item
											leftSection={<IconRefresh size={14} />}
											onClick={handleExtendWaves}
										>
											{t('form.contacts.details.actions.extendWaves')}
										</Menu.Item>
										<Menu.Item
											leftSection={<IconCircleCheck size={14} />}
											onClick={handleCompleteGroup}
										>
											{t('form.contacts.details.actions.completeList')}
										</Menu.Item>
									</>
								)}
							</>
						)}

						{hasOperationsSection && (
							<>
								{hasManageSection && <Menu.Divider />}
								<Menu.Label>
									{t('form.contacts.details.actions.actionsGroupOperations')}
								</Menu.Label>
								{canNavigateToContactList && (
									<Menu.Item
										leftSection={<IconArrowUpRight size={14} />}
										onClick={handleNavigate}
									>
										{t('form.contacts.details.actions.openContactList')}
									</Menu.Item>
								)}
								{canCleanContactQueue && (
									<Menu.Item
										leftSection={<IconRefresh size={14} />}
										onClick={handleCleanQueue}
									>
										{t('form.contacts.details.actions.cleanQueue')}
									</Menu.Item>
								)}
							</>
						)}

						{hasStatusSection && (
							<>
								{hasManageSection || hasOperationsSection ? (
									<Menu.Divider />
								) : null}
								<Menu.Label>
									{t('form.contacts.details.actions.actionsGroupStatus')}
								</Menu.Label>
								<Menu.Item
									leftSection={
										normalizedStatus === 'RUNNING' ||
										normalizedStatus === 'WAITING' ? (
											<IconPlayerPause size={14} />
										) : (
											<IconPlayerPlay size={14} />
										)
									}
									onClick={handleStatusAction}
									disabled={isQuickActionDisabled}
								>
									{quickActionLabel}
								</Menu.Item>
								<Menu.Item
									leftSection={
										contactGroup.isActive ? (
											<IconToggleRight size={14} />
										) : (
											<IconToggleLeft size={14} />
										)
									}
									onClick={handleToggleStatus}
								>
									{contactGroup.isActive
										? t('form.contacts.details.actions.deactivate')
										: t('form.contacts.details.actions.activate')}
								</Menu.Item>
							</>
						)}

						{hasDangerSection && (
							<>
								{hasManageSection ||
								hasOperationsSection ||
								hasStatusSection ? (
									<Menu.Divider />
								) : null}
								<Menu.Label>
									{t('form.contacts.details.actions.actionsGroupDanger')}
								</Menu.Label>
								<Menu.Item
									color='red'
									leftSection={<IconTrash size={14} />}
									onClick={handleDelete}
								>
									{t('form.contacts.details.actions.deleteContactList')}
								</Menu.Item>
							</>
						)}
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

export default ContactListControl;
