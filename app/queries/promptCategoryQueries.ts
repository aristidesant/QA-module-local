import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import promptCategoriesApi from "~/api/promptCategories";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { PromptCategory } from "~/models/PromptCategoryModel";

// filepath: /Users/ramonmena/Projects/n-ai/app/queries/promptCategoryQueries.ts

// Create prompt category
export const useCreatePromptCategory = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptCategory: Partial<PromptCategory>) => {
      const api = promptCategoriesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
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
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery({
    queryKey: ["promptCategories", params],
    queryFn: async () => {
      const api = promptCategoriesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
        ...(extraHeaders || {}),
      });
      return api.findAllPromptCategories(params, extraHeaders);
    },
  });
};

// Get one prompt category by id
export const useGetPromptCategory = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery({
    queryKey: ["promptCategory", id],
    queryFn: async () => {
      const api = promptCategoriesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findPromptCategory(id);
    },
    enabled: !!id,
  });
};

// Update prompt category
export const useUpdatePromptCategory = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PromptCategory>;
    }) => {
      const api = promptCategoriesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
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
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptCategoriesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
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
