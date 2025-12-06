import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Alert,
	Button,
	Group,
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
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
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
import { getQueueStatusConfig } from '../ContactList/queueStatusConfig';
import styles from './ContactListDetails.module.css';

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

const formatDate = (value?: string | null) => {
	if (!value) {
		return 'Not set';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'Not set';
	}
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date);
};

const toTitleCase = (value?: string | null) => {
	if (!value) {
		return 'Not available';
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
	const navigate = useNavigate();
	const { canAccessModule, canPerformAction } = usePermissions();
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
		() => getQueueStatusConfig(contactGroup.queueStatus),
		[contactGroup.queueStatus]
	);

	const stats = useMemo(
		() => [
			{
				label: 'Total Contacts',
				value: formatNumber(contactGroup.contactCount),
				icon: <IconUsers size={16} />,
				iconClass: styles.iconBlue,
			},
			{
				label: 'Human Equivalent',
				value: formatNumber(contactGroup.humanEquivalent),
				icon: <IconGauge size={16} />,
				iconClass: styles.iconGrape,
			},
			{
				label: 'Waves',
				value:
					contactGroup.maxWaves && contactGroup.maxWaves > 0
						? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
						: 'Not set',
				icon: <IconRefresh size={16} />,
				iconClass: styles.iconBlue,
			},
			{
				label: 'Max Calls / Contact',
				value: formatNumber(contactGroup.maxCallsPerContact),
				icon: <IconPhoneCall size={16} />,
				iconClass: styles.iconTeal,
			},
			{
				label: 'Max Calls / List',
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
		]
	);

	const metaItems = useMemo(
		() => [
			{
				label: 'Queue status',
				value: statusConfig.label,
				accent: statusConfig.color,
				icon: <IconGauge size={14} />,
			},
			{
				label: 'List status',
				value: contactGroup.isActive ? 'Active' : 'Inactive',
				accent: contactGroup.isActive ? 'blue' : 'gray',
				icon: <IconListDetails size={14} />,
			},
			{
				label: 'Expiration date',
				value: formatDate(contactGroup.expirationDate),
				accent: 'indigo',
				icon: <IconCalendarTime size={14} />,
			},
			{
				label: 'Scheduler',
				value: contactGroup.schedule?.name || 'Not assigned',
				accent: 'grape',
				icon: <IconUsers size={14} />,
			},
			{
				label: 'Scheduler status',
				value: toTitleCase(contactGroup.schedule?.status),
				accent: 'teal',
				icon: <IconInfoCircle size={14} />,
			},
		],
		[
			contactGroup.expirationDate,
			contactGroup.isActive,
			contactGroup.schedule?.name,
			contactGroup.schedule?.status,
			statusConfig.label,
			statusConfig.color,
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

	const handleEdit = () => {
		if (!canEditContactList) {
			return;
		}

		modals.open({
			modalId: 'contact-list-modal',
			title: (
				<SectionTitle
					title='Contact List Configuration'
					description='Browse your existing contact lists or upload a new one to start reaching out.'
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
		if (!canToggleContactList) {
			return;
		}

		if (disableToggle) {
			return;
		}

		if (contactGroup.isActive) {
			modals.openConfirmModal({
				title: 'Confirm Status Change',
				children: (
					<Text size='sm'>
						Are you sure you want to deactivate the contact list "
						{contactGroup.name}"?
					</Text>
				),
				labels: { confirm: 'Confirm', cancel: 'Cancel' },
				confirmProps: { color: 'blue' },
				onConfirm: async () => {
					try {
						await toggleMutation.mutateAsync({
							id: contactGroup.id,
							isActive: false,
						});
						onUpdateComplete();
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Error toggling contact group status:', error);
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
				title: 'Cannot Activate Contact List',
				children: (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='No Human Equivalent Available'
						color='red'
					>
						Cannot activate the contact list "{contactGroup.name}" because there
						is no available Human Equivalent capacity. Please increase the
						scheduler capacity or deactivate other contact lists first.
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

			return (
				<Stack gap='md'>
					<Text size='sm'>
						Activate the contact list "{contactGroup.name}" and set the Human
						Equivalent allocation.
					</Text>
					<div>
						<Group justify='space-between' mb='xs'>
							<Text size='sm' fw={500}>
								Human Equivalent: {selectedHumanEquivalent}
							</Text>
							<Text size='xs' c='dimmed'>
								Available: {maxAvailableHumanEquivalent}
							</Text>
						</Group>
						<Slider
							value={selectedHumanEquivalent}
							onChange={setSelectedHumanEquivalent}
							min={1}
							max={maxAvailableHumanEquivalent}
							step={1}
							label={(value) => `${value}`}
						/>
					</div>
					<Group justify='flex-end' gap='sm'>
						<Button variant='outline' onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								try {
									setIsEditingHumanEquivalent(true);
									await updateMutation.mutateAsync({
										id: contactGroup.id,
										updateData: {
											isActive: true,
											humanEquivalent: selectedHumanEquivalent,
										},
									});
									onUpdateComplete();
									modals.closeAll();
								} catch (error) {
									// eslint-disable-next-line no-console
									console.error(
										'Error activating contact group with human equivalent:',
										error
									);
								} finally {
									setIsEditingHumanEquivalent(false);
								}
							}}
							loading={updateMutation.isPending}
						>
							Activate
						</Button>
					</Group>
				</Stack>
			);
		};

		modals.open({
			title: 'Activate Contact List',
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
			title: 'Delete Contact List',
			children: (
				<Text size='sm'>
					Are you sure you want to delete the contact list "{contactGroup.name}
					"? This action cannot be undone.
				</Text>
			),
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: 'Contact list removed',
						message: `"${contactGroup.name}" was deleted successfully.`,
						color: 'green',
					});
					onUpdateComplete();
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						'Failed to delete contact list. Please try again.';
					notifications.show({
						title: 'Unable to delete contact list',
						message: errorMessage,
						color: 'red',
					});
					// eslint-disable-next-line no-console
					console.error('Error deleting contact group:', error);
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
			title: 'Clean Queue',
			children: (
				<Text size='sm'>
					Are you sure you want to clean the queue for the contact list "
					{contactGroup.name}"? This will restart the campaign.
				</Text>
			),
			labels: { confirm: 'Clean Queue', cancel: 'Cancel' },
			confirmProps: { color: 'orange' },
			onConfirm: async () => {
				try {
					await cleanQueueMutation.mutateAsync({
						campaignId: Number(targetCampaignId),
						contactGroupId: contactGroup.id,
					});
					onUpdateComplete();
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('Error cleaning queue:', error);
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
			title: 'Extend Waves',
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
								title: 'Waves extended',
								message: `Added ${wavesToAdd} wave${
									wavesToAdd === 1 ? '' : 's'
								} to this list.`,
								color: 'green',
							});
							onUpdateComplete();
							modals.closeAll();
						} catch (error) {
							const apiMessage =
								(error as { response?: { data?: { message?: string } } })
									?.response?.data?.message ||
								(error instanceof Error ? error.message : null) ||
								'Unable to extend waves. Please try again.';
							notifications.show({
								title: 'Extend waves failed',
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
			title: 'Complete Contact List',
			children: (
				<Text size='sm'>
					Mark this contact list as completed? This will stop additional waves
					and set the list to inactive.
				</Text>
			),
			labels: { confirm: 'Complete', cancel: 'Cancel' },
			confirmProps: {
				color: 'green',
				loading: completeGroupMutation.isPending,
			},
			onConfirm: async () => {
				try {
					await completeGroupMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: 'Contact list completed',
						message: 'The list has been marked as completed.',
						color: 'green',
					});
					onUpdateComplete();
				} catch (error) {
					const apiMessage =
						(error as { response?: { data?: { message?: string } } })?.response
							?.data?.message ||
						(error instanceof Error ? error.message : null) ||
						'Unable to complete the contact list. Please try again.';
					notifications.show({
						title: 'Complete failed',
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
					title='Actions'
					description='Manage the lifecycle of this contact list'
					icon={IconEdit}
					iconColor='var(--mantine-color-orange-5)'
				>
					<Stack gap='md'>
						<Group gap='xs' justify='center' className={styles.actionsRow}>
							{canToggleContactList && (
								<Tooltip
									label={
										contactGroup.isActive
											? 'Deactivate contact list'
											: 'Activate contact list'
									}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={handleToggleStatus}
										aria-label={
											contactGroup.isActive
												? 'Deactivate contact list'
												: 'Activate contact list'
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
									<Tooltip label='Extend Waves' withArrow>
										<ActionIcon
											variant='light'
											color='blue'
											onClick={handleExtendWaves}
											aria-label='Extend Waves'
											disabled={isActionsLoading}
										>
											<IconRefresh size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label='Complete list' withArrow>
										<ActionIcon
											variant='light'
											color='green'
											onClick={handleCompleteGroup}
											aria-label='Complete list'
											disabled={isActionsLoading}
										>
											<IconCircleCheck size={16} />
										</ActionIcon>
									</Tooltip>
								</>
							)}

							{canEditContactList && (
								<Tooltip label='Edit contact list' withArrow>
									<ActionIcon
										variant='light'
										onClick={handleEdit}
										aria-label='Edit contact list'
										disabled={isActionsLoading}
									>
										<IconEdit size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canDeleteContactList && (
								<Tooltip label='Delete contact list' withArrow>
									<ActionIcon
										variant='light'
										color='red'
										onClick={handleDelete}
										aria-label='Delete contact list'
										disabled={isActionsLoading}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canCleanContactQueue && (
								<Tooltip label='Clean queue' withArrow>
									<ActionIcon
										variant='light'
										color='orange'
										onClick={handleCleanQueue}
										aria-label='Clean queue'
										disabled={disableCleanQueue || isActionsLoading}
									>
										<IconRefresh size={16} />
									</ActionIcon>
								</Tooltip>
							)}

							{canNavigateToContactList && (
								<Tooltip label='Open contact list page' withArrow>
									<ActionIcon
										variant='light'
										onClick={handleNavigate}
										aria-label='Open contact list page'
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
				title='Contact List'
				description='Configuration overview'
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
						<Text className={styles.sectionTitle}>Configurations</Text>
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
				title='Operational Status'
				description='Current operational information'
				icon={IconGauge}
				iconColor='var(--mantine-color-green-5)'
				metaItems={metaItems}
			/>
		</Stack>
	);
};

export default ContactListDetails;
