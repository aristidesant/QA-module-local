import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agentVoicesApi from "~/api/agentVoicesApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { AgentVoiceModel } from "~/models/AgentVoiceModel";

// Create agent voice
export const useCreateAgentVoice = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (voice: Partial<AgentVoiceModel>) => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.createVoice(voice);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentVoices"] });
    },
    onError: (error) => {
      console.error("Error creating agent voice:", error);
    },
  });
};

// Get all agent voices
export const useGetAllAgentVoices = (params?: Record<string, string>) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["agentVoices", params],
    queryFn: async () => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findAllVoices(params);
    },
  });
};

// Get one agent voice by id
export const useGetAgentVoice = (id: string) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["agentVoice", id],
    queryFn: async () => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.findVoice(id);
    },
    enabled: !!id,
  });
};

// Update agent voice
export const useUpdateAgentVoice = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AgentVoiceModel>;
    }) => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.updateVoice(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentVoices"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["agentVoice", data.id] });
      }
    },
    onError: (error) => {
      console.error("Error updating agent voice:", error);
    },
  });
};

// Delete agent voice
export const useDeleteAgentVoice = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token.token}`,
      });
      return api.deleteVoice(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["agentVoices"] });
      queryClient.invalidateQueries({ queryKey: ["agentVoice", id] });
    },
    onError: (error) => {
      console.error("Error deleting agent voice:", error);
    },
  });
};

// Get Elevenlabs voices
export const useGetElevenlabsVoices = (params?: Record<string, string>) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["elevenlabsVoices", params],
    queryFn: async () => {
      const api = agentVoicesApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getElevenlabsVoices(params);
    },
  });
};
