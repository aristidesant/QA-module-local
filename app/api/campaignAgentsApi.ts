import axios from "axios";
import type { CampaignAgent } from "../models/CampaignAgentModel";

const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || process.env.API_URL;
  }
  if (typeof process !== "undefined") {
    return process.env.API_URL;
  }
  return undefined;
};

const DEFAULT_API_URL = getDefaultApiUrl() as string;

/**
 * Generic Campaign Agents API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const campaignAgentsApi = (authHeader: Record<string, string>) => {
  return {
    // ASSIGN agent to campaign
    assignAgentToCampaign: async (
      campaignId: number,
      agentId: string
    ): Promise<CampaignAgent> => {
      const { data } = await axios.post<CampaignAgent>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/agents`,
        { agentId, campaignId },
        { headers: authHeader }
      );
      return data;
    },

    // GET all agents for a campaign
    getCampaignAgents: async (
      campaignId: number,
      extraHeaders?: Record<string, string>
    ): Promise<CampaignAgent[]> => {
      const { data } = await axios.get<CampaignAgent[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/agents`,
        { headers: { ...authHeader, ...(extraHeaders || {}) } }
      );
      return data;
    },

    // GET a single agent by ID
    getCampaignAgentById: async (
      campaignId: number,
      id: number
    ): Promise<CampaignAgent> => {
      const { data } = await axios.get<CampaignAgent>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`,
        { headers: authHeader }
      );
      return data;
    },

    // UPDATE agent in campaign
    updateCampaignAgent: async (
      campaignId: number,
      id: number,
      updateData: Partial<
        Omit<CampaignAgent, "id" | "createdAt" | "updatedAt" | "campaignId">
      >
    ): Promise<CampaignAgent> => {
      const { data } = await axios.patch<CampaignAgent>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`,
        updateData,
        { headers: authHeader }
      );
      return data;
    },

    // REMOVE agent from campaign
    removeAgentFromCampaign: async (
      campaignId: number,
      id: number
    ): Promise<void> => {
      await axios.delete(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`,
        { headers: authHeader }
      );
    },
  };
};

export default campaignAgentsApi;
