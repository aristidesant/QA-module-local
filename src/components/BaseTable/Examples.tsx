import { useState } from 'react';
import {
	ColumnDef,
	SortingState,
	ColumnFiltersState,
} from '@tanstack/react-table';
import BaseTable from '~/components/BaseTable';
import { useGetAllAgents } from '~/queries/agentQueries';

type Agent = {
	id: string;
	name: string;
	type: 'INBOUND' | 'OUTBOUND';
	status: 'ACTIVE' | 'INACTIVE';
};

const columns: ColumnDef<Agent>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		enableColumnFilter: true,
	},
	{
		accessorKey: 'type',
		header: 'Type',
	},
	{
		accessorKey: 'status',
		header: 'Status',
	},
];

/**
 * CLIENT-SIDE FILTERING EXAMPLE
 * BaseTable handles everything automatically
 */
export function ClientSideExample() {
	// Fetch all data once
	const { data, isLoading } = useGetAllAgents();

	return (
		<BaseTable
			data={data?.data || []}
			columns={columns}
			isLoading={isLoading}
			filterMode='client'
			enableFiltering={true} // Enable column filtering
			enablePagination={true} // Enable pagination
			pageSize={10}
		/>
	);
}

/**
 * SERVER-SIDE FILTERING EXAMPLE
 * BaseTable notifies parent when filters/sorting/pagination change
 */
export function ServerSideExample() {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [filters, setFilters] = useState<ColumnFiltersState>([]);

	// Convert filters to API params
	const apiFilters = filters.reduce(
		(acc, f) => ({
			...acc,
			[f.id]: f.value,
		}),
		{} as Record<string, any>
	);

	// Fetch data from API with params
	// Note: Replace with your actual API query hook
	const { data, isLoading } = useGetAllAgents({
		page: page + 1, // API uses 1-based pagination
		limit: pageSize,
		sortBy: sorting[0]?.id,
		sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC',
		...apiFilters,
	});

	return (
		<BaseTable
			data={data?.data || []}
			columns={columns}
			isLoading={isLoading}
			filterMode='server'
			pageCount={data?.totalPages}
			pageIndex={page}
			pageSize={pageSize}
			onPaginationChange={(newPage, newPageSize) => {
				setPage(newPage);
				setPageSize(newPageSize);
			}}
			onSortingChange={setSorting}
			onFilterChange={setFilters}
		/>
	);
}

/**
 * COMPARISON
 *
 * Client-Side:
 * - Pass all data to BaseTable
 * - Enable filtering/pagination
 * - BaseTable handles everything
 * - No callbacks needed
 * - Best for <1000 items
 *
 * Server-Side:
 * - Pass current page data to BaseTable
 * - Provide callbacks for changes
 * - Parent fetches new data when needed
 * - Best for 1000+ items
 */
