import axios from "axios";
import type { CallDispositionModel } from "../models/CallDispositionModel";

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
 * Call Disposition API client
 * Note: Authorization is set by a global Axios interceptor.
 */
const callDispositionApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE call disposition
    createCallDisposition: async (data: Partial<CallDispositionModel>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/call-dispositions`,
        data
      );
      return response.data;
    },

    // FIND ALL call dispositions (by conversationId)
    findAllCallDispositions: async (params: { conversationId: string }) => {
      const response = await axios.get<CallDispositionModel>(
        `${DEFAULT_API_URL}/call-dispositions/details`,
        {
          params,
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND call disposition by conversationId
    findCallDispositionByConversationId: async (conversationId: number) => {
      const response = await axios.get(
        `${DEFAULT_API_URL}/call-dispositions/conversation/${conversationId}`
      );
      return response.data;
    },

    // FIND ONE call disposition
    findCallDisposition: async (id: string) => {
      const response = await axios.get<CallDispositionModel>(
        `${DEFAULT_API_URL}/call-dispositions/${id}`
      );
      return response.data;
    },

    // UPDATE call disposition (PATCH)
    updateCallDisposition: async (
      id: string,
      data: Partial<CallDispositionModel>
    ) => {
      const response = await axios.patch(
        `${DEFAULT_API_URL}/call-dispositions/${id}`,
        data
      );
      return response.data;
    },

    // DELETE call disposition
    deleteCallDisposition: async (id: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/call-dispositions/${id}`
      );
      return response.data;
    },
  };
};

export default callDispositionApi;
