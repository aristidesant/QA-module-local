import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toolApi from '~/api/toolApi';
import type {
	ToolModel,
	AssignedToolModel,
	CreateToolDto,
	UpdateToolDto,
} from '~/models/ToolModel';

/**
 * Hook to fetch all tools
 * @returns Query result containing an array of ToolModel objects
 */
export function useTools() {
	return useQuery<ToolModel[], Error>({
		queryKey: ['tools'],
		queryFn: async () => {
			const api = toolApi();
			return api.getAllTools();
		},
	});
}

/**
 * Hook to fetch a tool by ID
 * @param id - The ID of the tool
 * @returns Query result containing a ToolModel object
 */
export function useToolById(id: string | number | undefined) {
	return useQuery<ToolModel, Error>({
		queryKey: ['tool', id],
		queryFn: async () => {
			if (!id) throw new Error('Tool ID is required');
			const api = toolApi();
			return api.getToolById(id);
		},
		enabled: !!id,
	});
}

/**
 * Mutation hook to create a new tool
 * @returns Mutation object with methods to create a tool
 */
export function useCreateTool() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateToolDto) => {
			const api = toolApi();
			return api.createTool(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tools'] });
			queryClient.invalidateQueries({ queryKey: ['toolsByCategory'] });
		},
	});
}

/**
 * Mutation hook to update an existing tool
 * @returns Mutation object with methods to update a tool
 */
export function useUpdateTool() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string | number;
			data: UpdateToolDto;
		}) => {
			const api = toolApi();
			return api.updateTool(id, data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['tools'] });
			queryClient.invalidateQueries({ queryKey: ['toolsByCategory'] });
			queryClient.invalidateQueries({ queryKey: ['tool', variables.id] });
		},
	});
}

/**
 * Mutation hook to delete a tool
 * @returns Mutation object with methods to delete a tool
 */
export function useDeleteTool() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string | number) => {
			const api = toolApi();
			return api.deleteTool(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['tools'] });
			queryClient.invalidateQueries({ queryKey: ['toolsByCategory'] });
			queryClient.invalidateQueries({ queryKey: ['tool', id] });
		},
	});
}

/**
 * Mutation hook to create tools in bulk
 * @returns Mutation object with methods to create tools in bulk
 */
export function useCreateToolBulk() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Partial<ToolModel>[]) => {
			const api = toolApi();
			return api.createToolBulk(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tools'] });
			queryClient.invalidateQueries({ queryKey: ['toolsByCategory'] });
		},
	});
}

/**
 * Hook to fetch tools by category ID
 * @param categoryId - The ID of the tool category
 * @returns Query result containing an array of ToolModel objects
 */
export function useToolsByCategory(categoryId: string | number | undefined) {
	return useQuery<ToolModel[], Error>({
		queryKey: ['toolsByCategory', categoryId],
		queryFn: async () => {
			if (!categoryId) return [];
			const api = toolApi();
			return api.getToolsByCategory(categoryId);
		},
		enabled: !!categoryId,
	});
}

/**
 * Hook to fetch assigned tools for an agent
 * @param agentId - The ID of the agent
 * @returns Query result containing an array of assigned ToolModel objects
 */
export function useAssignedTools(agentId: string | undefined) {
	return useQuery<AssignedToolModel[], Error>({
		queryKey: ['assignedTools', agentId],
		queryFn: async () => {
			if (!agentId) return [];
			const api = toolApi();
			return api.getAssignedTools(agentId);
		},
		enabled: !!agentId,
		retry: false,
	});
}

/**
 * Mutation hook to assign tools to an agent
 * @returns Mutation object with methods to assign tools to an agent
 */
export function useAssignToolsToAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			agentId,
			toolIds,
		}: {
			agentId: string;
			toolIds: string[];
		}) => {
			const api = toolApi();
			return api.assignToolsToAgent(agentId, toolIds);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['assignedTools', variables.agentId],
			});
		},
	});
}

/**
 * Mutation hook to unassign tools from an agent
 * @returns Mutation object with methods to unassign tools from an agent
 */
export function useUnassignToolsFromAgent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			agentId,
			toolIds,
		}: {
			agentId: string;
			toolIds: string[];
		}) => {
			const api = toolApi();
			return api.unassignToolsFromAgent(agentId, toolIds);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['assignedTools', variables.agentId],
			});
		},
	});
}

/**
 * Mutation hook to handle bulk tool assignment/unassignment for an agent
 * @returns Mutation object with methods to update agent tools
 */
export function useUpdateAgentTools() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			agentId,
			newToolIds,
			currentAssignedTools,
		}: {
			agentId: string;
			newToolIds: string[];
			currentAssignedTools: AssignedToolModel[];
		}) => {
			const { handleAgentToolsUpdate } =
				await import('~/utils/agentToolsUtils');
			return handleAgentToolsUpdate(agentId, newToolIds, currentAssignedTools);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['assignedTools', variables.agentId],
			});
		},
	});
}
