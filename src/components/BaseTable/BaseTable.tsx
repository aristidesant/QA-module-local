import React from 'react';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	Row,
	SortingState,
	ColumnFiltersState,
	useReactTable,
} from '@tanstack/react-table';
import { Table, LoadingOverlay, Skeleton } from '@mantine/core';
import {
	IconChevronUp,
	IconChevronDown,
	IconArrowsUpDown,
} from '@tabler/icons-react';
import styles from './BaseTable.module.css';

export type FilterMode = 'client' | 'server';

export type BaseTableProps<TData> = {
	data: TData[];
	selectedKey?: string;
	columns: ColumnDef<TData, any>[];
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
};

function BaseTable<TData>({
	data,
	selectedKey,
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
}: BaseTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>(initialSort);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [pagination, setPagination] = React.useState({
		pageIndex,
		pageSize,
	});

	// Handle sorting changes
	const handleSortingChange = React.useCallback(
		(updater: any) => {
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
		(updater: any) => {
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
		(updater: any) => {
			setPagination(updater);
			if (filterMode === 'server' && onPaginationChange) {
				const newPagination =
					typeof updater === 'function' ? updater(pagination) : updater;
				onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
			}
		},
		[filterMode, onPaginationChange, pagination]
	);

	const table = useReactTable<TData>({
		data,
		columns,
		state: {
			sorting,
			...(filterMode === 'client' && enableFiltering ? { columnFilters } : {}),
			...(enablePagination ? { pagination } : {}),
		},
		onSortingChange: handleSortingChange,
		...(filterMode === 'client' && enableFiltering
			? { onColumnFiltersChange: handleFilterChange }
			: {}),
		...(enablePagination ? { onPaginationChange: handlePaginationChange } : {}),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(filterMode === 'client' && enableFiltering
			? { getFilteredRowModel: getFilteredRowModel() }
			: {}),
		...(enablePagination && filterMode === 'client'
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
		...(filterMode === 'server' && pageCount ? { pageCount } : {}),
		manualPagination: filterMode === 'server',
		manualFiltering: filterMode === 'server',
		manualSorting: filterMode === 'server',
	});

	const hasData = data && data.length > 0;
	const displayMessage = emptyMessage || 'No data available';

	return (
		<div className={`${styles.root} ${className ?? ''}`}>
			<LoadingOverlay visible={isLoading} />
			<Table className={styles.table} striped highlightOnHover>
				<Table.Thead className={styles.thead}>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<Table.Th
									key={header.id}
									className={[
										styles.th,
										density === 'compact' ? styles.compactTh : '',
										header.column.getCanSort() ? styles.sortable : '',
										// Allow column-level header className via meta
										(header.column.columnDef.meta as any)?.headerClassName ||
											'',
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
								colSpan={table.getAllColumns().length}
								className={styles.emptyRow}
							>
								{displayMessage}
							</Table.Td>
						</Table.Tr>
					) : (
						table.getRowModel().rows.map((row) => (
							<Table.Tr
								key={row.id}
								onClick={() => onRowClick?.(row.original)}
								className={`${getRowClassName?.(row)} ${row.original === selectedKey ? styles.selectedRow : ''}`}
							>
								{row.getVisibleCells().map((cell) => (
									<Table.Td
										key={cell.id}
										className={[
											styles.td,
											density === 'compact' ? styles.compactTd : '',
											(cell.column.columnDef.meta as any)?.cellClassName || '',
										]
											.filter(Boolean)
											.join(' ')}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</Table.Td>
								))}
							</Table.Tr>
						))
					)}
				</Table.Tbody>
			</Table>
		</div>
	);
}

export default BaseTable;
