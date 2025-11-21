import { useMemo, useState } from 'react';
import { useGetCampaignContactSchemas } from '~/queries/campaignContactSchemasQueries';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import type { SchemaFilters } from '../CampaignManagementPage/Schemas/components/CampaignSchemasFilters';
import type { PaginationState } from '../CampaignManagementPage/Categories/components/CampaignCategoriesPagination';

interface UseCampaignSchemasWithFiltersResult {
	schemas: CampaignContactSchema[];
	pagination: PaginationState;
	filters: SchemaFilters;
	setPagination: (pagination: PaginationState) => void;
	setFilters: (filters: SchemaFilters) => void;
	isLoading: boolean;
}

export const useCampaignSchemasWithFilters =
	(): UseCampaignSchemasWithFiltersResult => {
		const [filters, setFilters] = useState<SchemaFilters>({
			search: '',
			objectiveId: null,
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
				objectiveId?: number;
				limit?: number;
				offset?: number;
			} = {};

			// Use name search for server-side filtering
			if (filters.search.trim()) {
				params.name = filters.search.trim();
			}

			// Use objectiveId for server-side filtering
			if (filters.objectiveId !== null) {
				params.objectiveId = filters.objectiveId;
			}

			// Add pagination params
			params.limit = pagination.pageSize;
			params.offset = (pagination.page - 1) * pagination.pageSize;

			return params;
		}, [
			filters.search,
			filters.objectiveId,
			pagination.page,
			pagination.pageSize,
		]);

		// Fetch data with server-side filtering and pagination
		const { data: response, isLoading } =
			useGetCampaignContactSchemas(serverParams);

		// Extract schemas from API response and apply client-side sorting
		const rawSchemas = useMemo(() => {
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
		const schemas = useMemo(() => {
			const result = [...rawSchemas];

			result.sort((a, b) => {
				let comparison = 0;

				switch (filters.sortBy) {
					case 'name':
						comparison = a.name.localeCompare(b.name);
						break;
					case 'code':
						comparison = a.code.localeCompare(b.code);
						break;
					case 'objectiveId':
						const aObjectiveName = a.objective?.name || '';
						const bObjectiveName = b.objective?.name || '';
						comparison = aObjectiveName.localeCompare(bObjectiveName);
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

				return filters.sortOrder === 'desc' ? -comparison : comparison;
			});

			return result;
		}, [rawSchemas, filters.sortBy, filters.sortOrder]);

		// Reset pagination when filters change
		const handleFiltersChange = (newFilters: SchemaFilters) => {
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
			schemas,
			pagination: updatedPagination,
			filters,
			setPagination: handlePaginationChange,
			setFilters: handleFiltersChange,
			isLoading,
		};
	};
