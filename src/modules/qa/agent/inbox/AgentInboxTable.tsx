import React, { useMemo } from 'react';
import {
	ActionIcon,
	Badge,
	Group,
	Text,
	ThemeIcon,
	Tooltip,
	VisuallyHidden,
} from '@mantine/core';
import {
	IconArchive,
	IconArrowBackUp,
	IconMail,
	IconMailOpened,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { AgentNotification } from '~/models/qa/notifications';
import {
	INBOX_KIND_META,
	PRIORITY_TONE,
	agentNameOf,
	kindOf,
	personNameOf,
} from '~/modules/qa/inbox/constants';
import { fromMockNow } from '~/modules/qa/disputes/cases/helpers';
import styles from './AgentInboxTable.module.css';

export interface AgentInboxTableProps {
	notifications: AgentNotification[];
	onView: (id: string) => void;
	onToggleRead: (notification: AgentNotification) => void;
	onArchive: (id: string) => void;
	/** Shown instead of the read and archive actions in the Archived view. */
	onRestore?: (id: string) => void;
	archivedView?: boolean;
	/** Managers also see which agent each notification is about. */
	showAbout?: boolean;
}

/** Sort weight of each priority, so Critical sorts above Low. */
const PRIORITY_RANK: Record<AgentNotification['priority'], number> = {
	CRITICAL: 3,
	HIGH: 2,
	NORMAL: 1,
	LOW: 0,
};

/** The inbox list: type, title with a preview, who it concerns and who sent it, priority and age. */
export const AgentInboxTable: React.FC<AgentInboxTableProps> = ({
	notifications,
	onView,
	onToggleRead,
	onArchive,
	onRestore,
	archivedView = false,
	showAbout = false,
}) => {
	const { t } = useTranslation('qa.inbox');

	const columns = useMemo<BaseTableColumnDef<AgentNotification>[]>(
		() => [
			{
				id: 'state',
				header: '',
				size: 40,
				cell: ({ row }) => (
					<>
						<span
							aria-hidden
							className={`${styles.dot} ${row.original.read ? styles.dotRead : ''}`}
						/>
						<VisuallyHidden>
							{t(row.original.read ? 'table.read' : 'table.unread')}
						</VisuallyHidden>
					</>
				),
			},
			{
				id: 'kind',
				accessorFn: (n) => t(`kinds.${kindOf(n)}`),
				header: t('table.columns.type'),
				size: 160,
				enableSorting: true,
				cell: ({ row }) => {
					const kind = kindOf(row.original);
					const Icon = INBOX_KIND_META[kind].icon;
					return (
						<Group gap={6} wrap='nowrap'>
							<ThemeIcon size='sm' variant='light' color='gray' radius='md'>
								<Icon size={14} />
							</ThemeIcon>
							<Text size='sm'>{t(`kinds.${kind}`)}</Text>
						</Group>
					);
				},
			},
			{
				accessorKey: 'title',
				header: t('table.columns.message'),
				size: 360,
				cell: ({ row }) => (
					<div>
						<Text size='sm' fw={row.original.read ? 400 : 600}>
							{row.original.title}
						</Text>
						<Text size='xs' c='dimmed' lineClamp={1}>
							{row.original.message}
						</Text>
					</div>
				),
			},
			...(showAbout
				? [
						{
							id: 'about',
							accessorFn: (n: AgentNotification) =>
								agentNameOf(n.agentId) ?? '',
							header: t('table.columns.about'),
							size: 150,
							cell: ({ row }: { row: { original: AgentNotification } }) => (
								<Text size='sm' c='dimmed'>
									{agentNameOf(row.original.agentId) ?? '—'}
								</Text>
							),
						} as BaseTableColumnDef<AgentNotification>,
					]
				: []),
			{
				id: 'source',
				accessorFn: (n) =>
					personNameOf(n.sourceId) ?? t(`sources.${n.sourceRole}`),
				header: t('table.columns.source'),
				size: 150,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{personNameOf(row.original.sourceId) ??
							t(`sources.${row.original.sourceRole}`)}
					</Text>
				),
			},
			{
				id: 'priority',
				accessorFn: (n) => PRIORITY_RANK[n.priority],
				header: t('table.columns.priority'),
				size: 100,
				enableSorting: true,
				cell: ({ row }) => {
					const priority = row.original.priority;
					const tone = PRIORITY_TONE[priority];
					return tone ? (
						<Badge variant='light' size='sm' color={tone}>
							{t(`priorities.${priority}`)}
						</Badge>
					) : (
						<Text size='sm' c='dimmed'>
							{t(`priorities.${priority}`)}
						</Text>
					);
				},
			},
			{
				accessorKey: 'createdAt',
				header: t('table.columns.date'),
				size: 130,
				enableSorting: true,
				cell: ({ row }) => (
					<Tooltip
						label={dayjs(row.original.createdAt).format('YYYY-MM-DD HH:mm')}
					>
						<Text size='sm' c='dimmed'>
							{fromMockNow(row.original.createdAt)}
						</Text>
					</Tooltip>
				),
			},
			{
				id: 'actions',
				header: '',
				size: 90,
				cell: ({ row }) => {
					const notification = row.original;
					return (
						<div className={styles.rowActions}>
							{archivedView ? (
								<Tooltip label={t('table.actions.restore')}>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='md'
										aria-label={t('table.actions.restore')}
										onClick={(event) => {
											event.stopPropagation();
											onRestore?.(notification.id);
										}}
									>
										<IconArrowBackUp size={16} />
									</ActionIcon>
								</Tooltip>
							) : (
								<>
									<Tooltip
										label={t(
											notification.read
												? 'table.actions.markUnread'
												: 'table.actions.markRead'
										)}
									>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='md'
											aria-label={t(
												notification.read
													? 'table.actions.markUnread'
													: 'table.actions.markRead'
											)}
											onClick={(event) => {
												event.stopPropagation();
												onToggleRead(notification);
											}}
										>
											{notification.read ? (
												<IconMail size={16} />
											) : (
												<IconMailOpened size={16} />
											)}
										</ActionIcon>
									</Tooltip>
									<Tooltip label={t('table.actions.archive')}>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='md'
											aria-label={t('table.actions.archive')}
											onClick={(event) => {
												event.stopPropagation();
												onArchive(notification.id);
											}}
										>
											<IconArchive size={16} />
										</ActionIcon>
									</Tooltip>
								</>
							)}
						</div>
					);
				},
			},
		],
		[t, showAbout, archivedView, onToggleRead, onArchive, onRestore]
	);

	return (
		<BaseTable<AgentNotification>
			data={notifications}
			columns={columns}
			getRowId={(row) => row.id}
			emptyMessage={t('table.empty')}
			initialSort={[{ id: 'createdAt', desc: true }]}
			onRowClick={
				archivedView ? undefined : (notification) => onView(notification.id)
			}
			getRowClassName={(row) =>
				[styles.row, row.original.read ? '' : styles.unreadRow]
					.filter(Boolean)
					.join(' ')
			}
			className={styles.inboxTable}
			rootProps={{ className: styles.tableRoot }}
			enablePagination
			showPaginationControls
			pageSize={10}
		/>
	);
};

export default AgentInboxTable;
