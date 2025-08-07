/**
 * Mutation hook to delete a disposition catalog
 * @returns Mutation object with methods to delete a disposition catalog
 */
export function useDeleteDispositionCatalog() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation<void, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deleteDispositionCatalog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispositionCatalogs"] });
    },
  });
}
/**
 * Mutation hook to update an existing disposition catalog
 * @returns Mutation object with methods to update a disposition catalog
 */
export function useUpdateDispositionCatalog() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation<
    DispositionCatalogModel,
    Error,
    { id: number; data: CreateDispositionCatalog }
  >({
    mutationFn: async ({ id, data }) => {
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateDispositionCatalog(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispositionCatalogs"] });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dispositionCatalogApi from "~/api/dispositionCatalogApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type {
  DispositionCatalogModel,
  CreateDispositionCatalog,
} from "~/models/DispositionCatalogModels";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";

/**
 * Hook to fetch all disposition catalogs
 * @returns Query result containing an array of DispositionCatalogModel objects
 */
export function useDispositionCatalogs() {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionCatalogModel[], Error>({
    queryKey: ["dispositionCatalogs"],
    queryFn: async () => {
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getAllDispositionCatalogs();
    },
  });
}

/**
 * Hook to fetch the current disposition flow for a campaign
 * @param campaignId - The campaign ID to fetch the disposition flow for
 * @returns Query result containing a DispositionFlowModel object
 */
export function useCurrentDispositionFlow(campaignId?: string | number) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionFlowModel, Error>({
    queryKey: ["dispositionFlow", "current", campaignId],
    queryFn: async () => {
      if (!campaignId) {
        throw new Error("Campaign ID is required");
      }
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getCurrentDispositionFlow(campaignId);
    },
    enabled: !!campaignId && !!token?.token,
  });
}

/**
 * Mutation hook to create a new disposition catalog
 * @returns Mutation object with methods to create a disposition catalog
 */
export function useCreateDispositionCatalog() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation<DispositionCatalogModel, Error, CreateDispositionCatalog>({
    mutationFn: async (data) => {
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.createDispositionCatalog(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispositionCatalogs"] });
    },
  });
}

/**
 * Mutation hook to save disposition flow
 * @returns Mutation object with methods to save a disposition flow
 */
export function useSaveDispositionFlow() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation<
    DispositionFlowModel,
    Error,
    Partial<DispositionFlowModel> & {
      campaignId: string | number;
      name?: string; // Allow optional name for the flow
    }
  >({
    mutationFn: async (data) => {
      const api = dispositionCatalogApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.saveDispositionFlow(data);
    },
    onSuccess: (data, variables) => {
      // Invalidate the current disposition flow query for this campaign
      queryClient.invalidateQueries({
        queryKey: ["dispositionFlow", "current", variables.campaignId],
      });
      // Also invalidate all disposition flows if needed
      queryClient.invalidateQueries({
        queryKey: ["dispositionFlow"],
      });
    },
  });
}
