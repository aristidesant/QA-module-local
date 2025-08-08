import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import promptCategoriesApi from "~/api/promptCategories";
import type { PromptCategory } from "~/models/PromptCategoryModel";

// filepath: /Users/ramonmena/Projects/n-ai/app/queries/promptCategoryQueries.ts

// Create prompt category
export const useCreatePromptCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptCategory: Partial<PromptCategory>) => {
      const api = promptCategoriesApi();
      return api.createPromptCategory(promptCategory);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptCategories"] });
      // eslint-disable-next-line no-console
      console.log("Prompt category created successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error creating prompt category:", error);
    },
  });
};

// Get all prompt categories
export const useGetAllPromptCategories = (
  params?: Record<string, string>,
  extraHeaders?: Record<string, string>
) => {
  return useQuery({
    queryKey: ["promptCategories", params],
    queryFn: async () => {
      const api = promptCategoriesApi();
      return api.findAllPromptCategories(params);
    },
  });
};

// Get one prompt category by id
export const useGetPromptCategory = (id: string) => {
  return useQuery({
    queryKey: ["promptCategory", id],
    queryFn: async () => {
      const api = promptCategoriesApi();
      return api.findPromptCategory(id);
    },
    enabled: !!id,
  });
};

// Update prompt category
export const useUpdatePromptCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PromptCategory>;
    }) => {
      const api = promptCategoriesApi();
      return api.updatePromptCategory(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptCategories"] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: ["promptCategory", data.id],
        });
      }
      // eslint-disable-next-line no-console
      console.log("Prompt category updated successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error updating prompt category:", error);
    },
  });
};

// Delete prompt category
export const useDeletePromptCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptCategoriesApi();
      return api.deletePromptCategory(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["promptCategories"] });
      queryClient.invalidateQueries({ queryKey: ["promptCategory", id] });
      // eslint-disable-next-line no-console
      console.log("Prompt category deleted successfully:", id);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error deleting prompt category:", error);
    },
  });
};
