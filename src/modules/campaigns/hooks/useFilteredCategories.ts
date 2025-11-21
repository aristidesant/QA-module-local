import { useMemo, useState } from 'react';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import type { CategoryFilters } from '../CampaignManagementPage/Categories/components/CampaignCategoriesFilters';
import type { PaginationState } from '../CampaignManagementPage/Categories/components/CampaignCategoriesPagination';

interface UseCampaignCategoriesWithFiltersResult {
	categories: CampaignCategory[];
	pagination: PaginationState;
	filters: CategoryFilters;
	setPagination: (pagination: PaginationState) => void;
	setFilters: (filters: CategoryFilters) => void;
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

		// Generate server params for API filtering and pagination
		const serverParams = useMemo(() => {
			const params: {
				name?: string;
				active?: boolean;
				limit?: number;
				offset?: number;
			} = {};

			// Use name search for server-side filtering
			if (filters.search.trim()) {
				params.name = filters.search.trim();
			}

			// Use active status for server-side filtering
			if (filters.status !== 'all') {
				params.active = filters.status === 'active';
			}

			// Add pagination params
			params.limit = pagination.pageSize;
			params.offset = (pagination.page - 1) * pagination.pageSize;

			return params;
		}, [filters.search, filters.status, pagination.page, pagination.pageSize]);

		// Fetch data with server-side filtering and pagination
		const { data: response, isLoading } =
			useGetCampaignCategories(serverParams);

		// Extract categories from API response and apply client-side sorting
		const rawCategories = useMemo(() => {
			if (!response?.data) return [];
			return response.data;
		}, [response?.data]);

		// Update pagination with server response
		const updatedPagination = useMemo(() => {
			if (!response) {
				return pagination;
			}

			return {
				...pagination,
				total: response.total,
			};
		}, [response, pagination]);

		// Apply client-side sorting since server doesn't handle it
		const categories = useMemo(() => {
			const result = [...rawCategories];

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
		}, [rawCategories, filters.sortBy, filters.sortOrder]);

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
			pagination: updatedPagination,
			filters,
			setPagination: handlePaginationChange,
			setFilters: handleFiltersChange,
			isLoading,
		};
	};
