import { useTranslation } from 'react-i18next';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Badge,
	Group,
	Table,
	Text,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import {
	IconArrowsUpDown,
	IconChevronDown,
	IconChevronUp,
} from '@tabler/icons-react';
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from '@tanstack/react-table';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { type AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { buildRankIndex } from '../gamification';
import { WinnerBadge } from './WinnerBadge';
import LeaderboardReactions from './LeaderboardReactions';
import { useLeaderboardStatus } from '../hooks/useLeaderboardStatus';
import styles from './ExpandedRankingsTable.module.css';

/** Fixed row height used by the virtualizer (must match `.row` height in the CSS module). */
const ROW_HEIGHT = 52;
/** Extra rows rendered above/below the viewport to avoid blank space while scrolling. */
const OVERSCAN = 8;
/** Fallback viewport height before the scroll container has been measured. */
const DEFAULT_VIEWPORT_HEIGHT = 560;
/** Max number of achievement badges rendered per row. */
const MAX_VISIBLE_ACHIEVEMENTS = 3;

const RANK_BADGE_COLORS: Record<number, string> = {
	1: 'yellow',
	2: 'gray',
	3: 'orange',
};

const EmptyCell: React.FC = () => (
	<Text size='sm' c='dimmed'>
		—
	</Text>
);

export interface ExpandedRankingsTableProps {
	/** Leaderboard rows, computed from the active ranking program. */
	data: AgentRankingEntry[];
	/** Highlights the row of the agent viewing their own leaderboard. */
	currentAgentId?: string;
	/** Renders the score with the ranking metric's unit. */
	formatScore?: (score: number) => string;
	/** Invoked when a row is clicked (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
	/** Drops the peer-reactions column — for read-only views (e.g. a supervisor's dashboard). */
	hideReactions?: boolean;
}

/**
 * Full team leaderboard: every agent of the period with rank, score,
 * achievements, peer reactions, streak and rank velocity.
 *
 * Rows are virtualized (windowed) so the table stays smooth with 100+ agents
 * without pulling in an extra virtualization dependency.
 */
export const ExpandedRankingsTable: React.FC<ExpandedRankingsTableProps> = ({
	data,
	currentAgentId,
	formatScore,
	onRowClick,
	hideReactions,
}) => {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'rank', desc: false },
	]);

	const { t } = useTranslation('qa.rankings');
	const { isCompleted } = useLeaderboardStatus();
	const badges = useTriggerRulesStore((state) => state.badges);

	/** Rank lookup so each row can read the score of the position below it. */
	const rankIndex = useMemo(() => buildRankIndex(data), [data]);

	const columns = useMemo<ColumnDef<AgentRankingEntry>[]>(() => {
		const allColumns: (ColumnDef<AgentRankingEntry> & { id?: string })[] = [
			{
				accessorKey: 'rank',
				header: t('table.rank'),
				size: 80,
				cell: ({ row }) => {
					const { rank } = row.original;
					if (rank === 0) {
						return (
							<Badge color='gray' variant='light' radius='sm'>
								{t('drawer.unranked')}
							</Badge>
						);
					}
					return (
						<Group gap={4} wrap='nowrap'>
							<Badge
								color={RANK_BADGE_COLORS[rank] ?? 'gray'}
								variant='light'
								radius='sm'
							>
								#{rank}
							</Badge>
							<WinnerBadge isWinner={isCompleted && rank === 1} />
						</Group>
					);
				},
			},
			{
				accessorKey: 'agentName',
				header: t('table.name'),
				size: 200,
				cell: ({ row }) => (
					<Text size='sm' fw={500} lineClamp={1}>
						{row.original.agentName}
					</Text>
				),
			},
			{
				accessorKey: 'score',
				header: t('table.score'),
				size: 150,
				cell: ({ row }) => {
					const { rank, score } = row.original;
					if (rank === 0) return <EmptyCell />;
					return (
						<Text size='sm' fw={700} className={styles.score}>
							{formatScore ? formatScore(score) : score}
						</Text>
					);
				},
			},
			{
				id: 'achievements',
				accessorFn: (entry) => entry.achievements?.length ?? 0,
				header: t('table.achievements'),
				size: 140,
				cell: ({ row }) => {
					const achievements = row.original.achievements ?? [];
					if (achievements.length === 0) return <EmptyCell />;

					const visible = achievements.slice(0, MAX_VISIBLE_ACHIEVEMENTS);
					const hidden = achievements.length - visible.length;

					return (
						<Group gap={4} wrap='nowrap'>
							{visible.map((badgeType, index) => {
								const badge = badges.find(
									(candidate) => candidate.id === badgeType
								);
								const catalog = badge ?? PREDEFINED_BADGE_CATALOGS[badgeType];
								return (
									<Tooltip
										key={`${badgeType}-${index}`}
										label={catalog?.name ?? badgeType}
										withArrow
									>
										<span
											className={styles.achievement}
											aria-label={catalog?.name ?? badgeType}
										>
											{catalog?.icon ?? '🏅'}
										</span>
									</Tooltip>
								);
							})}
							{hidden > 0 && (
								<Text size='xs' c='dimmed'>
									+{hidden}
								</Text>
							)}
						</Group>
					);
				},
			},
			{
				id: 'reactions',
				enableSorting: false,
				header: t('table.reactions'),
				size: 260,
				cell: ({ row }) => (
					<LeaderboardReactions
						agentId={row.original.agentId}
						agentName={row.original.agentName}
					/>
				),
			},
		];

		return hideReactions
			? allColumns.filter((column) => column.id !== 'reactions')
			: allColumns;
	}, [rankIndex, isCompleted, badges, formatScore, t, hideReactions]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => row.agentId,
		// Kept for the detail drawer added in a follow-up task.
		getRowCanExpand: () => true,
	});

	const rows = table.getRowModel().rows;

	// --- Virtualization ------------------------------------------------------
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		const measure = () =>
			setViewportHeight(element.clientHeight || DEFAULT_VIEWPORT_HEIGHT);
		measure();

		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(event.currentTarget.scrollTop);
	}, []);

	const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
	const endIndex = Math.min(
		rows.length,
		Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN
	);
	const virtualRows = rows.slice(startIndex, endIndex);
	const paddingTop = startIndex * ROW_HEIGHT;
	const paddingBottom = Math.max(0, (rows.length - endIndex) * ROW_HEIGHT);

	return (
		<div className={styles.root} ref={scrollRef} onScroll={handleScroll}>
			<Table
				className={styles.table}
				stickyHeader
				striped={false}
				highlightOnHover
			>
				<Table.Thead className={styles.thead}>
					<Table.Tr>
						{table.getHeaderGroups()[0].headers.map((header) => {
							const canSort = header.column.getCanSort();
							const sortDirection = header.column.getIsSorted();

							return (
								<Table.Th
									key={header.id}
									className={styles.th}
									data-sorted={sortDirection || undefined}
									// inline-style-allow: column width comes from the TanStack column definition
									style={{ width: header.getSize() }}
								>
									{canSort ? (
										<UnstyledButton
											className={styles.headerButton}
											onClick={header.column.getToggleSortingHandler()}
											aria-label={`Sort by ${String(header.column.columnDef.header)}`}
										>
											<span className={styles.headerLabel}>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
											</span>
											<span className={styles.sortIcon} aria-hidden>
												{sortDirection === 'asc' && <IconChevronUp size={14} />}
												{sortDirection === 'desc' && (
													<IconChevronDown size={14} />
												)}
												{!sortDirection && <IconArrowsUpDown size={14} />}
											</span>
										</UnstyledButton>
									) : (
										flexRender(
											header.column.columnDef.header,
											header.getContext()
										)
									)}
								</Table.Th>
							);
						})}
					</Table.Tr>
				</Table.Thead>

				<Table.Tbody className={styles.tbody}>
					{rows.length === 0 && (
						<Table.Tr>
							<Table.Td colSpan={columns.length} className={styles.emptyCell}>
								No rankings available for this period
							</Table.Td>
						</Table.Tr>
					)}

					{paddingTop > 0 && (
						<Table.Tr aria-hidden className={styles.spacerRow}>
							<Table.Td
								colSpan={columns.length}
								className={styles.spacerCell}
								// inline-style-allow: virtualization spacer height is computed at runtime
								style={{ height: paddingTop }}
							/>
						</Table.Tr>
					)}

					{virtualRows.map((row, index) => (
						<Table.Tr
							key={row.id}
							className={styles.row}
							data-current={
								row.original.agentId === currentAgentId || undefined
							}
							data-even={(startIndex + index) % 2 === 1 || undefined}
							data-clickable={onRowClick ? true : undefined}
							onClick={onRowClick ? () => onRowClick(row.original) : undefined}
						>
							{row.getVisibleCells().map((cell) => (
								<Table.Td key={cell.id} className={styles.td}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</Table.Td>
							))}
						</Table.Tr>
					))}

					{paddingBottom > 0 && (
						<Table.Tr aria-hidden className={styles.spacerRow}>
							<Table.Td
								colSpan={columns.length}
								className={styles.spacerCell}
								// inline-style-allow: virtualization spacer height is computed at runtime
								style={{ height: paddingBottom }}
							/>
						</Table.Tr>
					)}
				</Table.Tbody>
			</Table>
		</div>
	);
};

export default ExpandedRankingsTable;
