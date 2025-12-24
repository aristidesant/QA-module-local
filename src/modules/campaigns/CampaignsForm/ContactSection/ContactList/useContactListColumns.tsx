import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import { timeAgo } from '~/utils/dateUtils';
import ContactListHoverCard from './ContactListHoverCard';
import ContactListControl from './ContactListControl';
import { useTranslation } from 'react-i18next';
import {
	useToggleContactGroupStatus,
	useUpdateContactGroup,
	useGetContactGroups,
	useDeleteContactGroup,
} from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
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
	const { t } = useTranslation();
	const toggleMutation = useToggleContactGroupStatus();
	const updateMutation = useUpdateContactGroup();
	const deleteMutation = useDeleteContactGroup();
	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
	});

	return useMemo(
		() => [
			{
				accessorKey: 'active',
				header: '',
				cell: ({ row }) => <ContactListHoverCard contactGroup={row.original} />,
			},
			{
				id: 'name',
				header: t('campaigns.form.contacts.list.columns.name'),
				cell: ({ row }) => {
					const name = row.original.name;
					const maxLength = 20;
					const truncated =
						name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
					return (
						<Tooltip label={name} disabled={name.length <= maxLength}>
							<Text fz='sm' fw={500}>
								{truncated}
							</Text>
						</Tooltip>
					);
				},
			},
			{
				id: 'contactCount',
				header: t('campaigns.form.contacts.list.columns.total'),
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.contactCount?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'humanEquivalent',
				header: t('campaigns.form.contacts.list.columns.assigned'),
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.humanEquivalent?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'waves',
				header: t('campaigns.form.contacts.details.stats.waves'),
				cell: ({ row }) => {
					const { currentWave, maxWaves } = row.original;
					if (!maxWaves) {
						return <Text fz='sm'>—</Text>;
					}
					return (
						<Text fz='sm'>
							{`${currentWave ?? 1} / ${maxWaves.toLocaleString()}`}
						</Text>
					);
				},
			},
			{
				id: 'createdAt',
				header: t('campaigns.form.contacts.details.meta.listStatus'),
				cell: ({ row }) => (
					<Text fz='sm'>{timeAgo(row.original.createdAt)}</Text>
				),
			},
			{
				id: 'queueStatus',
				header: t('campaigns.form.contacts.list.columns.status'),
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
				header: t('campaigns.form.contacts.list.columns.actions'),
				cell: ({ row }) => {
					const contactGroup = row.original;

					const isLoading =
						toggleMutation.isPending || deleteMutation.isPending;

					return (
						<Group gap='xs' justify='flex-start' wrap='nowrap'>
							{onNavigateToContactList && (
								<Tooltip
									label={t(
										'campaigns.form.contacts.details.actions.openContactList'
									)}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={(event) => {
											event.stopPropagation();
											onNavigateToContactList(contactGroup);
										}}
										aria-label={t(
											'campaigns.form.contacts.details.actions.openContactList'
										)}
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
			t,
		]
	);
};

export default useContactListColumns;
