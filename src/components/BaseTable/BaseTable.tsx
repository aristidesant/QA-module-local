import React from 'react';
import {
	ColumnDef,
	ColumnFiltersState,
	ColumnMeta,
	ExpandedState,
	PaginationState,
	Row,
	SortingState,
	Updater,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	Table,
	LoadingOverlay,
	Skeleton,
	Pagination,
	Group,
} from '@mantine/core';
import {
	IconChevronUp,
	IconChevronDown,
	IconArrowsUpDown,
	IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './BaseTable.module.css';

export type FilterMode = 'client' | 'server';

type BaseTableColumnMetaBase = {
	headerClassName?: string;
	cellClassName?: string;
};

type BaseTableColumnMeta<TData> = ColumnMeta<TData, unknown> &
	BaseTableColumnMetaBase;

export type BaseTableColumnDef<TData> = ColumnDef<TData, unknown> & {
	meta?: BaseTableColumnMeta<TData>;
};

export type BaseTableProps<TData> = {
	data: TData[];
	selectedRowId?: string | number | null;
	getRowId?: (row: TData) => string | number;
	columns: BaseTableColumnDef<TData>[];
	initialSort?: SortingState;
	onRowClick?: (row: TData) => void;
	className?: string;
	density?: 'default' | 'compact';
	getRowClassName?: (row: Row<TData>) => string | undefined;
	isLoading?: boolean;
	emptyMessage?: string;
	skeletonRowsCount?: number;
	/**
	 * Filter mode determines how data is filtered:
	 * - 'client': BaseTable handles filtering/sorting/pagination internally using TanStack Table
	 * - 'server': Parent component handles filtering via API, BaseTable just displays the data
	 */
	filterMode?: FilterMode;
	/**
	 * Server-side pagination info (only used when filterMode='server')
	 */
	pageCount?: number;
	/**
	 * Current page for server-side pagination (only used when filterMode='server')
	 */
	pageIndex?: number;
	/**
	 * Page size for server-side pagination (only used when filterMode='server')
	 */
	pageSize?: number;
	/**
	 * Callback when pagination changes (only used when filterMode='server')
	 */
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
	/**
	 * Callback when sorting changes (only used when filterMode='server')
	 */
	onSortingChange?: (sorting: SortingState) => void;
	/**
	 * Callback when filters change (only used when filterMode='server')
	 */
	onFilterChange?: (filters: ColumnFiltersState) => void;
	/**
	 * Enable client-side pagination (only used when filterMode='client')
	 */
	enablePagination?: boolean;
	/**
	 * Enable client-side filtering (only used when filterMode='client')
	 */
	enableFiltering?: boolean;
	/**
	 * Enable expandable rows
	 */
	enableExpanding?: boolean;
	/**
	 * Render function for expanded row content
	 */
	renderExpandedRow?: (row: TData) => React.ReactNode;
	/**
	 * Callback when row expansion changes
	 */
	onExpandedChange?: (expandedRowIds: string[]) => void;
	/**
	 * Initially expanded row IDs
	 */
	initialExpandedRows?: string[];
	/**
	 * Render built-in pagination controls (client/server)
	 */
	showPaginationControls?: boolean;
};

function BaseTable<TData>({
	data,
	selectedRowId,
	getRowId,
	columns,
	initialSort = [],
	onRowClick,
	className,
	density = 'default',
	getRowClassName,
	isLoading = false,
	emptyMessage,
	skeletonRowsCount = 5,
	filterMode = 'client',
	pageCount,
	pageIndex = 0,
	pageSize = 10,
	onPaginationChange,
	onSortingChange: onSortingChangeProp,
	onFilterChange,
	enablePagination = false,
	enableFiltering = false,
	enableExpanding = false,
	renderExpandedRow,
	onExpandedChange,
	initialExpandedRows = [],
	showPaginationControls = false,
}: BaseTableProps<TData>) {
	const { t } = useTranslation();
	const [sorting, setSorting] = React.useState<SortingState>(initialSort);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex,
		pageSize,
	});
	const [expanded, setExpanded] = React.useState<ExpandedState>(
		initialExpandedRows.reduce((acc, id) => ({ ...acc, [id]: true }), {})
	);

	// Handle sorting changes
	const handleSortingChange = React.useCallback(
		(updater: Updater<SortingState>) => {
			setSorting(updater);
			if (filterMode === 'server' && onSortingChangeProp) {
				const newSorting =
					typeof updater === 'function' ? updater(sorting) : updater;
				onSortingChangeProp(newSorting);
			}
		},
		[filterMode, onSortingChangeProp, sorting]
	);

	// Handle filter changes
	const handleFilterChange = React.useCallback(
		(updater: Updater<ColumnFiltersState>) => {
			setColumnFilters(updater);
			if (filterMode === 'server' && onFilterChange) {
				const newFilters =
					typeof updater === 'function' ? updater(columnFilters) : updater;
				onFilterChange(newFilters);
			}
		},
		[filterMode, onFilterChange, columnFilters]
	);

	// Handle pagination changes
	const handlePaginationChange = React.useCallback(
		(updater: Updater<PaginationState>) => {
			setPagination(updater);
			if (filterMode === 'server' && onPaginationChange) {
				const newPagination =
					typeof updater === 'function' ? updater(pagination) : updater;
				onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
			}
		},
		[filterMode, onPaginationChange, pagination]
	);

	React.useEffect(() => {
		if (filterMode !== 'server') return;
		if (
			pagination.pageIndex !== pageIndex ||
			pagination.pageSize !== pageSize
		) {
			setPagination({ pageIndex, pageSize });
		}
	}, [
		filterMode,
		pageIndex,
		pageSize,
		pagination.pageIndex,
		pagination.pageSize,
	]);

	// Handle expanded state changes
	const handleExpandedChange = React.useCallback(
		(updater: Updater<ExpandedState>) => {
			setExpanded(updater);
			if (onExpandedChange) {
				const newExpanded =
					typeof updater === 'function' ? updater(expanded) : updater;
				const expandedRecord =
					typeof newExpanded === 'boolean' ? {} : newExpanded;
				const expandedIds = Object.keys(expandedRecord).filter(
					(key) => expandedRecord[key]
				);
				onExpandedChange(expandedIds);
			}
		},
		[onExpandedChange, expanded]
	);

	const table = useReactTable<TData>({
		data,
		columns,
		state: {
			sorting,
			...(filterMode === 'client' && enableFiltering ? { columnFilters } : {}),
			...(enablePagination ? { pagination } : {}),
			...(enableExpanding ? { expanded } : {}),
		},
		onSortingChange: handleSortingChange,
		...(filterMode === 'client' && enableFiltering
			? { onColumnFiltersChange: handleFilterChange }
			: {}),
		...(enablePagination ? { onPaginationChange: handlePaginationChange } : {}),
		...(enableExpanding ? { onExpandedChange: handleExpandedChange } : {}),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(filterMode === 'client' && enableFiltering
			? { getFilteredRowModel: getFilteredRowModel() }
			: {}),
		...(enablePagination && filterMode === 'client'
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
		...(enableExpanding ? { getExpandedRowModel: getExpandedRowModel() } : {}),
		...(filterMode === 'server' && pageCount ? { pageCount } : {}),
		manualPagination: filterMode === 'server',
		manualFiltering: filterMode === 'server',
		manualSorting: filterMode === 'server',
	});

	const hasData = data && data.length > 0;
	const displayMessage = emptyMessage || t('status.noData');
	const shouldShowPagination = enablePagination && showPaginationControls;

	return (
		<div className={`${styles.root} ${className ?? ''}`}>
			<LoadingOverlay visible={isLoading} />
			<Table className={styles.table} striped highlightOnHover>
				<Table.Thead className={styles.thead}>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Tr key={headerGroup.id}>
							{enableExpanding && renderExpandedRow && (
								<Table.Th
									className={[
										styles.th,
										styles.expandCell,
										density === 'compact' ? styles.compactTh : '',
									]
										.filter(Boolean)
										.join(' ')}
								>
									{/* Empty header for expand column */}
								</Table.Th>
							)}
							{headerGroup.headers.map((header) => (
								<Table.Th
									key={header.id}
									className={[
										styles.th,
										density === 'compact' ? styles.compactTh : '',
										header.column.getCanSort() ? styles.sortable : '',
										(
											header.column.columnDef.meta as
												| BaseTableColumnMeta<TData>
												| undefined
										)?.headerClassName || '',
									]
										.filter(Boolean)
										.join(' ')}
									data-sorted={header.column.getIsSorted() ? 'true' : undefined}
									onClick={header.column.getToggleSortingHandler()}
								>
									{header.isPlaceholder ? null : (
										<div className={styles.headerContent}>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{header.column.getCanSort() && (
												<div className={styles.sortIcon}>
													{header.column.getIsSorted() === 'asc' ? (
														<IconChevronUp size={16} />
													) : header.column.getIsSorted() === 'desc' ? (
														<IconChevronDown size={16} />
													) : (
														<IconArrowsUpDown size={16} />
													)}
												</div>
											)}
										</div>
									)}
								</Table.Th>
							))}
						</Table.Tr>
					))}
				</Table.Thead>
				<Table.Tbody className={styles.tbody}>
					{isLoading ? (
						Array.from({ length: skeletonRowsCount }).map((_, index) => (
							<Table.Tr key={`skeleton-${index}`}>
								{table.getAllColumns().map((column) => (
									<Table.Td
										key={`skeleton-${index}-${column.id}`}
										className={[
											styles.td,
											density === 'compact' ? styles.compactTd : '',
										]
											.filter(Boolean)
											.join(' ')}
									>
										<Skeleton height={20} />
									</Table.Td>
								))}
							</Table.Tr>
						))
					) : !hasData ? (
						<Table.Tr>
							<Table.Td
								colSpan={
									table.getAllColumns().length +
									(enableExpanding && renderExpandedRow ? 1 : 0)
								}
								className={styles.emptyRow}
							>
								{displayMessage}
							</Table.Td>
						</Table.Tr>
					) : (
						table.getRowModel().rows.map((row) => {
							const rowId = getRowId?.(row.original);
							const isSelected =
								selectedRowId != null &&
								rowId != null &&
								rowId === selectedRowId;
							return (
								<React.Fragment key={row.id}>
									<Table.Tr
										onClick={() => {
											if (enableExpanding && renderExpandedRow) {
												row.toggleExpanded();
											}
											onRowClick?.(row.original);
										}}
										className={[
											getRowClassName?.(row),
											isSelected ? styles.selectedRow : '',
											enableExpanding && renderExpandedRow
												? styles.expandableRow
												: '',
										]
											.filter(Boolean)
											.join(' ')}
									>
										{enableExpanding && renderExpandedRow && (
											<Table.Td
												className={[
													styles.td,
													styles.expandCell,
													density === 'compact' ? styles.compactTd : '',
												]
													.filter(Boolean)
													.join(' ')}
												onClick={(e) => {
													e.stopPropagation();
													row.toggleExpanded();
												}}
											>
												<div className={styles.expandIcon}>
													<IconChevronRight
														size={16}
														className={
															row.getIsExpanded()
																? styles.expandIconRotated
																: ''
														}
													/>
												</div>
											</Table.Td>
										)}
										{row.getVisibleCells().map((cell) => (
											<Table.Td
												key={cell.id}
												className={[
													styles.td,
													density === 'compact' ? styles.compactTd : '',
													(
														cell.column.columnDef.meta as
															| BaseTableColumnMeta<TData>
															| undefined
													)?.cellClassName || '',
												]
													.filter(Boolean)
													.join(' ')}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</Table.Td>
										))}
									</Table.Tr>
									{enableExpanding &&
										renderExpandedRow &&
										row.getIsExpanded() && (
											<Table.Tr className={styles.expandedRow}>
												<Table.Td
													colSpan={table.getAllColumns().length + 1}
													className={styles.expandedContent}
												>
													{renderExpandedRow(row.original)}
												</Table.Td>
											</Table.Tr>
										)}
								</React.Fragment>
							);
						})
					)}
				</Table.Tbody>
			</Table>
			{shouldShowPagination ? (
				<Group
					justify='space-between'
					align='center'
					className={styles.pagination}
				>
					<Pagination
						withEdges
						size='sm'
						value={table.getState().pagination.pageIndex + 1}
						total={table.getPageCount()}
						onChange={(page) => table.setPageIndex(page - 1)}
					/>
				</Group>
			) : null}
		</div>
	);
}

export default BaseTable;
