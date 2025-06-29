import { useMutation } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import promptGeneratorApi from "~/api/promptGeneratorApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { Prompt } from "~/models/PromptsModels";

export const useCreatePrompt = () => {
  const { token } = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prompt: Partial<Prompt>) => {
      const api = promptGeneratorApi({
        ...header,
        Authorization: `Bearer ${token}`,
      });

      return api.createPrompt(prompt);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
    onError: (error) => {
      console.error("Error creating prompt:", error);
    },
  });
};

// Get all prompts
export const useGetAllPrompts = () => {
  const { token } = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const api = promptGeneratorApi({
        ...header,
        Authorization: `Bearer ${token}`,
      });
      return api.findAllPrompts();
    },
  });
};

// Get one prompt by id
export const useGetPrompt = (id: string) => {
  const { token } = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["prompt", id],
    queryFn: async () => {
      const api = promptGeneratorApi({
        ...header,
        Authorization: `Bearer ${token}`,
      });
      return api.findPrompt(id);
    },
    enabled: !!id,
  });
};

// Update prompt
export const useUpdatePrompt = () => {
  const { token } = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prompt> }) => {
      const api = promptGeneratorApi({
        ...header,
        Authorization: `Bearer ${token}`,
      });
      return api.updatePrompt(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["prompt", data.id] });
      }
    },
    onError: (error) => {
      console.error("Error updating prompt:", error);
    },
  });
};

// Delete prompt
export const useDeletePrompt = () => {
  const { token } = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = promptGeneratorApi({
        ...header,
        Authorization: `Bearer ${token}`,
      });
      return api.deletePrompt(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompt", id] });
    },
    onError: (error) => {
      console.error("Error deleting prompt:", error);
    },
  });
};
