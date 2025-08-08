import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toolApi from "~/api/toolApi";
import type { ToolModel } from "~/models/ToolModel";

/**
 * Hook to fetch all tools
 * @returns Query result containing an array of ToolModel objects
 */
export function useTools() {
  return useQuery<ToolModel[], Error>({
    queryKey: ["tools"],
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
    queryKey: ["tool", id],
    queryFn: async () => {
      if (!id) throw new Error("Tool ID is required");
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
    mutationFn: async (data: Partial<ToolModel>) => {
      const api = toolApi();
      return api.createTool(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
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
      data: Partial<ToolModel>;
    }) => {
      const api = toolApi();
      return api.updateTool(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      queryClient.invalidateQueries({ queryKey: ["tool", variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      queryClient.invalidateQueries({ queryKey: ["tool", id] });
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
      queryClient.invalidateQueries({ queryKey: ["tools"] });
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
    queryKey: ["toolsByCategory", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const api = toolApi();
      return api.getToolsByCategory(categoryId);
    },
    enabled: !!categoryId,
  });
}
