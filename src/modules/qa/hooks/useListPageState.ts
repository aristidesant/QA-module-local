import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

/** Server-side sort params sent to qa-backend (sortBy/orderBy). */
export type QaListSortOrder = 'ASC' | 'DESC';
export interface QaListSort {
	field: string;
	order: QaListSortOrder;
}

export interface UseListPageStateOptions {
	initialSort?: QaListSort;
	initialPageSize?: string;
	searchDebounceMs?: number;
}

/**
 * Shared pagination/sort/search scaffolding for list pages. Matches the
 * behavior every list page implemented by hand: changing the search text,
 * page size, or sort resets the page to 1 synchronously (on keystroke, not
 * on debounce settle); extra page-local filters call `resetPage()` in their
 * own onChange handlers.
 */
export function useListPageState(options: UseListPageStateOptions = {}) {
	const {
		initialSort = { field: 'createdAt', order: 'DESC' },
		initialPageSize = '10',
		searchDebounceMs = 300,
	} = options;

	const [page, setPage] = useState(1);
	const [pageSize, setPageSizeState] = useState(initialPageSize);
	const [search, setSearchState] = useState('');
	const [debouncedSearch] = useDebouncedValue(search, searchDebounceMs);
	const [sort, setSortState] = useState<QaListSort>(initialSort);

	const limit = Number(pageSize);

	const setPageSize = (value: string) => {
		setPageSizeState(value);
		setPage(1);
	};

	const setSearch = (value: string) => {
		setSearchState(value);
		setPage(1);
	};

	const setSort = (next: QaListSort) => {
		setSortState(next);
		setPage(1);
	};

	const resetPage = () => setPage(1);

	const getTotalPages = (total: number) =>
		Math.max(1, Math.ceil(total / limit));

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		limit,
		offset: (page - 1) * limit,
		search,
		setSearch,
		debouncedSearch,
		sort,
		setSort,
		resetPage,
		getTotalPages,
	};
}
