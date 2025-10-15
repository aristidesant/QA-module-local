import { useMemo, useEffect } from 'react';
import { useClientConfigs } from '~/queries/useClientConfigs';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';

export function useFilteredClientConfigs() {
	const { filters, pagination, setPagination } = useClientConfigsStore();

	// Build API params with pagination
	const apiParams = useMemo(() => {
		return {
			limit: pagination.pageSize,
			offset: (pagination.page - 1) * pagination.pageSize,
		};
	}, [pagination.page, pagination.pageSize]);

	// Fetch data with server-side pagination
	const { data: response, isLoading } = useClientConfigs(apiParams);

	const allConfigs = response?.configs || [];
	const serverTotal = response?.total || 0;

	// Apply client-side filters and sorting
	const filteredAndSortedConfigs = useMemo(() => {
		let result = [...allConfigs];

		// Apply search filter (client-side since backend doesn't support it)
		if (filters.search.trim()) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(config) =>
					config.name.toLowerCase().includes(searchLower) ||
					config.description.toLowerCase().includes(searchLower)
			);
		}

		// Apply type filter (client-side)
		if (filters.type) {
			result = result.filter((config) => config.type === filters.type);
		}

		// Apply sorting (client-side)
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

	// Update pagination total from server when data changes
	useEffect(() => {
		if (serverTotal !== pagination.total) {
			setPagination({
				...pagination,
				total: serverTotal,
			});
		}
	}, [serverTotal, pagination, setPagination]);

	return {
		configs: filteredAndSortedConfigs,
		totalConfigs: serverTotal,
		allConfigsCount: serverTotal,
		isLoading,
	};
}
