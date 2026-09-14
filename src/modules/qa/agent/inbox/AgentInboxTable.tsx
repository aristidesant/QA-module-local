import React from 'react';
import { Badge, Tooltip, Group, ActionIcon, Text } from '@mantine/core';
import {
	IconCircleFilled,
	IconArchive,
	IconCheck,
	IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { personNameOf } from '~/modules/qa/inbox/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { AgentNotification } from '~/models/qa/notifications';
import styles from './AgentInboxTable.module.css';

dayjs.extend(relativeTime);

export interface AgentInboxTableProps {
	notifications: AgentNotification[];
	onMarkRead: (id: string) => void;
	onMarkUnread: (id: string) => void;
	/** Managers also see which agent each notification is about. */
	showAbout?: boolean;
	onArchive: (id: string) => void;
	onViewDetails: (id: string) => void;
	isLoading?: boolean;
}

const getPriorityColor = (priority: AgentNotification['priority']) => {
	switch (priority) {
		case 'CRITICAL':
			return 'red';
		case 'HIGH':
			return 'orange';
		case 'NORMAL':
			return 'blue';
		case 'LOW':
			return 'gray';
		default:
			return 'gray';
	}
};

export const AgentInboxTable: React.FC<AgentInboxTableProps> = ({
	notifications,
	onMarkRead,
	onMarkUnread,
	onArchive,
	onViewDetails,
	showAbout = false,
	isLoading = false,
}) => {
	const { t } = useTranslation('qa.inbox');

	const columns: BaseTableColumnDef<AgentNotification>[] = [
		{
			accessorKey: 'read',
			header: '',
			size: 50,
			cell: ({ row }) => (
				<Tooltip
					label={
						row.original.read
							? t('table.actions.markUnread')
							: t('table.actions.markRead')
					}
				>
					<ActionIcon
						variant='subtle'
						size='sm'
						onClick={(e) => {
							e.stopPropagation();
							if (row.original.read) {
								onMarkUnread(row.original.id);
							} else {
								onMarkRead(row.original.id);
							}
						}}
					>
						<IconCircleFilled
							size={14}
							color={
								row.original.read
									? 'var(--mantine-color-gray-4)'
									: 'var(--mantine-color-blue-6)'
							}
							style={{ fill: 'currentColor' }}
						/>
					</ActionIcon>
				</Tooltip>
			),
		},
		{
			accessorKey: 'category',
			header: t('table.columns.type'),
			size: 130,
			cell: ({ row }) => (
				<Badge
					variant='light'
					size='sm'
					{...{
						'data-category': row.original.category,
					}}
				>
					{t(`categories.${row.original.category}`)}
				</Badge>
			),
			enableSorting: true,
		},
		{
			accessorKey: 'title',
			header: t('table.columns.title'),
			size: 300,
			cell: ({ row }) => (
				<Text
					size='sm'
					fw={row.original.read ? 400 : 600}
					className={row.original.read ? '' : styles.unreadTitle}
				>
					{row.original.title}
				</Text>
			),
		},
		...(showAbout
			? [
					{
						accessorKey: 'agentId',
						header: t('table.columns.about'),
						size: 150,
						cell: ({ row }: { row: { original: AgentNotification } }) => (
							<Text size='sm' c='dimmed'>
								{personNameOf(row.original.agentId) ?? row.original.agentId}
							</Text>
						),
					} as BaseTableColumnDef<AgentNotification>,
				]
			: []),
		{
			accessorKey: 'priority',
			header: t('table.columns.priority'),
			size: 100,
			cell: ({ row }) => (
				<Badge
					color={getPriorityColor(row.original.priority)}
					variant='filled'
					size='sm'
				>
					{t(`priorities.${row.original.priority}`)}
				</Badge>
			),
			enableSorting: true,
		},
		{
			accessorKey: 'sourceRole',
			header: t('table.columns.source'),
			size: 110,
			cell: ({ row }) => (
				<Text size='sm'>{t(`sources.${row.original.sourceRole}`)}</Text>
			),
		},
		{
			accessorKey: 'createdAt',
			header: t('table.columns.date'),
			size: 150,
			cell: ({ row }) => (
				<Tooltip
					label={dayjs(row.original.createdAt).format('YYYY-MM-DD HH:mm')}
				>
					<Text size='sm' c='dimmed'>
						{dayjs(row.original.createdAt).fromNow()}
					</Text>
				</Tooltip>
			),
			enableSorting: true,
		},
		{
			id: 'actions',
			header: '',
			size: 100,
			cell: ({ row }) => (
				<Group gap='xs' justify='flex-end'>
					<Tooltip label={t('table.actions.view')}>
						<ActionIcon
							variant='subtle'
							size='sm'
							onClick={(e) => {
								e.stopPropagation();
								onViewDetails(row.original.id);
							}}
						>
							<IconChevronRight size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('table.actions.archive')}>
						<ActionIcon
							variant='subtle'
							size='sm'
							onClick={(e) => {
								e.stopPropagation();
								onArchive(row.original.id);
							}}
						>
							<IconArchive size={16} />
						</ActionIcon>
					</Tooltip>
					{row.original.read && (
						<Tooltip label={t('table.actions.markRead')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									onMarkRead(row.original.id);
								}}
							>
								<IconCheck size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			),
		},
	];

	return (
		<BaseTable<AgentNotification>
			data={notifications}
			columns={columns}
			getRowId={(row) => row.id}
			isLoading={isLoading}
			emptyMessage={t('table.empty')}
			initialSort={[{ id: 'createdAt', desc: true }]}
			onRowClick={(notification) => onViewDetails(notification.id)}
			className={styles.inboxTable}
			rootProps={{
				className: styles.tableRoot,
			}}
		/>
	);
};

export default AgentInboxTable;
