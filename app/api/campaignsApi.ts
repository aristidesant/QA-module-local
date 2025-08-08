import axios from "axios";
import type { Campaign } from "~/models/CampaignsModel";
// import { getAuthorizationHeader } from "../utils/tokenUtils";

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
 * Generic Campaigns API client (uses global axios interceptors for auth)
 */
const campaignsApi = (_authHeader: Record<string, string> = {}) => {
  return {
    // CREATE campaign
    createCampaign: async (campaign: Partial<Campaign>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/campaigns`,
        campaign
      );
      return response.data;
    },

    // FIND ALL campaigns
    findAllCampaigns: async (
      params?: Record<string, any>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<Campaign[]>(
        `${DEFAULT_API_URL}/campaigns`,
        {
          params,
          ...(extraHeaders ? { headers: extraHeaders } : {}),
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE campaign
    findCampaign: async (campaignId: string) => {
      const response = await axios.get<Campaign>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}`
      );
      return response.data;
    },

    // UPDATE campaign (PATCH)
    updateCampaign: async (campaignId: string, data: Partial<Campaign>) => {
      console.log(
        `Updating campaign with ID: ${campaignId}, Data: ${JSON.stringify(
          data
        )}`
      );
      const response = await axios.patch<Campaign>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}`,
        data
      );
      return response.data;
    },

    // DELETE campaign
    deleteCampaign: async (campaignId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/campaigns/${campaignId}`
      );
      return response.data;
    },
  };
};

export default campaignsApi;
