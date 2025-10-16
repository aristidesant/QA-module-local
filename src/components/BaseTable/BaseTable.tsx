import React from 'react';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	Row,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { Table, LoadingOverlay } from '@mantine/core';
import {
	IconChevronUp,
	IconChevronDown,
	IconArrowsUpDown,
} from '@tabler/icons-react';
import styles from './BaseTable.module.css';

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
}: BaseTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>(initialSort);

	const table = useReactTable<TData>({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
					{!hasData ? (
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
