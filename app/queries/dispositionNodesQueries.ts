import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dispositionNodesApi from "~/api/dispositionNodesApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { DispositionNode } from "~/models/DispositionNodeModel";

// --- Types ---
export interface CreateNodeParams {
  data: Partial<DispositionNode>;
}

export interface UpdateNodeParams {
  id: number | string;
  data: Partial<DispositionNode>;
}

export interface MoveNodeParams {
  id: number | string;
  parentId: number | null;
}

export interface BulkOrderParams {
  orders: Array<{ id: number; order: number }>;
}

// --- Queries ---
export function useDispositionNodes(filters?: Record<string, any>) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionNodes", filters],
    queryFn: async () => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getNodes(filters);
    },
  });
}

export function useDispositionNode(id: number | string | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode, Error>({
    queryKey: ["dispositionNode", id],
    queryFn: async () => {
      if (!id) throw new Error("Node ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getNodeById(id);
    },
    enabled: !!id,
  });
}

export function useDispositionTreeByCatalog(
  catalogId: number | string | undefined
) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionTree", catalogId],
    queryFn: async () => {
      if (!catalogId) throw new Error("Catalog ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getTreeByCatalog(catalogId);
    },
    enabled: !!catalogId,
  });
}

export function useDispositionRootsByCatalog(
  catalogId: number | string | undefined
) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionRoots", catalogId],
    queryFn: async () => {
      if (!catalogId) throw new Error("Catalog ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getRootsByCatalog(catalogId);
    },
    enabled: !!catalogId,
  });
}

export function useDispositionChildren(id: number | string | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionChildren", id],
    queryFn: async () => {
      if (!id) throw new Error("Node ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getChildren(id);
    },
    enabled: !!id,
  });
}

export function useDispositionAncestors(id: number | string | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionAncestors", id],
    queryFn: async () => {
      if (!id) throw new Error("Node ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getAncestors(id);
    },
    enabled: !!id,
  });
}

export function useDispositionDescendants(id: number | string | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery<DispositionNode[], Error>({
    queryKey: ["dispositionDescendants", id],
    queryFn: async () => {
      if (!id) throw new Error("Node ID required");
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getDescendants(id);
    },
    enabled: !!id,
  });
}

// --- Mutations ---
export function useCreateDispositionNode() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async ({ data }: CreateNodeParams) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.createNode(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}

export function useUpdateDispositionNode() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateNodeParams) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateNode(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dispositionNode", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}

export function useDeleteDispositionNode() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deleteNode(id);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["dispositionNode", id] });
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}

export function useRestoreDispositionNode() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.restoreNode(id);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["dispositionNode", id] });
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}

export function useMoveDispositionNode() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async ({ id, parentId }: MoveNodeParams) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.moveNode(id, parentId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dispositionNode", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}

export function useBulkUpdateDispositionOrder() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();
  return useMutation({
    mutationFn: async ({ orders }: BulkOrderParams) => {
      const api = dispositionNodesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.bulkUpdateOrder(orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispositionNodes"] });
    },
  });
}
