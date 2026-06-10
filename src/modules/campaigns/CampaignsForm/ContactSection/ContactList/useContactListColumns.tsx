import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge, Stack, Text, Tooltip } from '@mantine/core';
import type ContactGroup from '~/models/ContactGroup';
import { timeAgo } from '~/utils/dateUtils';
import ContactListHoverCard from './ContactListHoverCard';
import ContactListControl from './ContactListControl';
import { useTranslation } from 'react-i18next';
import { getTranslatedQueueStatus } from './queueStatusConfig';
import { formatWaveDateTime } from '~/utils/waveUtils';
import styles from './ContactListView.module.css';

interface UseContactListColumnsParams {
	onUpdateComplete: () => void;
	objectiveId?: number;
	isActive: boolean;
	campaignId?: string | number;
}

const useContactListColumns = ({
	onUpdateComplete,
	objectiveId,
	isActive,
	campaignId,
}: UseContactListColumnsParams): ColumnDef<ContactGroup>[] => {
	const { t, i18n } = useTranslation([
		'campaign.form.contacts',
		'campaign.contact-list',
		'common',
	]);

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
							<Text fz='sm' fw={500} className={styles.nameCell}>
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

					return (
						<ContactListControl
							contactGroup={contactGroup}
							campaignId={campaignId}
							objectiveId={objectiveId}
							onActionComplete={onUpdateComplete}
						/>
					);
				},
			},
		],
		[onUpdateComplete, objectiveId, isActive, campaignId, t]
	);
};

export default useContactListColumns;
