import { useMemo } from 'react';
import { useClientConfigs } from '~/queries/useClientConfigs';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';

export function useFilteredClientConfigs() {
	const { data: allConfigs = [], isLoading } = useClientConfigs();
	const { filters, pagination, setPagination } = useClientConfigsStore();

	// Apply filters and sorting (all client-side)
	const filteredAndSortedConfigs = useMemo(() => {
		let result = [...allConfigs];

		// Apply search filter
		if (filters.search.trim()) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(config) =>
					config.name.toLowerCase().includes(searchLower) ||
					config.description.toLowerCase().includes(searchLower)
			);
		}

		// Apply type filter
		if (filters.type) {
			result = result.filter((config) => config.type === filters.type);
		}

		// Apply sorting
		result.sort((a, b) => {
			let comparison = 0;

			switch (filters.sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'description':
					comparison = a.description.localeCompare(b.description);
					break;
				case 'type':
					comparison = a.type.localeCompare(b.type);
					break;
				case 'updatedAt':
					comparison =
						new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
					break;
				default:
					comparison = 0;
			}

			return filters.sortOrder === 'desc' ? -comparison : comparison;
		});

		return result;
	}, [allConfigs, filters]);

	// Apply pagination
	const paginatedConfigs = useMemo(() => {
		const startIndex = (pagination.page - 1) * pagination.pageSize;
		const endIndex = startIndex + pagination.pageSize;
		return filteredAndSortedConfigs.slice(startIndex, endIndex);
	}, [filteredAndSortedConfigs, pagination.page, pagination.pageSize]);

	// Update total count in pagination
	useMemo(() => {
		if (filteredAndSortedConfigs.length !== pagination.total) {
			setPagination({
				...pagination,
				total: filteredAndSortedConfigs.length,
			});
		}
	}, [filteredAndSortedConfigs.length, pagination, setPagination]);

	return {
		configs: paginatedConfigs,
		totalConfigs: filteredAndSortedConfigs.length,
		allConfigsCount: allConfigs.length,
		isLoading,
	};
}
