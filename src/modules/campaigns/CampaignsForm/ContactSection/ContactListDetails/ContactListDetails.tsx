import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
	ActionIcon,
	Alert,
	Button,
	Group,
	LoadingOverlay,
	Slider,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowUpRight,
	IconCalendarTime,
	IconEdit,
	IconGauge,
	IconInfoCircle,
	IconListDetails,
	IconPhoneCall,
	IconRefresh,
	IconRepeat,
	IconToggleLeft,
	IconToggleRight,
	IconTrash,
	IconUsers,
	IconCircleCheck,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';
import RightSectionCard from '~/components/RightSectionCard';
import RightSectionMetricCard from '~/components/RightSectionMetricCard';
import SectionTitle from '~/components/SectionTitle';
import type ContactGroup from '~/models/ContactGroup';
import usePermissions from '~/hooks/usePermissions';
import ExtendWavesModal from '~/modules/campaigns/components/ExtendWavesModal';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useDeleteContactGroup,
	useGetContactGroups,
	useToggleContactGroupStatus,
	useUpdateContactGroup,
	useExtendContactGroupWaves,
	useCompleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';
import ContactLimits from '../ContactLimits';
import { calculateHumanEquivalentValues } from '../ContactLimits/humanEquivalentCalculations';
import { getTranslatedQueueStatus } from '../ContactList/queueStatusConfig';
import { useCampaignsStore } from '~/stores/campaignsStore';
import styles from './ContactListDetails.module.css';
import { formatWaveDateTime, formatWaveDelaySeconds } from '~/utils/waveUtils';

interface ContactListDetailsProps {
	contactGroup: ContactGroup;
	onUpdateComplete: () => void;
	objectiveId?: number;
	campaignId?: string | number;
}

const formatNumber = (value?: number | null) => {
	if (value === null || value === undefined) {
		return '—';
	}
	return Number.isFinite(value) ? value.toLocaleString() : '—';
};

const formatDate = (t: TFunction, lng: string, value?: string | null) => {
	if (!value) {
		return t('form.contacts.details.stats.notSet');
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return t('form.contacts.details.stats.notSet');
	}
	return new Intl.DateTimeFormat(lng, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date);
};

