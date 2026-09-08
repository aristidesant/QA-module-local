import React from 'react';
import {
	Badge,
	Tooltip,
	Group,
	ActionIcon,
	Text,
} from '@mantine/core';
import {
	IconCircleFilled,
	IconArchive,
	IconCheck,
	IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentNotification } from '~/models/qa/notifications';
import styles from './AgentInboxTable.module.css';

dayjs.extend(relativeTime);

export interface AgentInboxTableProps {
	notifications: AgentNotification[];
	onMarkRead: (id: string) => void;
	onMarkUnread: (id: string) => void;
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

const getCategoryLabel = (category: AgentNotification['category']) => {
	const categoryMap: Record<AgentNotification['category'], string> = {
		DIRECT_MESSAGE: 'Direct Message',
		METRIC_ALERT: 'Metric Alert',
		TREND_WARNING: 'Trend Warning',
		POSITIVE_RECOGNITION: 'Recognition',
		WEEKLY_SUMMARY: 'Weekly Summary',
	};
	return categoryMap[category] || category;
};

const getSourceLabel = (sourceRole: AgentNotification['sourceRole']) => {
	switch (sourceRole) {
		case 'SUPERVISOR':
			return 'Supervisor';
		case 'QA_MANAGER':
			return 'QA Manager';
		case 'SYSTEM':
			return 'System';
		default:
			return sourceRole;
	}
};

export const AgentInboxTable: React.FC<AgentInboxTableProps> = ({
	notifications,
	onMarkRead,
	onMarkUnread,
	onArchive,
	onViewDetails,
	isLoading = false,
}) => {
	const { t } = useTranslation();

	const columns: BaseTableColumnDef<AgentNotification>[] = [
		{
			accessorKey: 'read',
			header: '',
			size: 50,
			cell: ({ row }) => (
				<Tooltip label={row.original.read ? 'Mark as unread' : 'Mark as read'}>
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
							color={row.original.read ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-blue-6)'}
							style={{ fill: 'currentColor' }}
						/>
					</ActionIcon>
				</Tooltip>
			),
		},
		{
			accessorKey: 'category',
			header: 'Type',
			size: 130,
			cell: ({ row }) => (
				<Badge
					variant='light'
					size='sm'
					{...{
						'data-category': row.original.category,
					}}
				>
					{getCategoryLabel(row.original.category)}
				</Badge>
			),
			enableSorting: true,
		},
		{
			accessorKey: 'title',
			header: 'Title',
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
		{
			accessorKey: 'priority',
			header: 'Priority',
			size: 100,
			cell: ({ row }) => (
				<Badge
					color={getPriorityColor(row.original.priority)}
					variant='filled'
					size='sm'
				>
					{row.original.priority}
				</Badge>
			),
			enableSorting: true,
		},
		{
			accessorKey: 'sourceRole',
			header: 'Source',
			size: 110,
			cell: ({ row }) => (
				<Text size='sm'>
					{getSourceLabel(row.original.sourceRole)}
				</Text>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Date',
			size: 150,
			cell: ({ row }) => (
				<Tooltip label={dayjs(row.original.createdAt).format('YYYY-MM-DD HH:mm')}>
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
					<Tooltip label='View details'>
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
					<Tooltip label='Archive'>
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
						<Tooltip label='Mark as read'>
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
			emptyMessage={t('status.noData')}
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
