import axios from "axios";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import { DEFAULT_API_URL } from "./config";

/**
 * Disposition Flow API client
 * Note: Authorization handled by global Axios interceptor.
 */
const dispositionFlowApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all disposition flows
    getAllDispositionFlows: async () => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows`
      );
      return response.data;
    },

    // GET disposition flow by ID
    getDispositionFlowById: async (id: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows/${id}`
      );
      return response.data;
    },

    // POST create disposition flow
    createDispositionFlow: async (data: Partial<DispositionFlowModel>) => {
      const response = await axios.post<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows`,
        data
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
        data
      );
      return response.data;
    },

    // DELETE disposition flow
    deleteDispositionFlow: async (id: string | number) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/disposition-flows/${id}`
      );
      return response.data;
    },

    // GET disposition flows by campaign ID (query parameter)
    getDispositionFlowsByCampaign: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows?campaignId=${campaignId}`
      );
      return response.data;
    },

    // GET disposition flows by campaign ID (path parameter)
    getDispositionFlowsByCampaignPath: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-flows/campaign/${campaignId}`
      );
      return response.data;
    },

    // GET disposition flows by user ID
    getDispositionFlowsByUser: async (userId: string | number) => {
      const response = await axios.get<DispositionFlowModel[]>(
        `${DEFAULT_API_URL}/disposition-flows?userId=${userId}`
      );
      return response.data;
    },
  };
};

export default dispositionFlowApi;
