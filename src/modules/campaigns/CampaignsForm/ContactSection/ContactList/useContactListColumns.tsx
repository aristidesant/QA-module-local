import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
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
import { getTranslatedQueueStatus } from './queueStatusConfig';
import { useSessionStore } from '~/stores/sessionStore';
import { formatWaveDateTime } from '~/utils/waveUtils';

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
	const { t, i18n } = useTranslation([
		'campaign.form.contacts',
		'campaign.contact-list',
		'common',
	]);
	const { user, targetClient } = useSessionStore();
	const toggleMutation = useToggleContactGroupStatus();
	const updateMutation = useUpdateContactGroup();
	const deleteMutation = useDeleteContactGroup();
	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
	});

	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;
	const isSuperAdmin =
		activeClientId !== null &&
		(user?.userRolesClient?.some(
			(userRole) =>
				userRole.clientId === activeClientId &&
				userRole.role?.code === 'SUPER_ADMIN'
		) ??
			false);

	return useMemo(
		() => [
			{
				accessorKey: 'active',
				header: '',
				cell: ({ row }) => <ContactListHoverCard contactGroup={row.original} />,
			},
			{
				id: 'name',
				header: t('form.contacts.list.columns.name'),
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
				header: t('form.contacts.list.columns.total'),
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.contactCount?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'humanEquivalent',
				header: t('form.contacts.list.columns.assigned'),
				cell: ({ row }) => (
					<Text fz='sm'>
						{row.original.humanEquivalent?.toLocaleString() || 0}
					</Text>
				),
			},
			{
				id: 'waves',
				header: t('form.contacts.details.stats.waves'),
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
				header: t('form.contacts.details.meta.listStatus'),
				cell: ({ row }) => (
					<Text fz='sm'>{timeAgo(row.original.createdAt)}</Text>
				),
			},
			{
				id: 'queueStatus',
				header: t('form.contacts.list.columns.status'),
				cell: ({ row }) => {
					const statusConfig = getTranslatedQueueStatus(
						t,
						row.original.queueStatus
					);
					const shouldShowNextWave = ['WAITING', 'PAUSED'].includes(
						row.original.queueStatus
					);
					const nextWaveScheduledAt =
						shouldShowNextWave && row.original.nextWaveScheduledAt
							? formatWaveDateTime(
									row.original.nextWaveScheduledAt,
									i18n.language,
									t('form.contacts.details.stats.notSet')
								)
							: null;
					return (
						<Stack gap={2} align='flex-start'>
							<Badge variant='light' color={statusConfig.color} size='sm'>
								{statusConfig.label}
							</Badge>
							{nextWaveScheduledAt && (
								<Text size='xs' c='dimmed'>
									{t('form.contacts.list.nextWaveScheduled', {
										value: nextWaveScheduledAt,
									})}
								</Text>
							)}
						</Stack>
					);
				},
			},
			{
				id: 'actions',
				header: t('form.contacts.list.columns.actions'),
				cell: ({ row }) => {
					const contactGroup = row.original;

					const isLoading =
						toggleMutation.isPending || deleteMutation.isPending;

					return (
						<Group gap='xs' justify='flex-start' wrap='nowrap'>
							{onNavigateToContactList && isSuperAdmin && (
								<Tooltip
									label={t('form.contacts.details.actions.openContactList')}
									withArrow
								>
									<ActionIcon
										variant='light'
										onClick={(event) => {
											event.stopPropagation();
											onNavigateToContactList(contactGroup);
										}}
										aria-label={t(
											'form.contacts.details.actions.openContactList'
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
			isSuperAdmin,
			t,
		]
	);
};

export default useContactListColumns;
