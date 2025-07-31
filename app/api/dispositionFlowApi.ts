import axios from "axios";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";

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
 * Disposition Flow API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const dispositionFlowApi = (authHeader: Record<string, string>) => {
  return {
    // GET all disposition flows
    getAllDispositionFlows: async () => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows`,
        { headers: authHeader }
      );
      return response.data;
    },

    // GET disposition flow by ID
    getDispositionFlowById: async (id: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows/${id}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // POST create disposition flow
    createDispositionFlow: async (data: Partial<DispositionFlowModel>) => {
      const response = await axios.post<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows`,
        data,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // PATCH update disposition flow
    updateDispositionFlow: async (
      id: string | number,
      data: Partial<DispositionFlowModel>
    ) => {
      const response = await axios.patch<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows/${id}`,
        data,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // DELETE disposition flow
    deleteDispositionFlow: async (id: string | number) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/disposition-flows/${id}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // GET disposition flows by campaign ID (query parameter)
    getDispositionFlowsByCampaign: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows?campaignId=${campaignId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // GET disposition flows by campaign ID (path parameter)
    getDispositionFlowsByCampaignPath: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows/campaign/${campaignId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // GET disposition flows by user ID
    getDispositionFlowsByUser: async (userId: string | number) => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows?userId=${userId}`,
        { headers: authHeader }
      );
      return response.data;
    },
  };
};

export default dispositionFlowApi;
