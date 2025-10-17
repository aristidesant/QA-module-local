# BaseTable - Self-Contained Filtering

## ✅ Now BaseTable handles filtering internally!

### CLIENT-SIDE MODE

Developers just pass data and enable features:

```tsx
<BaseTable
	data={allData}
	columns={columns}
	filterMode='client'
	enableFiltering={true}
	enablePagination={true}
/>
```

**BaseTable automatically:**

- Filters data based on column filters
- Sorts data when headers clicked
- Paginates data
- No callbacks needed!

### SERVER-SIDE MODE

Developers provide callbacks, BaseTable notifies on changes:

```tsx
const [page, setPage] = useState(0);
const [sorting, setSorting] = useState<SortingState>([]);

<BaseTable
	data={apiData}
	columns={columns}
	filterMode='server'
	pageCount={totalPages}
	pageIndex={page}
	onPaginationChange={(newPage, newSize) => {
		setPage(newPage);
		// Fetch new data from API
	}}
	onSortingChange={(newSorting) => {
		setSorting(newSorting);
		// Fetch new data from API
	}}
/>;
```

**BaseTable:**

- Calls callbacks when user interacts
- Parent fetches new data
- BaseTable displays it

## Key Benefits

1. **Self-Contained**: BaseTable handles the logic internally
2. **Easy to Use**: Other developers don't need to implement filtering themselves
3. **Flexible**: Choose client or server mode via prop
4. **Type-Safe**: Full TypeScript support
5. **Consistent**: Same API across all tables in the app

## Migration Guide

**Old way** (parent handles everything):

```tsx
const filtered = useMemo(() => data.filter(...), []);
const paginated = useMemo(() => filtered.slice(...), []);
<BaseTable data={paginated} />
```

**New way** (BaseTable handles it):

```tsx
<BaseTable
	data={data}
	filterMode='client'
	enableFiltering={true}
	enablePagination={true}
/>
```

Much simpler! 🎉
