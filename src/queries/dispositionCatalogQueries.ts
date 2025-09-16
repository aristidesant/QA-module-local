import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dispositionCatalogApi from '~/api/dispositionCatalogApi';
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
