import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import dispositionCatalogApi, {
	type CampaignWithDispositionCatalog,
	type CopyDispositionCatalogPayload,
	type CopiedDispositionCatalogResponse,
} from '~/api/dispositionCatalogApi';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import type {
	DispositionCatalogModel,
	CreateDispositionCatalog,
} from '~/models/DispositionCatalogModels';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';

/**
 * Public API for Disposition Catalog operations
 * All disposition catalog API calls should go through these React Query hooks
 */

/**
 * Hook to fetch all disposition catalogs with optional filtering
 * @param queryParams - Optional query parameters including type filter
 * @returns Query result containing an array of DispositionCatalogModel objects
 */
export function useDispositionCatalogs(queryParams?: {
	type?: string;
	[key: string]: any;
}) {
	return useQuery<DispositionCatalogModel[], Error>({
		queryKey: ['dispositionCatalogs', queryParams],
		queryFn: async () => {
			const api = dispositionCatalogApi();
			return api.getAllDispositionCatalogs(queryParams);
		},
	});
}

type DispositionCatalogsPagedQueryParams = {
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
	type?: string;
	search?: string;
	isActive?: boolean;
	enabled?: boolean;
};

/**
 * Hook to fetch disposition catalogs using the /all paginated endpoint.
 * This supports server-side pagination and sorting.
 */
export function useDispositionCatalogsPaged(
	params?: DispositionCatalogsPagedQueryParams
) {
	const {
		limit,
		offset,
		sortBy,
		sortOrder,
		type,
		search,
		isActive,
		enabled = true,
	} = params || {};

	return useQuery<PaginatedResponse<DispositionCatalogModel>, Error>({
		queryKey: [
			'dispositionCatalogs',
			'all',
			{ limit, offset, sortBy, sortOrder, type, search, isActive },
		],
		queryFn: async () => {
			const api = dispositionCatalogApi();
			return api.getAllDispositionCatalogsAllPaged({
				limit,
				offset,
				sortBy,
				sortOrder,
				type,
				search,
				isActive,
			});
		},
		staleTime: 30_000,
		placeholderData: keepPreviousData,
		enabled,
	});
}

/**
 * Hook to fetch all campaigns that have a disposition catalog
 * @param enabled - Whether to enable the query (defaults to true)
 * @returns Query result containing an array of CampaignWithDispositionCatalog objects
 */
export function useCampaignsWithDispositionCatalog(enabled = true) {
	return useQuery<CampaignWithDispositionCatalog[], Error>({
		queryKey: ['campaignsWithDispositionCatalog'],
		queryFn: async () => {
			const api = dispositionCatalogApi();
			return api.getCampaignsWithCatalog();
		},
		enabled,
	});
}

/**
 * Hook to fetch the current disposition flow for a campaign
 * @param campaignId - The campaign ID to fetch the disposition flow for
 * @returns Query result containing a DispositionFlowModel object
 */
export function useCurrentDispositionFlow(campaignId?: string | number) {
	return useQuery<DispositionFlowModel, Error>({
		queryKey: ['dispositionFlow', 'current', campaignId],
		queryFn: async () => {
			if (!campaignId) {
				throw new Error('Campaign ID is required');
			}
			const api = dispositionCatalogApi();
			return api.getCurrentDispositionFlow(campaignId);
		},
		enabled: !!campaignId,
	});
}

/**
 * Mutation hook to create a new disposition catalog
 * @returns Mutation object with methods to create a disposition catalog
 */
export function useCreateDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<DispositionCatalogModel, Error, CreateDispositionCatalog>({
		mutationFn: async (data) => {
			const api = dispositionCatalogApi();
			return api.createDispositionCatalog(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
		},
	});
}

/**
 * Mutation hook to save disposition flow
 * @returns Mutation object with methods to save a disposition flow
 */
export function useSaveDispositionFlow() {
	const queryClient = useQueryClient();
	return useMutation<
		DispositionFlowModel,
		Error,
		Partial<DispositionFlowModel> & {
			campaignId: string | number;
			name?: string; // Allow optional name for the flow
		}
	>({
		mutationFn: async (data) => {
			const api = dispositionCatalogApi();
			return api.saveDispositionFlow(data);
		},
		onSuccess: (_, variables) => {
			// Invalidate the current disposition flow query for this campaign
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlow', 'current', variables.campaignId],
			});
			// Also invalidate all disposition flows if needed
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlow'],
			});
		},
	});
}

/**
 * Mutation hook to delete a disposition catalog
 * @returns Mutation object with methods to delete a disposition catalog
 */
export function useDeleteDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { id: number }>({
		mutationFn: async ({ id }) => {
			const api = dispositionCatalogApi();
			return api.deleteDispositionCatalog(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
		},
	});
}

/**
 * Mutation hook to update an existing disposition catalog
 * @returns Mutation object with methods to update a disposition catalog
 */
export function useUpdateDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<
		DispositionCatalogModel,
		Error,
		{ id: number; data: CreateDispositionCatalog }
	>({
		mutationFn: async ({ id, data }) => {
			const api = dispositionCatalogApi();
			return api.updateDispositionCatalog(id, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
		},
	});
}

/**
 * Mutation hook to reactivate an inactive disposition catalog
 * @returns Mutation object with methods to reactivate a disposition catalog
 */
export function useReactivateDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<DispositionCatalogModel, Error, { catalogId: number }>({
		mutationFn: async ({ catalogId }) => {
			const api = dispositionCatalogApi();
			return api.reactivateDispositionCatalog(catalogId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
		},
	});
}

/**
 * Mutation hook to deactivate an active disposition catalog
 * @returns Mutation object with methods to deactivate a disposition catalog
 */
export function useDeactivateDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<DispositionCatalogModel, Error, { catalogId: number }>({
		mutationFn: async ({ catalogId }) => {
			const api = dispositionCatalogApi();
			return api.deactivateDispositionCatalog(catalogId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
		},
	});
}

/**
 * Mutation hook to copy a disposition catalog to a new campaign
 * @returns Mutation object with methods to copy a disposition catalog
 */
export function useCopyDispositionCatalog() {
	const queryClient = useQueryClient();
	return useMutation<
		CopiedDispositionCatalogResponse,
		Error,
		CopyDispositionCatalogPayload
	>({
		mutationFn: async (data) => {
			const api = dispositionCatalogApi();
			return api.copyToCampaign(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionCatalogs'] });
			queryClient.invalidateQueries({
				queryKey: ['campaignsWithDispositionCatalog'],
			});
		},
	});
}
