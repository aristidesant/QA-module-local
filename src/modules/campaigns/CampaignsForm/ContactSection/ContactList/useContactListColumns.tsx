import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Badge,
	Group,
	Text,
	Tooltip,
	Slider,
	Alert,
	Box,
	Stack,
	Button,
} from '@mantine/core';
import {
	IconArrowUpRight,
	IconEdit,
	IconToggleLeft,
	IconToggleRight,
	IconInfoCircle,
	IconTrash,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type ContactGroup from '~/models/ContactGroup';
import SectionTitle from '~/components/SectionTitle';
import ContactLimits from '../ContactLimits';
import ContactListHoverCard from './ContactListHoverCard';
import ContactListControl from './ContactListControl';
import {
	useToggleContactGroupStatus,
	useUpdateContactGroup,
	useGetContactGroups,
	useDeleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { calculateHumanEquivalentValues } from '../ContactLimits/humanEquivalentCalculations';
import { getQueueStatusConfig } from './queueStatusConfig';

interface UseContactListColumnsParams {
	onUpdateComplete: () => void;
	objectiveId?: number;
	isActive: boolean;
	campaignId?: string | number;
	onNavigateToContactList?: (contactGroup: ContactGroup) => void;
}

const useContactListColumns = ({
	onUpdateComplete,
	objectiveId,
	isActive,
	campaignId,
	onNavigateToContactList,
}: UseContactListColumnsParams): ColumnDef<ContactGroup>[] => {
	const toggleMutation = useToggleContactGroupStatus();
	const updateMutation = useUpdateContactGroup();
	const deleteMutation = useDeleteContactGroup();
	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
	});

	const handleToggleStatus = async (contactGroup: ContactGroup) => {
		if (contactGroup.isActive) {
			// Deactivating
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
		} else {
			// Activating
			const calculations = calculateHumanEquivalentValues(
				contactGroups?.data || [],
				activeSchedule,
				undefined // Not editing, so no currentContactGroupId
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
							Cannot activate the contact list "{contactGroup.name}" because
							there is no available Human Equivalent capacity. Please increase
							the scheduler capacity or deactivate other contact lists first.
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
							Activate the contact list "{contactGroup.name}"? Set the Human
							Equivalent for this list.
						</Text>
						<Box>
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
								size='md'
							/>
						</Box>
						<Group justify='flex-end' mt='md'>
							<Button variant='outline' onClick={() => modals.closeAll()}>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									try {
										await updateMutation.mutateAsync({
											id: contactGroup.id,
											updateData: {
												isActive: true,
												humanEquivalent: selectedHumanEquivalent,
											},
										});
										modals.closeAll();
										onUpdateComplete();
									} catch (error) {
										// eslint-disable-next-line no-console
										console.error('Error activating contact group:', error);
									}
								}}
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
		}
	};

	const handleDelete = async (contactGroup: ContactGroup) => {
		modals.openConfirmModal({
			title: 'Confirm Deletion',
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
						title: 'Success',
						message: 'Contact list deleted successfully.',
						color: 'green',
					});
					onUpdateComplete();
				} catch (error: any) {
					const errorMessage =
						error?.response?.data?.message ||
						'Failed to delete contact list. Please try again.';
					notifications.show({
						title: 'Error',
						message: errorMessage,
						color: 'red',
					});
					// eslint-disable-next-line no-console
					console.error('Error deleting contact group:', error);
				}
			},
		});
	};

	return useMemo(
		() => [
			{
				accessorKey: 'active',
				header: '',
				cell: ({ row }) => <ContactListHoverCard contactGroup={row.original} />,
			},
			{
				id: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Text fz='sm' fw={500}>
						{row.original.name}
					</Text>
				),
			},
			{
				id: 'contactCount',
				header: 'Total Contacts',
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.contactCount?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'humanEquivalent',
				header: 'H. EQ',
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.humanEquivalent?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'queueStatus',
				header: 'Status',
				cell: ({ row }) => {
					const statusConfig = getQueueStatusConfig(row.original.queueStatus);
					return (
						<Badge variant='light' color={statusConfig.color} size='sm'>
							{statusConfig.label}
						</Badge>
					);
				},
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => {
					const contactGroup = row.original;

					const handleEdit = () => {
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

					const isLoading =
						toggleMutation.isPending || deleteMutation.isPending;

					return (
						<Group gap='xs' justify='flex-start' wrap='nowrap'>
							<Tooltip
								label={
									contactGroup.isActive
										? 'Deactivate contact list'
										: 'Activate contact list'
								}
								withArrow
							>
								<ActionIcon
									variant='subtle'
									onClick={() => handleToggleStatus(contactGroup)}
									aria-label={
										contactGroup.isActive
											? 'Deactivate contact list'
											: 'Activate contact list'
									}
									loading={isLoading}
									disabled={row?.original?.queueStatus === 'COMPLETED'}
								>
									{contactGroup.isActive ? (
										<IconToggleRight size={16} />
									) : (
										<IconToggleLeft size={16} />
									)}
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit contact list' withArrow>
								<ActionIcon
									variant='subtle'
									onClick={handleEdit}
									aria-label='Edit contact list'
									disabled={isLoading}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Delete contact list' withArrow>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => handleDelete(contactGroup)}
									aria-label='Delete contact list'
									loading={isLoading}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
							{onNavigateToContactList && (
								<Tooltip label='Open contact list page' withArrow>
									<ActionIcon
										variant='subtle'
										onClick={(event) => {
											event.stopPropagation();
											onNavigateToContactList(contactGroup);
										}}
										aria-label='Open contact list page'
										disabled={isLoading}
									>
										<IconArrowUpRight size={16} />
									</ActionIcon>
								</Tooltip>
							)}
							{isActive && <ContactListControl contactGroup={contactGroup} />}
						</Group>
					);
				},
			},
		],
		[
			onUpdateComplete,
			objectiveId,
			isActive,
			toggleMutation,
			updateMutation,
			deleteMutation,
			activeSchedule,
			contactGroups,
			onNavigateToContactList,
		]
	);
};

export default useContactListColumns;
