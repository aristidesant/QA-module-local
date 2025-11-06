import { useState, useEffect, useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

export interface ContactFilters {
	name: string;
	email: string;
	phone: string;
}

export interface UseContactFiltersProps {
	onFiltersChange?: (filters: ContactFilters) => void;
	debounceMs?: number;
}

export interface UseContactFiltersReturn {
	filters: ContactFilters;
	debouncedFilters: ContactFilters;
	setFilter: (key: keyof ContactFilters, value: string) => void;
	setFilters: (filters: ContactFilters) => void;
	clearFilters: () => void;
	hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: ContactFilters = {
	name: '',
	email: '',
	phone: '',
};

export const useContactFilters = ({
	onFiltersChange,
	debounceMs = 500,
}: UseContactFiltersProps = {}): UseContactFiltersReturn => {
	const [filters, setFiltersState] = useState<ContactFilters>(DEFAULT_FILTERS);

	// Debounce filters to avoid too many API calls
	const [debouncedFilters] = useDebouncedValue(filters, debounceMs);

	// Notify parent when debounced filters change
	useEffect(() => {
		onFiltersChange?.(debouncedFilters);
	}, [debouncedFilters, onFiltersChange]);

	// Set a single filter
	const setFilter = (key: keyof ContactFilters, value: string) => {
		setFiltersState((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Set all filters at once
	const setFilters = (newFilters: ContactFilters) => {
		setFiltersState(newFilters);
	};

	// Clear all filters
	const clearFilters = () => {
		setFiltersState(DEFAULT_FILTERS);
	};

	// Check if any filters are active
	const hasActiveFilters = useMemo(() => {
		return !!(filters.name || filters.email || filters.phone);
	}, [filters]);

	return {
		filters,
		debouncedFilters,
		setFilter,
		setFilters,
		clearFilters,
		hasActiveFilters,
	};
};
