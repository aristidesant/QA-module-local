import { useState, useEffect } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

interface UsePaginationProps {
	initialItemsPerPage?: number;
	searchDebounceMs?: number;
}

interface UsePaginationReturn {
	currentPage: number;
	itemsPerPage: number;
	searchValue: string;
	debouncedSearch: string;
	setCurrentPage: (page: number) => void;
	setItemsPerPage: (items: number) => void;
	setSearchValue: (value: string) => void;
	getApiParams: () => {
		limit: number;
		offset: number;
		firstName?: string;
	};
	calculateTotalPages: (total: number) => number;
}

export const usePagination = ({
	initialItemsPerPage = 10,
	searchDebounceMs = 500,
}: UsePaginationProps = {}): UsePaginationReturn => {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
	const [searchValue, setSearchValue] = useState('');

	// Debounce search to avoid too many API calls
	const [debouncedSearch] = useDebouncedValue(searchValue, searchDebounceMs);

	// Reset to first page when search or items per page changes
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch, itemsPerPage]);

	const getApiParams = () => {
		const offset = (currentPage - 1) * itemsPerPage;
		const params = {
			limit: itemsPerPage,
			offset,
		};

		if (debouncedSearch.trim()) {
			return { ...params, name: debouncedSearch.trim() };
		}

		return params;
	};

	const calculateTotalPages = (total: number): number => {
		return Math.ceil(total / itemsPerPage);
	};

	return {
		currentPage,
		itemsPerPage,
		searchValue,
		debouncedSearch,
		setCurrentPage,
		setItemsPerPage,
		setSearchValue,
		getApiParams,
		calculateTotalPages,
	};
};
