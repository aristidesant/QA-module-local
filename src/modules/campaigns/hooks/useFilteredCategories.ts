import { useMemo, useState } from 'react';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import type { CategoryFilters } from '../CampaignCategoriesFilters';
import type { PaginationState } from '../CampaignCategoriesPagination';

interface UseCampaignCategoriesWithFiltersResult {
	categories: any[];
	filteredCategories: any[];
	pagination: PaginationState;
	filters: CategoryFilters;
	setPagination: (pagination: PaginationState) => void;
	setFilters: (filters: CategoryFilters) => void;
	paginatedCategories: any[];
	isLoading: boolean;
}

export const useCampaignCategoriesWithFilters =
	(): UseCampaignCategoriesWithFiltersResult => {
		const [filters, setFilters] = useState<CategoryFilters>({
			search: '',
			status: 'all',
			sortBy: 'name',
			sortOrder: 'asc',
		});

		const [pagination, setPagination] = useState<PaginationState>({
			page: 1,
			pageSize: 10,
			total: 0,
		});

		// Generate server params for API filtering
		const serverParams = useMemo(() => {
			const params: { name?: string; active?: boolean } = {};

			// Use name search for server-side filtering
			if (filters.search.trim()) {
				params.name = filters.search.trim();
			}

			// Use active status for server-side filtering
			if (filters.status !== 'all') {
				params.active = filters.status === 'active';
			}

			return params;
		}, [filters.search, filters.status]);

		// Fetch data with server-side filtering
		const { data: categories = [], isLoading } = useGetCampaignCategories(
			Object.keys(serverParams).length > 0 ? serverParams : undefined
		);

		const filteredCategories = useMemo(() => {
			let result = [...categories];

			// Client-side filtering for fields not supported by server-side API
			// Additional search in code and description since server only handles name
			if (filters.search && !serverParams.name) {
				const searchTerm = filters.search.toLowerCase().trim();
				result = result.filter(
					(category) =>
						category.name.toLowerCase().includes(searchTerm) ||
						category.code.toLowerCase().includes(searchTerm) ||
						category.description?.toLowerCase().includes(searchTerm)
				);
			} else if (filters.search && serverParams.name) {
				// If server handled name filtering, do additional client filtering for code/description
				const searchTerm = filters.search.toLowerCase().trim();
				result = result.filter(
					(category) =>
						category.code.toLowerCase().includes(searchTerm) ||
						category.description?.toLowerCase().includes(searchTerm) ||
						category.name.toLowerCase().includes(searchTerm) // Keep existing matches
				);
			}

			// Apply sorting
			result.sort((a, b) => {
				let comparison = 0;

				switch (filters.sortBy) {
					case 'name':
						comparison = a.name.localeCompare(b.name);
						break;
					case 'code':
						comparison = a.code.localeCompare(b.code);
						break;
					case 'createdAt':
						comparison =
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
						break;
					case 'updatedAt':
						comparison =
							new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
						break;
					default:
						comparison = 0;
				}

				return filters.sortOrder === 'asc' ? comparison : -comparison;
			});

			return result;
		}, [categories, filters]);

		// Update pagination total when filtered results change
		const updatedPagination = useMemo(() => {
			const newTotal = filteredCategories.length;
			const totalPages = Math.ceil(newTotal / pagination.pageSize);
			const currentPage =
				pagination.page > totalPages && totalPages > 0 ? 1 : pagination.page;

			return {
				...pagination,
				page: currentPage,
				total: newTotal,
			};
		}, [filteredCategories.length, pagination.pageSize, pagination.page]);

		// Get paginated results
		const paginatedCategories = useMemo(() => {
			const startIndex =
				(updatedPagination.page - 1) * updatedPagination.pageSize;
			const endIndex = startIndex + updatedPagination.pageSize;
			return filteredCategories.slice(startIndex, endIndex);
		}, [
			filteredCategories,
			updatedPagination.page,
			updatedPagination.pageSize,
		]);

		const handleFiltersChange = (newFilters: CategoryFilters) => {
			setFilters(newFilters);
			// Reset to first page when filters change
			setPagination((prev) => ({
				...prev,
				page: 1,
			}));
		};

		const handlePaginationChange = (newPagination: PaginationState) => {
			setPagination(newPagination);
		};

		return {
			categories,
			filteredCategories,
			pagination: updatedPagination,
			filters,
			setPagination: handlePaginationChange,
			setFilters: handleFiltersChange,
			paginatedCategories,
			isLoading,
		};
	};
