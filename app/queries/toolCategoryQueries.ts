import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toolCategoryApi from "~/api/toolCategoryApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { ToolCategoryModel } from "~/models/ToolCategoryModel";
import type { ToolModel } from "~/models/ToolModel";

/**
 * Hook to fetch tools by category ID
 * @param categoryId - The ID of the tool category
 * @returns Query result containing an array of ToolModel objects
 */
export function useToolsByCategory(categoryId: string | number | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<ToolModel[], Error>({
    queryKey: ["toolsByCategory", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        return [];
      }
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async (data: Partial<ToolCategoryModel>) => {
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<ToolCategoryModel>;
    }) => {
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateToolCategory(id, data);
    },
    onSuccess: (data, variables) => {
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
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deleteToolCategory(id);
    },
    onSuccess: (data, id) => {
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
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<ToolCategoryModel, Error>({
    queryKey: ["toolCategory", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Tool category ID is required");
      }
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
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
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<ToolCategoryModel[], Error>({
    queryKey: ["toolCategories"],
    queryFn: async () => {
      const api = toolCategoryApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getAllToolCategories();
    },
  });
}
