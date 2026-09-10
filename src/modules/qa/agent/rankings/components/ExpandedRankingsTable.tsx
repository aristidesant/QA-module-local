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
import { REACTION_TYPES } from '~/models/qa/reactions';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import {
	AGENT_RANKINGS,
	type AgentRankingEntry,
} from '~/modules/qa/dashboard/mockData';
import {
	REACTION_ORDER,
	buildRankIndex,
	getReactionsTotal,
} from '../gamification';
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
	/** Leaderboard rows. Defaults to the full mock roster. */
	data?: AgentRankingEntry[];
	/** Invoked when a row is clicked (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
}

/**
 * Full team leaderboard: every agent of the period with rank, score,
 * achievements, peer reactions, streak and rank velocity.
 *
 * Rows are virtualized (windowed) so the table stays smooth with 100+ agents
 * without pulling in an extra virtualization dependency.
 */
export const ExpandedRankingsTable: React.FC<ExpandedRankingsTableProps> = ({
	data = AGENT_RANKINGS,
	onRowClick,
}) => {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'rank', desc: false },
	]);

	/** Rank lookup so each row can read the score of the position below it. */
	const rankIndex = useMemo(() => buildRankIndex(data), [data]);

	const columns = useMemo<ColumnDef<AgentRankingEntry>[]>(
		() => [
			{
				accessorKey: 'rank',
				header: 'Rank',
				size: 80,
				cell: ({ row }) => {
					const { rank } = row.original;
					return (
						<Badge
							color={RANK_BADGE_COLORS[rank] ?? 'gray'}
							variant='light'
							radius='sm'
						>
							#{rank}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'agentName',
				header: 'Name',
				size: 200,
				cell: ({ row }) => (
					<Text size='sm' fw={500} lineClamp={1}>
						{row.original.agentName}
					</Text>
				),
			},
			{
				accessorKey: 'score',
				header: 'Score',
				size: 100,
				cell: ({ row }) => (
					<Text size='sm' fw={700} className={styles.score}>
						{row.original.score}
					</Text>
				),
			},
			{
				id: 'achievements',
				accessorFn: (entry) => entry.achievements?.length ?? 0,
				header: 'Achievements',
				size: 140,
				cell: ({ row }) => {
					const achievements = row.original.achievements ?? [];
					if (achievements.length === 0) return <EmptyCell />;

					const visible = achievements.slice(0, MAX_VISIBLE_ACHIEVEMENTS);
					const hidden = achievements.length - visible.length;

					return (
						<Group gap={4} wrap='nowrap'>
							{visible.map((badgeType, index) => {
								const catalog = PREDEFINED_BADGE_CATALOGS[badgeType];
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
				accessorFn: getReactionsTotal,
				header: 'Reactions',
				size: 260,
				cell: ({ row }) => {
					const { reactionsTotals } = row.original;
					if (!reactionsTotals) return <EmptyCell />;

					return (
						<Group gap='xs' wrap='nowrap'>
							{REACTION_ORDER.map((type) => {
								const count = reactionsTotals[type];
								if (!count) return null;

								const config = REACTION_TYPES[type];
								return (
									<Tooltip key={type} label={config.label} withArrow>
										<Text size='sm' fw={500} className={styles.reaction}>
											<span aria-hidden>{config.emoji}</span> {count}
										</Text>
									</Tooltip>
								);
							})}
						</Group>
					);
				},
			},
		],
		[rankIndex]
	);

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
