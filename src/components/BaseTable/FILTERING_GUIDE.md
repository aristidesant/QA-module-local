# BaseTable Filtering Implementation Guide

## Overview

BaseTable is now **self-contained** and handles filtering logic internally based on the `filterMode` prop. Developers can choose between client-side or server-side filtering without implementing the logic themselves.

## Client-Side Filtering (Automatic)

BaseTable handles filtering, sorting, and pagination automatically using TanStack Table.

```tsx
import BaseTable from '~/components/BaseTable';
import { useGetAllItems } from '~/queries/itemQueries';

function MyClientFilteredList() {
	const { data, isLoading } = useGetAllItems();

	return (
		<BaseTable
			data={data || []}
			columns={columns}
			isLoading={isLoading}
			filterMode='client'
			enableFiltering={true} // Enable built-in column filtering
			enablePagination={true} // Enable built-in pagination
		/>
	);
}
```

**What happens:**

- BaseTable automatically filters data based on column filters
- BaseTable automatically sorts data when headers are clicked
- BaseTable automatically paginates data
- All processing happens in the browser

## Server-Side Filtering (Manual Control)

BaseTable notifies parent when filters/sorting/pagination change, parent fetches new data from API.

```tsx
import { useState } from 'react';
import BaseTable from '~/components/BaseTable';
import { useGetItems } from '~/queries/itemQueries';

function MyServerFilteredList() {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sorting, setSorting] = useState([]);
	const [filters, setFilters] = useState([]);

	// API query with server-side params
	const { data, isLoading } = useGetItems({
		page,
		limit: pageSize,
		sortBy: sorting[0]?.id,
		sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC',
		filters: filters.reduce(
			(acc, f) => ({
				...acc,
				[f.id]: f.value,
			}),
			{}
		),
	});

	return (
		<BaseTable
			data={data?.items || []}
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
```

**What happens:**

- User clicks sort → `onSortingChange` called → you fetch new data
- User changes page → `onPaginationChange` called → you fetch new data
- User applies filter → `onFilterChange` called → you fetch new data
- BaseTable displays the data you provide

## Column Definitions with Filtering

Add filtering capabilities to columns:

```tsx
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Item>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		// Enable filtering for this column (client-side only)
		enableColumnFilter: true,
		filterFn: 'includesString', // Built-in filter function
	},
	{
		accessorKey: 'status',
		header: 'Status',
		enableColumnFilter: true,
		filterFn: (row, columnId, filterValue) => {
			// Custom filter function
			return row.getValue(columnId) === filterValue;
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		enableSorting: true,
		sortingFn: 'datetime',
	},
];
```

## Props Reference

### Common Props

- `data`: Array of data to display
- `columns`: Column definitions
- `filterMode`: `'client'` or `'server'` (default: `'client'`)
- `isLoading`: Show loading overlay
- `onRowClick`: Callback when row is clicked
- `density`: `'default'` or `'compact'`

### Client-Side Mode Props

- `enableFiltering`: Enable column filtering (default: `false`)
- `enablePagination`: Enable pagination (default: `false`)

### Server-Side Mode Props

- `pageCount`: Total number of pages from API
- `pageIndex`: Current page index
- `pageSize`: Items per page
- `onPaginationChange`: `(pageIndex, pageSize) => void`
- `onSortingChange`: `(sorting) => void`
- `onFilterChange`: `(filters) => void`

## Migration from Old BaseTable

**Before** (parent handled everything):

```tsx
const filtered = useMemo(() => data.filter(...), [data, filters]);
const paginated = useMemo(() => filtered.slice(...), [filtered, page]);
<BaseTable data={paginated} />
```

**After** (BaseTable handles it):

```tsx
<BaseTable
	data={data}
	filterMode='client'
	enableFiltering={true}
	enablePagination={true}
/>
```

## When to Use Each Mode

### Client-Side ✅

- Small to medium datasets (<1000 items)
- Instant filtering/sorting needed
- Simple filtering logic
- Offline-capable apps

### Server-Side ✅

- Large datasets (1000+ items)
- Complex database queries
- Multi-table joins
- Memory constraints
- Real-time data

## Examples

### Simple Client-Side Table

```tsx
<BaseTable data={items} columns={columns} filterMode='client' />
```

### Client-Side with Pagination

```tsx
<BaseTable
	data={items}
	columns={columns}
	filterMode='client'
	enablePagination={true}
	pageSize={20}
/>
```

### Full Server-Side Control

```tsx
<BaseTable
	data={serverData?.items || []}
	columns={columns}
	filterMode='server'
	pageCount={serverData?.totalPages}
	pageIndex={currentPage}
	onPaginationChange={handlePageChange}
	onSortingChange={handleSortChange}
/>
```
