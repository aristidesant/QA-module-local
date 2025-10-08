import { useMemo, useState } from 'react';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import { CampaignObjective } from '~/models/CampaignObjectiveModel';
import type { ObjectiveFilters } from '../CampaignObjectivesFilters';
import type { PaginationState } from '../CampaignCategoriesPagination';

type EnrichedObjective = CampaignObjective & {
	categoryName: string;
};

interface UseCampaignObjectivesWithFiltersResult {
	objectives: EnrichedObjective[];
	pagination: PaginationState;
	filters: ObjectiveFilters;
	setPagination: (pagination: PaginationState) => void;
	setFilters: (filters: ObjectiveFilters) => void;
	isLoading: boolean;
}

export const useCampaignObjectivesWithFilters =
	(): UseCampaignObjectivesWithFiltersResult => {
		const [filters, setFilters] = useState<ObjectiveFilters>({
			search: '',
			status: 'all',
			categoryId: null,
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
				categoryId?: number;
				active?: boolean;
				limit?: number;
				offset?: number;
			} = {};

			// Use name search for server-side filtering
			if (filters.search.trim()) {
				params.name = filters.search.trim();
			}

			// Use categoryId for server-side filtering
			if (filters.categoryId !== null) {
				params.categoryId = filters.categoryId;
			}

			// Use active status for server-side filtering
			if (filters.status !== 'all') {
				params.active = filters.status === 'active';
			}

			// Add pagination params
			params.limit = pagination.pageSize;
			params.offset = (pagination.page - 1) * pagination.pageSize;

			return params;
		}, [
			filters.search,
			filters.categoryId,
			filters.status,
			pagination.page,
			pagination.pageSize,
		]);

		// Fetch data with server-side filtering and pagination
		const { data: response, isLoading } =
			useGetCampaignObjectives(serverParams);

		// Get categories for enriching objective data
		const { data: categoriesResponse } = useGetCampaignCategories();
		const categories = categoriesResponse?.data || [];

		// Extract objectives from API response and enrich with category data
		const rawObjectives = useMemo(() => {
			if (!response?.data) return [];

			return response.data.map((objective) => ({
				...objective,
				categoryName:
					categories.find((cat) => cat.id === objective.categoryId)?.name ||
					'Unknown Category',
			}));
		}, [response?.data, categories]);

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
		const objectives = useMemo(() => {
			const result = [...rawObjectives];

			result.sort((a, b) => {
				let comparison = 0;

				switch (filters.sortBy) {
					case 'name':
						comparison = a.name.localeCompare(b.name);
						break;
					case 'categoryId':
						comparison = (a.categoryName || '').localeCompare(
							b.categoryName || ''
						);
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
		}, [rawObjectives, filters.sortBy, filters.sortOrder]);

		const handleFiltersChange = (newFilters: ObjectiveFilters) => {
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
			objectives,
			pagination: updatedPagination,
			filters,
			setPagination: handlePaginationChange,
			setFilters: handleFiltersChange,
			isLoading,
		};
	};
