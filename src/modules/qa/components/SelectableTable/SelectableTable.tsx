import { Radio, Skeleton, Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import classes from './SelectableTable.module.css';

export interface SelectableTableProps<TData> {
	columns: BaseTableColumnDef<TData>[];
	data: TData[];
	getRowKey: (row: TData) => string;
	selectedKey: string | null;
	onSelect: (row: TData) => void;
	isLoading?: boolean;
	loadingRowCount?: number;
	emptyState?: ReactNode;
	selectLabel?: (row: TData) => string;
}

/**
 * Single-selection table built on top of {@link BaseTable}. Prepends a radio
 * column and highlights the selected row; clicking anywhere on a row selects it.
 * Search, pagination and result count are owned by the parent.
 */
export default function SelectableTable<TData>({
	columns,
	data,
	getRowKey,
	selectedKey,
	onSelect,
	isLoading = false,
	loadingRowCount = 5,
	emptyState,
	selectLabel,
}: SelectableTableProps<TData>) {
	if (isLoading) {
		return (
			<Stack gap='xs'>
				{Array.from({ length: loadingRowCount }).map((_, index) => (
					<Skeleton height={44} key={index} radius='sm' />
				))}
			</Stack>
		);
	}

	if (data.length === 0) {
		return <>{emptyState}</>;
	}

	const selectColumn: BaseTableColumnDef<TData> = {
		id: '__select',
		header: '',
		enableSorting: false,
		cell: ({ row }) => {
			const key = getRowKey(row.original);

			return (
				<Radio
					aria-label={selectLabel?.(row.original)}
					checked={key === selectedKey}
					readOnly
					size='sm'
					value={key}
				/>
			);
		},
	};

	return (
		<BaseTable<TData>
			columns={[selectColumn, ...columns]}
			data={data}
			getRowClassName={(row) =>
				getRowKey(row.original) === selectedKey
					? classes.selectedRow
					: undefined
			}
			getRowId={getRowKey}
			onRowClick={onSelect}
		/>
	);
}
