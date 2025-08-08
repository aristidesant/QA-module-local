import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toolCategoryApi from "~/api/toolCategoryApi";
import type { ToolCategoryModel } from "~/models/ToolCategoryModel";
import type { ToolModel } from "~/models/ToolModel";

/**
 * Hook to fetch tools by category ID
 * @param categoryId - The ID of the tool category
 * @returns Query result containing an array of ToolModel objects
 */
export function useToolsByCategory(categoryId: string | number | undefined) {
  return useQuery<ToolModel[], Error>({
    queryKey: ["toolsByCategory", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        return [];
      }
      const api = toolCategoryApi();
      return api.getToolsByCategory(categoryId);
    },
    enabled: !!categoryId,
  });
}
/**
 * Mutation hook to create a new tool category
 * @returns Mutation object with methods to create a tool category
 */
export function useCreateToolCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ToolCategoryModel>) => {
      const api = toolCategoryApi();
      return api.createToolCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toolCategories"] });
    },
  });
}

/**
 * Mutation hook to update an existing tool category
 * @returns Mutation object with methods to update a tool category
 */
export function useUpdateToolCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<ToolCategoryModel>;
    }) => {
      const api = toolCategoryApi();
      return api.updateToolCategory(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["toolCategories"] });
      queryClient.invalidateQueries({
        queryKey: ["toolCategory", variables.id],
      });
    },
  });
}

/**
 * Mutation hook to delete a tool category
 * @returns Mutation object with methods to delete a tool category
 */
export function useDeleteToolCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const api = toolCategoryApi();
      return api.deleteToolCategory(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["toolCategories"] });
      queryClient.invalidateQueries({ queryKey: ["toolCategory", id] });
    },
  });
}
/**
 * Hook to fetch a tool category by ID
 * @param id - The ID of the tool category
 * @returns Query result containing a ToolCategoryModel object
 */
export function useToolCategoryById(id: string | number | undefined) {
  return useQuery<ToolCategoryModel, Error>({
    queryKey: ["toolCategory", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Tool category ID is required");
      }
      const api = toolCategoryApi();
      return api.getToolCategoryById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch all tool categories
 * @returns Query result containing an array of ToolCategoryModel objects
 */
export function useToolCategories() {
  return useQuery<ToolCategoryModel[], Error>({
    queryKey: ["toolCategories"],
    queryFn: async () => {
      const api = toolCategoryApi();
      return api.getAllToolCategories();
    },
  });
}
