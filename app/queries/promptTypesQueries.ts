import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import promptTypesApi from "~/api/promptTypesApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { PromptType } from "~/models/PromptTypeModel";

// Create prompt type
export const useCreatePromptType = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptType: Partial<PromptType>) => {
      const api = promptTypesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.createPromptType(promptType);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptTypes"] });
      console.log("Prompt type created successfully:", data);
    },
    onError: (error) => {
      console.error("Error creating prompt type:", error);
    },
  });
};

// Get all prompt types
export const useGetAllPromptTypes = (params?: Record<string, string>) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery({
    enabled: !!params?.categoryId,
    queryKey: ["promptTypes", params],
    queryFn: async () => {
      const api = promptTypesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findAllPromptTypes(params);
    },
  });
};

// Get one prompt type by id
export const useGetPromptType = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["promptType", id],
    queryFn: async () => {
      const api = promptTypesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findPromptType(id);
    },
    enabled: !!id,
  });
};

// Update prompt type
export const useUpdatePromptType = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PromptType>;
    }) => {
      const api = promptTypesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.updatePromptType(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptTypes"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["promptType", data.id] });
      }
      console.log("Prompt type updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating prompt type:", error);
    },
  });
};

// Delete prompt type
export const useDeletePromptType = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptTypesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.deletePromptType(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["promptTypes"] });
      queryClient.invalidateQueries({ queryKey: ["promptType", id] });
      console.log("Prompt type deleted successfully:", id);
    },
    onError: (error) => {
      console.error("Error deleting prompt type:", error);
    },
  });
};
