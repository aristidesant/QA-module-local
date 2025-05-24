import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import promptFormsApi from "~/api/promptFormsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { PromptForm } from "~/models/PromptFormMOdel";

// Crear formulario de prompt
export const useCreatePromptForm = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptForm: Partial<PromptForm>) => {
      const api = promptFormsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.createPromptForm(promptForm);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
      console.log("Formulario de prompt creado exitosamente:", data);
    },
    onError: (error) => {
      console.error("Error al crear el formulario de prompt:", error);
    },
  });
};

// Obtener todos los formularios de prompt
export const useGetAllPromptForms = (params?: Record<string, any>) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  console.log("params", header, token);
  return useQuery({
    queryKey: ["promptForms", params],
    queryFn: async () => {
      const api = promptFormsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findAllPromptForms(params);
    },
  });
};

// Obtener un formulario de prompt por id
export const useGetPromptForm = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["promptForm", id],
    queryFn: async () => {
      const api = promptFormsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findPromptForm(id);
    },
    enabled: !!id,
  });
};

// Actualizar formulario de prompt
export const useUpdatePromptForm = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PromptForm>;
    }) => {
      const api = promptFormsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updatePromptForm(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["promptForm", data.id] });
      }
      console.log("Formulario de prompt actualizado exitosamente:", data);
    },
    onError: (error) => {
      console.error("Error al actualizar el formulario de prompt:", error);
    },
  });
};

// Eliminar formulario de prompt
export const useDeletePromptForm = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptFormsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deletePromptForm(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["promptForms"] });
      queryClient.invalidateQueries({ queryKey: ["promptForm", id] });
      console.log("Formulario de prompt eliminado exitosamente:", id);
    },
    onError: (error) => {
      console.error("Error al eliminar el formulario de prompt:", error);
    },
  });
};
