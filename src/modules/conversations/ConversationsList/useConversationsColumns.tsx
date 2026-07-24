import { useMemo, type MouseEvent } from 'react';
import {
	ActionIcon,
	Badge,
	CopyButton,
	Group,
	Loader,
	Text,
	Tooltip,
} from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import {
	IconCheck,
	IconCopy,
	IconPlayerTrackNext,
	IconRefresh,
} from '@tabler/icons-react';
import type { ConversationListItem } from '~/models/ConversationsModels';
import { useTranslation } from 'react-i18next';
import { getConversationActionDefinition } from '../ConversationDetails/ConversationActions/ConversationActions.helpers';
import styles from './ConversationsList.module.css';

dayjs.extend(relativeTime);
dayjs.extend(timezone);

type ConversationColumnsOptions = {
	canExecuteConversations?: boolean;
	combineContactDetails?: boolean;
	onActionClick?: (
		event: MouseEvent<HTMLButtonElement>,
		conversation: ConversationListItem
	) => void;
	isActionLoading?: (conversation: ConversationListItem) => boolean;
};

export const useConversationsColumns = (
	userTimezone: string,
	hiddenColumns?: string[],
	options?: ConversationColumnsOptions
) => {
	const { t } = useTranslation(['conversations', 'common']);

	return useMemo<ColumnDef<ConversationListItem>[]>(() => {
		const formatZonedDate = (value?: string | null) => {
			if (!value) return null;
			const parsed = dayjs.utc(value);
			if (!parsed.isValid()) return null;
			return parsed.tz(userTimezone);
		};

		const normalizeConversationIdentifier = (
			value?: string | null
		): string | null => {
			if (!value) return null;

			const normalized = value.trim();
			if (!normalized || normalized === '-' || normalized === '—') {
				return null;
			}

			return normalized;
		};

		const renderIdentifier = (identifier?: string | null) => {
			const normalizedIdentifier = normalizeConversationIdentifier(identifier);

			if (!normalizedIdentifier) {
				return <Text size='xs'>—</Text>;
			}

			const visibleIdentifier =
				normalizedIdentifier.length > 8
					? `${normalizedIdentifier.slice(0, 8)}...`
					: normalizedIdentifier;

			return (
				<Group gap={4} wrap='nowrap' className={styles.identifierCell}>
					<Tooltip
						label={normalizedIdentifier}
						withArrow
						position='top-start'
						openDelay={100}
						withinPortal
					>
						<Text
							component='span'
							size='xs'
							fw={500}
							className={styles.identifierValue}
							tabIndex={0}
							title={normalizedIdentifier}
						>
							{visibleIdentifier}
						</Text>
					</Tooltip>
					<CopyButton value={normalizedIdentifier} timeout={1200}>
						{({ copied, copy }) => (
							<Tooltip
								label={
									copied ? t('list.columns.copiedId') : t('list.columns.copyId')
								}
								withArrow
								position='top'
								openDelay={100}
								withinPortal
							>
								<ActionIcon
									variant='subtle'
									color={copied ? 'teal' : 'gray'}
									size='xs'
									aria-label={t('list.columns.copyId')}
									className={styles.identifierCopyButton}
									onClick={(event) => {
										event.stopPropagation();
										copy();
									}}
								>
									{copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
								</ActionIcon>
							</Tooltip>
						)}
					</CopyButton>
				</Group>
			);
		};

		const resolveSimpleStatus = (status?: string | null) => {
			const rawStatus = status ?? 'unknown';
			const normalized = rawStatus.toLowerCase();

			if (
				normalized.includes('complete') ||
				normalized.includes('success') ||
				normalized.includes('done')
			) {
				return { color: 'green', label: t('list.status.done') };
			}
			if (normalized.includes('progress') || normalized.includes('running')) {
				return {
					color: 'blue',
					label: t('list.status.inProgress'),
				};
			}
			if (
				normalized.includes('failed') ||
				normalized.includes('error') ||
				normalized.includes('cancel')
			) {
				return { color: 'red', label: t('list.status.failed') };
			}
			if (
				normalized.includes('pending') ||
				normalized.includes('queued') ||
				normalized.includes('waiting') ||
				normalized.includes('initiated')
			) {
				return {
					color: 'yellow',
					label: t('list.status.pending'),
				};
			}
			return { color: 'gray', label: t('list.status.unknown') };
		};

		const formatDuration = (
			startDate?: string | null,
			endDate?: string | null,
			status?: string | null
		) => {
			if (!startDate) return '—';

			const start = dayjs.utc(startDate);
			if (!start.isValid()) return '—';

			// If no endDate and status is terminal (failed, error, cancelled), show N/A
			const normalizedStatus = (status ?? '').toLowerCase();
			const isTerminalStatus =
				normalizedStatus.includes('failed') ||
				normalizedStatus.includes('error') ||
				normalizedStatus.includes('cancel');

			if (!endDate && isTerminalStatus) {
				return '—';
			}

			// Only use current time for in-progress conversations
			const end = endDate ? dayjs.utc(endDate) : dayjs();
			const diffSeconds = end.diff(start, 'second');

			if (diffSeconds < 0) return '—';

			const days = Math.floor(diffSeconds / 86400);
			const hours = Math.floor((diffSeconds % 86400) / 3600);
			const minutes = Math.floor((diffSeconds % 3600) / 60);
			const seconds = diffSeconds % 60;

			const parts: string[] = [];
			if (days) parts.push(`${days}${t('units.day', { ns: 'common' })}`);
			if (hours) parts.push(`${hours}${t('units.hour', { ns: 'common' })}`);
			if (minutes)
				parts.push(`${minutes}${t('units.minute', { ns: 'common' })}`);
			if (!days && !hours && !minutes)
				parts.push(`${seconds}${t('units.second', { ns: 'common' })}`);

			return parts.join(' ') || '—';
		};

		const allColumns: ColumnDef<ConversationListItem>[] = [
			{
				id: 'identifier',
				header: t('list.columns.identifier'),
				size: 100,
				accessorFn: (row) =>
					normalizeConversationIdentifier(row.identifier) ?? '',
				enableSorting: false,
				cell: ({ row }) => renderIdentifier(row.original.identifier),
			},
			{
				id: 'contactName',
				header: options?.combineContactDetails
					? t('list.columns.contact')
					: t('list.columns.contactName'),
				size: options?.combineContactDetails ? 220 : undefined,
				accessorFn: (row) => row.contactName ?? '',
				enableSorting: true,
				cell: ({ row }) => (
					<div className={styles.contactCell}>
						<Text
							size='sm'
							fw={650}
							className={styles.contactName}
							lineClamp={1}
						>
							{row.original.contactName || t('list.unknownContact')}
						</Text>
						{options?.combineContactDetails && (
							<Text size='xs' className={styles.contactMeta} lineClamp={1}>
								{row.original.contactPhoneNumber ||
									t('overview.fallbacks.noPhone')}
							</Text>
						)}
					</div>
				),
			},
			{
				id: 'phoneNumber',
				header: t('list.columns.phoneNumber'),
				accessorFn: (row) => row.contactPhoneNumber ?? '',
				enableSorting: false,
				cell: ({ row }) => (
					<Text size='xs' fw={500} className={styles.phoneCell}>
						{row.original.contactPhoneNumber || '—'}
					</Text>
				),
			},
			{
				id: 'dispositionName',
				header: t('list.columns.outcome'),
				accessorFn: (row) => row?.dispositions?.dispositionName ?? '',
				enableSorting: true,
				cell: ({ row }) => {
					const contactOutcome =
						row.original.contactOutcome ??
						row.original.dispositions?.contactOutcome;
					const color =
						contactOutcome === 'EFFECTIVE'
							? 'green'
							: contactOutcome === 'NOT_EFFECTIVE'
								? 'orange'
								: contactOutcome === 'NO_CONTACT'
									? 'gray'
									: 'gray';
					return (
						<Badge
							color={color}
							size='xs'
							variant='light'
							radius='xl'
							className={styles.outcomeBadge}
						>
							{row.original.dispositions?.dispositionName ??
								t('overview.fallbacks.na')}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('list.columns.status'),
				cell: ({ getValue }) => {
					const { color, label } = resolveSimpleStatus(getValue<string>());
					return (
						<Badge
							color={color}
							size='sm'
							radius='xl'
							variant='light'
							leftSection={<span className={styles.statusDot} />}
							className={styles.statusBadge}
						>
							{label}
						</Badge>
					);
				},
				enableSorting: true,
			},
			{
				id: 'startDate',
				header: t('list.columns.when'),
				accessorFn: (row) => row.startDate || row.createdAt,
				enableSorting: true,
				sortingFn: (rowA, rowB) => {
					const rowADate = rowA.original.startDate || rowA.original.createdAt;
					const rowBDate = rowB.original.startDate || rowB.original.createdAt;
					if (!rowADate && !rowBDate) return 0;
					if (!rowADate) return 1;
					if (!rowBDate) return -1;
					return dayjs.utc(rowADate).diff(dayjs.utc(rowBDate));
				},
				cell: ({ row }) => {
					const value = row.original.startDate || row.original.createdAt;
					if (!value) return <Text size='xs'>—</Text>;

					const zoned = formatZonedDate(value);
					if (!zoned) return <Text size='xs'>—</Text>;

					const relative = zoned.fromNow();
					const absolute = zoned.format('MMM D, YYYY • HH:mm');

					return (
						<Tooltip
							label={t('list.columns.endedAt', {
								date: absolute,
								timezone: userTimezone,
							})}
						>
							<div className={styles.dateCell}>
								<Text size='xs' fw={600} className={styles.dateRelative}>
									{relative}
								</Text>
								<Text size='xs' c='dimmed' className={styles.dateAbsolute}>
									{zoned.format('MMM D · HH:mm')}
								</Text>
							</div>
						</Tooltip>
					);
				},
			},
			{
				id: 'duration',
				header: t('list.columns.duration'),
				enableSorting: false,
				cell: ({ row }) => {
					if (typeof row.original.duration === 'number') {
						const duration = Math.max(0, Math.floor(row.original.duration));
						const hours = Math.floor(duration / 3600);
						const minutes = Math.floor((duration % 3600) / 60);
						const seconds = duration % 60;
						const parts: string[] = [];
						if (hours)
							parts.push(`${hours}${t('units.hour', { ns: 'common' })}`);
						if (minutes)
							parts.push(`${minutes}${t('units.minute', { ns: 'common' })}`);
						if (!hours && !minutes)
							parts.push(`${seconds}${t('units.second', { ns: 'common' })}`);
						return (
							<Text size='xs' className={styles.duration}>
								{parts.join(' ')}
							</Text>
						);
					}

					const originalStartDate = row.original.startDate;
					const startDate = originalStartDate || row.original.createdAt;
					const endDate = row.original.endDate;

					// If no original startDate and no endDate, duration is not available
					if (!originalStartDate && !endDate) {
						return <Text size='xs'>—</Text>;
					}

					const duration = formatDuration(
						startDate,
						endDate,
						row.original.status
					);

					if (!endDate) {
						return (
							<Text size='xs' className={styles.duration}>
								{duration}
							</Text>
						);
					}

					const zonedEnd = formatZonedDate(endDate);
					const endTooltip = zonedEnd
						? t('list.columns.endedAt', {
								date: zonedEnd.format('MMM D, YYYY • HH:mm'),
								timezone: userTimezone,
							})
						: t('list.columns.ended');

					return (
						<Tooltip label={endTooltip}>
							<Text size='xs' className={styles.duration}>
								{duration}
							</Text>
						</Tooltip>
					);
				},
			},
		];

		if (options?.canExecuteConversations && options.onActionClick) {
			allColumns.push({
				id: 'actions',
				header: t('list.columns.actions', { defaultValue: 'Actions' }),
				enableSorting: false,
				size: 72,
				cell: ({ row }) => {
					const conversation = row.original;
					const action = getConversationActionDefinition(conversation, t);
					const isLoading = options.isActionLoading?.(conversation) ?? false;
					const ActionIconComponent =
						action.key === 'reprocess' ? IconPlayerTrackNext : IconRefresh;

					return (
						<Group gap={4} wrap='nowrap' justify='flex-end'>
							<Tooltip label={action.hint} withArrow>
								<ActionIcon
									variant='subtle'
									color={action.color}
									size='sm'
									aria-label={action.label}
									disabled={isLoading}
									onClick={(event) =>
										options.onActionClick?.(event, conversation)
									}
								>
									{isLoading ? (
										<Loader size={14} />
									) : (
										<ActionIconComponent size={16} />
									)}
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			});
		}

		const visibleColumns = options?.combineContactDetails
			? allColumns.filter((column) => column.id !== 'phoneNumber')
			: allColumns;

		if (!hiddenColumns || hiddenColumns.length === 0) return visibleColumns;
		const hiddenColumnIds = new Set(hiddenColumns);

		return visibleColumns.filter((col) => {
			const colId =
				(col as { id?: string }).id ??
				(col as { accessorKey?: string }).accessorKey ??
				'';
			return !hiddenColumnIds.has(colId);
		});
	}, [userTimezone, t, hiddenColumns, options]);
};
