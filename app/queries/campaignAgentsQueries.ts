import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignAgentsApi from "~/api/campaignAgentsApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { CampaignAgent } from "~/models/CampaignAgentModel";

// filepath: src/modules/campaign_agents/queries/campaignAgentsQueries.ts

// Create campaign agent (assign agent to campaign)
export const useCreateCampaignAgent = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    // Expects: { campaignId, agentData }
    mutationFn: async ({
      campaignId,
      agentId,
    }: {
      campaignId: number;
      agentId: string;
    }) => {
      const api = campaignAgentsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.assignAgentToCampaign(campaignId, agentId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaignAgents"] });
      // eslint-disable-next-line no-console
      console.log("Campaign agent created successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error creating campaign agent:", error);
    },
  });
};

// Get all agents for a campaign
export const useGetCampaignAgents = (campaignId: number) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["campaignAgents", campaignId],
    queryFn: async () => {
      const api = campaignAgentsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getCampaignAgents(campaignId);
    },
    enabled: !!campaignId,
  });
};

// Get a single agent by id for a campaign
export const useGetCampaignAgent = (campaignId: number, id: number) => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  return useQuery({
    queryKey: ["campaignAgent", campaignId, id],
    queryFn: async () => {
      const api = campaignAgentsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getCampaignAgentById(campaignId, id);
    },
    enabled: !!campaignId && !!id,
  });
};

// Update campaign agent in a campaign
export const useUpdateCampaignAgent = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    // Expects: { campaignId, id, updateData }
    mutationFn: async ({
      campaignId,
      id,
      updateData,
    }: {
      campaignId: number;
      id: number;
      updateData: Partial<
        Omit<CampaignAgent, "id" | "createdAt" | "updatedAt" | "campaignId">
      >;
    }) => {
      const api = campaignAgentsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateCampaignAgent(campaignId, id, updateData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["campaignAgents", data?.campaignId],
      });
      if (data?.id && data?.campaignId) {
        queryClient.invalidateQueries({
          queryKey: ["campaignAgent", data.campaignId, data.id],
        });
      }
      // eslint-disable-next-line no-console
      console.log("Campaign agent updated successfully:", data);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error updating campaign agent:", error);
    },
  });
};

// Remove agent from campaign
export const useDeleteCampaignAgent = () => {
  const token = useToken();
  const header = getClientAuthorizationHeader();
  const queryClient = useQueryClient();
  return useMutation({
    // Expects: { campaignId, id }
    mutationFn: async ({
      campaignId,
      id,
    }: {
      campaignId: number;
      id: number;
    }) => {
      const api = campaignAgentsApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.removeAgentFromCampaign(campaignId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaignAgents", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaignAgent", variables.campaignId, variables.id],
      });
      // eslint-disable-next-line no-console
      console.log("Campaign agent deleted successfully:", variables);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Error deleting campaign agent:", error);
    },
  });
};
