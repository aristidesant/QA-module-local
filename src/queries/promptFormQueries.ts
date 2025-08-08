import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import promptFormsApi from "~/api/promptFormsApi";
import type { PromptForm } from "~/models/PromptFormModel";

// Crear formulario de prompt
export const useCreatePromptForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptForm: Partial<PromptForm>) => {
      const api = promptFormsApi();
      return api.createPromptForm(promptForm);
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
    },
    onError: (error) => {
      console.error("Error al crear el formulario de prompt:", error);
    },
  });
};

// Obtener todos los formularios de prompt
export const useGetAllPromptForms = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["promptForms", params],
    queryFn: async () => {
      const api = promptFormsApi();
      return api.findAllPromptForms(params);
    },
  });
};

// Obtener un formulario de prompt por id
export const useGetPromptForm = (id: string) => {
  return useQuery({
    queryKey: ["promptForm", id],
    queryFn: async () => {
      const api = promptFormsApi();
      return api.findPromptForm(id);
    },
    enabled: !!id,
  });
};

// Actualizar formulario de prompt
export const useUpdatePromptForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PromptForm>;
    }) => {
      const api = promptFormsApi();
      return api.updatePromptForm(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["promptForm", data.id] });
      }
    },
    onError: (error) => {
      console.error("Error al actualizar el formulario de prompt:", error);
    },
  });
};

// Eliminar formulario de prompt
export const useDeletePromptForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptFormsApi();
      return api.deletePromptForm(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
      queryClient.invalidateQueries({ queryKey: ["promptForm", id] });
    },
    onError: (error) => {
      console.error("Error al eliminar el formulario de prompt:", error);
    },
  });
};
