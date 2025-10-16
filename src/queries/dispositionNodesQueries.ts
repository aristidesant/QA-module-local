import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dispositionNodesApi from '~/api/dispositionNodesApi';
import type { DispositionNode } from '~/models/DispositionNodeModel';

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
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionNodes', filters],
		queryFn: async () => {
			const api = dispositionNodesApi();
			return api.getNodes(filters);
		},
	});
}

export function useDispositionNode(id: number | string | undefined) {
	return useQuery<DispositionNode, Error>({
		queryKey: ['dispositionNode', id],
		queryFn: async () => {
			if (!id) throw new Error('Node ID required');
			const api = dispositionNodesApi();
			return api.getNodeById(id);
		},
		enabled: !!id,
	});
}

export function useDispositionTreeByCatalog(
	catalogId: number | string | undefined
) {
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionTree', catalogId],
		queryFn: async () => {
			if (!catalogId) throw new Error('Catalog ID required');
			const api = dispositionNodesApi();
			return api.getTreeByCatalog(catalogId);
		},
		enabled: !!catalogId,
	});
}

export function useDispositionRootsByCatalog(
	catalogId: number | string | undefined
) {
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionRoots', catalogId],
		queryFn: async () => {
			if (!catalogId) throw new Error('Catalog ID required');
			const api = dispositionNodesApi();
			return api.getRootsByCatalog(catalogId);
		},
		enabled: !!catalogId,
	});
}

export function useDispositionChildren(id: number | string | undefined) {
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionChildren', id],
		queryFn: async () => {
			if (!id) throw new Error('Node ID required');
			const api = dispositionNodesApi();
			return api.getChildren(id);
		},
		enabled: !!id,
	});
}

export function useDispositionAncestors(id: number | string | undefined) {
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionAncestors', id],
		queryFn: async () => {
			if (!id) throw new Error('Node ID required');
			const api = dispositionNodesApi();
			return api.getAncestors(id);
		},
		enabled: !!id,
	});
}

export function useDispositionDescendants(id: number | string | undefined) {
	return useQuery<DispositionNode[], Error>({
		queryKey: ['dispositionDescendants', id],
		queryFn: async () => {
			if (!id) throw new Error('Node ID required');
			const api = dispositionNodesApi();
			return api.getDescendants(id);
		},
		enabled: !!id,
	});
}

// --- Mutations ---
export function useCreateDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ data }: CreateNodeParams) => {
			const api = dispositionNodesApi();
			return api.createNode(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useUpdateDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: UpdateNodeParams) => {
			const api = dispositionNodesApi();
			return api.updateNode(id, data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['dispositionNode', variables.id],
			});
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useDeleteDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number | string) => {
			const api = dispositionNodesApi();
			return api.deleteNode(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNode', id] });
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useRestoreDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number | string) => {
			const api = dispositionNodesApi();
			return api.restoreNode(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNode', id] });
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useMoveDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, parentId }: MoveNodeParams) => {
			const api = dispositionNodesApi();
			return api.moveNode(id, parentId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['dispositionNode', variables.id],
			});
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useBulkUpdateDispositionOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ orders }: BulkOrderParams) => {
			const api = dispositionNodesApi();
			return api.bulkUpdateOrder(orders);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
		},
	});
}

export function useReactivateDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation<DispositionNode, Error, number | string>({
		mutationFn: async (id: number | string) => {
			const api = dispositionNodesApi();
			return api.reactivateNode(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNode', id] });
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
			queryClient.invalidateQueries({ queryKey: ['dispositionTree'] });
		},
	});
}

export function useDeactivateDispositionNode() {
	const queryClient = useQueryClient();
	return useMutation<DispositionNode, Error, number | string>({
		mutationFn: async (id: number | string) => {
			const api = dispositionNodesApi();
			return api.deactivateNode(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['dispositionNode', id] });
			queryClient.invalidateQueries({ queryKey: ['dispositionNodes'] });
			queryClient.invalidateQueries({ queryKey: ['dispositionTree'] });
		},
	});
}
