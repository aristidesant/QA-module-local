import axios from "axios";
// import { getAuthorizationHeader } from "../utils/tokenUtils";
import type { Prompt } from "../models/PromptsModels";
import { DEFAULT_API_URL } from "./config";

/**
 * Generic Prompt Generator API client
 * Note: Authorization handled by global Axios interceptor.
 */
const promptGeneratorApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE prompt
    createPrompt: async (prompt: Partial<Prompt>) => {
      const response = await axios.post(`${DEFAULT_API_URL}/prompts`, prompt);
      return response.data;
    },

    // FIND ALL prompts
    findAllPrompts: async (params?: {
      status?: "ACTIVE" | "INACTIVE";
      cursor?: string;
      limit?: number;
    }) => {
      const response = await axios.get<Prompt[]>(`${DEFAULT_API_URL}/prompts`, {
        params,
        timeout: 5000,
      });
      return response.data;
    },

    // FIND ONE prompt
    findPrompt: async (promptId: string) => {
      const response = await axios.get<Prompt>(
        `${DEFAULT_API_URL}/prompts/${promptId}`
      );
      return response.data;
    },

    // UPDATE prompt (PATCH)
    updatePrompt: async (promptId: string, data: Partial<Prompt>) => {
      const response = await axios.patch<Prompt>(
        `${DEFAULT_API_URL}/prompts/${promptId}`,
        data
      );
      return response.data;
    },

    // DELETE prompt
    deletePrompt: async (promptId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompts/${promptId}`
      );
      return response.data;
    },
  };
};

export default promptGeneratorApi;
