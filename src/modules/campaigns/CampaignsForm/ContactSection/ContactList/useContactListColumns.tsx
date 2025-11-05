import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import {
	IconArrowUpRight,
	IconEdit,
	IconToggleLeft,
	IconToggleRight,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import type ContactGroup from '~/models/ContactGroup';
import SectionTitle from '~/components/SectionTitle';
import ContactLimits from '../ContactLimits';
import ContactListHoverCard from './ContactListHoverCard';
import ContactListControl from './ContactListControl';
import { useToggleContactGroupStatus } from '~/queries/contactGroupQueries';
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

	const handleToggleStatus = async (contactGroup: ContactGroup) => {
		modals.openConfirmModal({
			title: 'Confirm Status Change',
			children: (
				<Text size='sm'>
					Are you sure you want to{' '}
					{contactGroup.isActive ? 'deactivate' : 'activate'} the contact list "
					{contactGroup.name}"?
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			confirmProps: { color: 'blue' },
			onConfirm: async () => {
				try {
					await toggleMutation.mutateAsync({
						id: contactGroup.id,
						isActive: !contactGroup.isActive,
					});
					onUpdateComplete();
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('Error toggling contact group status:', error);
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

					const isLoading = toggleMutation.isPending;

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
			onNavigateToContactList,
		]
	);
};

export default useContactListColumns;