const toTitleCase = (t: TFunction, value?: string | null) => {
	if (!value) {
		return t('form.contacts.details.stats.notAvailable');
	}
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const ContactListDetails: React.FC<ContactListDetailsProps> = ({
	contactGroup,
	onUpdateComplete,
	objectiveId,
	campaignId,
}) => {
	const { t, i18n } = useTranslation([
		'campaign.form.contacts',
		'campaign.contact-list',
		'common',
	]);
	const navigate = useNavigate();
	const { canAccessModule, canPerformAction } = usePermissions();
	const { setRightComponent, closeContactListDrawer } = useCampaignsStore();
	const toggleMutation = useToggleContactGroupStatus();
	const updateMutation = useUpdateContactGroup();
	const deleteMutation = useDeleteContactGroup();
	const cleanQueueMutation = useCleanOutboundQueue();
	const extendWavesMutation = useExtendContactGroupWaves();
	const completeGroupMutation = useCompleteContactGroup();
	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
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

	const canRenderActionsCard =
		canToggleContactList ||
		canEditContactList ||
		canDeleteContactList ||
		canCleanContactQueue ||
		canNavigateToContactList;

	const [isEditingHumanEquivalent, setIsEditingHumanEquivalent] =
		useState(false);

	const statusConfig = useMemo(
		() => getTranslatedQueueStatus(t, contactGroup.queueStatus),
		[contactGroup.queueStatus, t]
	);

	const statusLabel = useMemo(() => {
		return statusConfig.label;
	}, [statusConfig.label]);

	const stats = useMemo(
		() => [
			{
				label: t('form.contacts.details.stats.totalContacts'),
				value: formatNumber(contactGroup.contactCount),
				icon: <IconUsers size={16} />,
				iconClass: styles.iconBlue,
			},
			{
				label: t('form.contacts.details.stats.humanEquivalent'),
				value: formatNumber(contactGroup.humanEquivalent),
				icon: <IconGauge size={16} />,
				iconClass: styles.iconGrape,
			},
			{
				label: t('form.contacts.details.stats.waves'),
				value:
					contactGroup.maxWaves && contactGroup.maxWaves > 0
						? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
						: t('form.contacts.details.stats.notSet'),
				icon: <IconRefresh size={16} />,
				iconClass: styles.iconBlue,
			},
			{
				label: t('form.contacts.details.stats.maxCallsPerContact'),
				value: formatNumber(contactGroup.maxCallsPerContact),
				icon: <IconPhoneCall size={16} />,
				iconClass: styles.iconTeal,
			},
			{
				label: t('form.contacts.details.stats.maxCallsPerList'),
				value: formatNumber(contactGroup.maxCallsPerList),
				icon: <IconRepeat size={16} />,
				iconClass: styles.iconOrange,
			},
		],
		[
			contactGroup.contactCount,
			contactGroup.humanEquivalent,
			contactGroup.currentWave,
			contactGroup.maxWaves,
			contactGroup.maxCallsPerContact,
			contactGroup.maxCallsPerList,
			t,
		]
	);

	const metaItems = useMemo(
		() => [
			{
				label: t('form.contacts.details.meta.queueStatus'),
				value: statusLabel,
				accent: statusConfig.color,
				icon: <IconGauge size={14} />,
			},
			{
				label: t('form.contacts.details.meta.listStatus'),
				value: contactGroup.isActive
					? t('form.contacts.details.meta.active')
					: t('form.contacts.details.meta.inactive'),
				accent: contactGroup.isActive ? 'blue' : 'gray',
				icon: <IconListDetails size={14} />,
			},
			{
				label: t('form.contacts.details.meta.expirationDate'),
				value: formatDate(t, i18n.language, contactGroup.expirationDate),
				accent: 'indigo',
				icon: <IconCalendarTime size={14} />,
			},
			{
				label: t('form.contacts.details.meta.scheduler'),
				value:
					contactGroup.schedule?.name ||
					t('form.contacts.details.meta.notAssigned'),
				accent: 'grape',
				icon: <IconUsers size={14} />,
			},
			{
				label: t('form.contacts.details.meta.schedulerStatus'),
				value: toTitleCase(t, contactGroup.schedule?.status),
				accent: 'teal',
				icon: <IconInfoCircle size={14} />,
			},
			{
				label: t('form.contacts.details.meta.waveDelay'),
				value: formatWaveDelaySeconds(contactGroup.waveExecutionDelaySeconds, {
					day: t('units.day', { ns: 'common' }),
					hour: t('units.hour', { ns: 'common' }),
					minute: t('units.minute', { ns: 'common' }),
					second: t('units.second', { ns: 'common' }),
					noDelay: t('form.contacts.limits.noWaveDelay'),
					notSet: t('form.contacts.details.stats.notSet'),
				}),
				accent: 'orange',
				icon: <IconRepeat size={14} />,
			},
			{
				label: t('form.contacts.details.meta.lastWaveStarted'),
				value: formatWaveDateTime(
					contactGroup.lastWaveStartedAt,
					i18n.language,
					t('form.contacts.details.stats.notSet')
				),
				accent: 'blue',
				icon: <IconRefresh size={14} />,
			},
			{
				label: t('form.contacts.details.meta.lastWaveCompleted'),
				value: formatWaveDateTime(
					contactGroup.lastWaveCompletedAt,
					i18n.language,
					t('form.contacts.details.stats.notSet')
				),
				accent: 'teal',
				icon: <IconCircleCheck size={14} />,
			},
			{
				label: t('form.contacts.details.meta.nextWaveScheduled'),
				value: formatWaveDateTime(
					contactGroup.nextWaveScheduledAt,
					i18n.language,
					t('form.contacts.details.stats.notSet')
				),
				accent: 'grape',
				icon: <IconCalendarTime size={14} />,
			},
		],
		[
			contactGroup.expirationDate,
			contactGroup.isActive,
			contactGroup.lastWaveCompletedAt,
			contactGroup.lastWaveStartedAt,
			contactGroup.nextWaveScheduledAt,
			contactGroup.schedule?.name,
			contactGroup.schedule?.status,
			contactGroup.waveExecutionDelaySeconds,
			i18n.language,
			statusLabel,
			statusConfig.color,
			t,
		]
	);

	const isActionsLoading =
		toggleMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		cleanQueueMutation.isPending ||
		completeGroupMutation.isPending ||
		extendWavesMutation.isPending ||
		isEditingHumanEquivalent;

	const disableToggle = contactGroup.queueStatus === 'COMPLETED';
	const disableCleanQueue = contactGroup.queueStatus === 'COMPLETED';
	const isArchiveBlockedByQueueStatus = [
		'RUNNING',
		'WAITING',
		'PAUSED',
	].includes((contactGroup.queueStatus ?? '').toUpperCase());

	const handleEdit = () => {
		if (!canEditContactList) {
			return;
		}

		modals.open({
			modalId: 'contact-list-modal',
			title: (
				<SectionTitle
					title={t('knowledgeBaseSelection.columns.name')}
					description={t('form.contacts.details.description')}
				/>
			),
			children: (
				<ContactLimits
					contactGroup={contactGroup}
					onComplete={() => {
						onUpdateComplete();
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
		if (!canToggleContactList || disableToggle || isActionsLoading) {
			return;
		}

		// Deactivate flow
		if (contactGroup.isActive) {
			if (isArchiveBlockedByQueueStatus) {
				notifications.show({
					title: t('form.contacts.details.notifications.archiveBlocked.title'),
					message: t(
						'form.contacts.details.notifications.archiveBlocked.message'
					),
					color: 'orange',
					icon: <IconInfoCircle size={18} />,
					autoClose: 7000,
				});
				return;
			}

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
					// Close modal immediately so the loading overlay on the card is visible
					modals.close('toggle-contact-status');
					try {
						await toggleMutation.mutateAsync({
							id: contactGroup.id,
							isActive: false,
						});
						onUpdateComplete();
						setRightComponent(null);
						closeContactListDrawer();
					} catch (error) {
						void error;
					}
				},
			});
			return;
		}

		// Activate flow
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
									setIsEditingHumanEquivalent(true);
									modals.closeAll();
									await updateMutation.mutateAsync({
										id: contactGroup.id,
										updateData: {
											isActive: true,
											humanEquivalent: selectedHumanEquivalent,
										},
									});
									onUpdateComplete();
									setRightComponent(null);
									closeContactListDrawer();
								} catch (error) {
									void error;
								} finally {
									setIsEditingHumanEquivalent(false);
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
					onUpdateComplete();
					closeContactListDrawer();
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						t('form.contacts.details.dialogs.delete.errorMessage');
					notifications.show({
						title: t('form.contacts.details.dialogs.delete.error'),
						message: errorMessage,
						color: 'red',
					});
					void error;
				}
			},
		});
	};

	const handleCleanQueue = () => {
		if (!canCleanContactQueue) {
			return;
		}

		const targetCampaignId = campaignId ?? contactGroup.campaignId;
		if (!targetCampaignId) {
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
						campaignId: Number(targetCampaignId),
						contactGroupId: contactGroup.id,
					});
					onUpdateComplete();
				} catch (error) {
					void error;
				}
			},
		});
	};

	const handleNavigate = () => {
		if (!canNavigateToContactList) {
			return;
		}

		const targetCampaignId = campaignId ?? contactGroup.campaignId;
		if (!targetCampaignId) {
			return;
		}
		navigate(`/campaign/${targetCampaignId}/contact-list/${contactGroup.id}`);
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
							onUpdateComplete();
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
					onUpdateComplete();
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

	return (
		<Stack gap='md'>
			{canRenderActionsCard && (
				<RightSectionCard
					title={t('form.contacts.details.actions.title')}
					description={t('form.contacts.details.actions.description')}
					icon={IconEdit}
					iconColor='var(--mantine-color-orange-5)'
				>
					<Stack gap='md' pos='relative'>
						<LoadingOverlay
							visible={toggleMutation.isPending || isEditingHumanEquivalent}
							overlayProps={{ radius: 'sm', blur: 2 }}
							loaderProps={{ size: 'sm' }}
						/>
						<Group gap='xs' justify='center' className={styles.actionsRow}>
							{canToggleContactList && (
								<Tooltip
									label={
										contactGroup.isActive
											? t('form.contacts.details.actions.deactivate')
											: t('form.contacts.details.actions.activate')
									}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={handleToggleStatus}
										aria-label={
											contactGroup.isActive
												? t('form.contacts.details.actions.deactivate')
												: t('form.contacts.details.actions.activate')
										}
										disabled={disableToggle || isActionsLoading}
									>
										{contactGroup.isActive ? (
											<IconToggleRight size={16} />
										) : (
											<IconToggleLeft size={16} />
										)}
									</ActionIcon>
								</Tooltip>
							)}

							{contactGroup.queueStatus === 'EXECUTED' && (
								<>
									<Tooltip
										label={t('form.contacts.details.actions.extendWaves')}
										withArrow
									>
										<ActionIcon
											variant='light'
											color='blue'
											onClick={handleExtendWaves}
											aria-label={t(
												'form.contacts.details.actions.extendWaves'
											)}
											disabled={isActionsLoading}
										>
											<IconRefresh size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip
										label={t('form.contacts.details.actions.completeList')}
										withArrow
									>
										<ActionIcon
											variant='light'
											color='green'
											onClick={handleCompleteGroup}
											aria-label={t(
												'form.contacts.details.actions.completeList'
											)}
											disabled={isActionsLoading}
										>
											<IconCircleCheck size={16} />
										</ActionIcon>
									</Tooltip>
								</>
							)}

							{canEditContactList && (
								<Tooltip
									label={t('form.contacts.details.actions.editContactList')}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={handleEdit}
										aria-label={t(
											'form.contacts.details.actions.editContactList'
										)}
										disabled={isActionsLoading}
									>
										<IconEdit size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canDeleteContactList && (
								<Tooltip
									label={t('form.contacts.details.actions.deleteContactList')}
									withArrow
								>
									<ActionIcon
										variant='light'
										color='red'
										onClick={handleDelete}
										aria-label={t(
											'form.contacts.details.actions.deleteContactList'
										)}
										disabled={isActionsLoading}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canCleanContactQueue && (
								<Tooltip
									label={t('form.contacts.details.actions.cleanQueue')}
									withArrow
								>
									<ActionIcon
										variant='light'
										color='orange'
										onClick={handleCleanQueue}
										aria-label={t('form.contacts.details.actions.cleanQueue')}
										disabled={disableCleanQueue || isActionsLoading}
									>
										<IconRefresh size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canNavigateToContactList && (
								<Tooltip
									label={t('form.contacts.details.actions.openContactList')}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={handleNavigate}
										aria-label={t(
											'form.contacts.details.actions.openContactList'
										)}
										disabled={isActionsLoading}
									>
										<IconArrowUpRight size={16} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</Stack>
				</RightSectionCard>
			)}
			<RightSectionCard
				title={t('form.contacts.details.title')}
				description={t('form.contacts.details.description')}
				icon={IconListDetails}
				iconColor='var(--mantine-color-blue-5)'
			>
				<Stack gap='md' className={styles.details}>
					<Text className={styles.listName}>{contactGroup.name}</Text>
					{contactGroup.description && (
						<Text fz='sm' c='var(--mantine-color-gray-6)'>
							{contactGroup.description}
						</Text>
					)}

					<div>
						<Text className={styles.sectionTitle}>
							{t('form.contacts.details.configurations')}
						</Text>
						<div className={styles.statsGrid}>
							{stats.map((item) => (
								<div key={item.label} className={styles.statCard}>
									<div className={`${styles.statIcon} ${item.iconClass}`}>
										{item.icon}
									</div>
									<div className={styles.statCopy}>
										<Text className={styles.statLabel}>{item.label}</Text>
										<Text className={styles.statValue}>{item.value}</Text>
									</div>
								</div>
							))}
						</div>
					</div>
				</Stack>
			</RightSectionCard>

			<RightSectionMetricCard
				title={t('form.contacts.details.operationalStatus.title')}
				description={t('form.contacts.details.operationalStatus.description')}
				icon={IconGauge}
				iconColor='var(--mantine-color-green-5)'
				metaItems={metaItems}
			/>
		</Stack>
	);
};

export default ContactListDetails;
