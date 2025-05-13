import axios from "axios";
// import { getAuthorizationHeader } from "../utils/tokenUtils";
import type { Prompt } from "../models/PromptsModels";

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
 * Generic Prompt Generator API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const promptGeneratorApi = (authHeader: Record<string, string>) => {
  return {
    // CREATE prompt
    createPrompt: async (prompt: Partial<Prompt>) => {
      const response = await axios.post(`${DEFAULT_API_URL}/prompts`, prompt, {
        headers: authHeader,
      });
      return response.data;
    },

    // FIND ALL prompts
    findAllPrompts: async (
      params?: {
        status?: "ACTIVE" | "INACTIVE";
        cursor?: string;
        limit?: number;
      },
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<Prompt[]>(`${DEFAULT_API_URL}/prompts`, {
        params,
        headers: { ...authHeader, ...(extraHeaders || {}) },
        timeout: 5000,
      });
      return response.data;
    },

    // FIND ONE prompt
    findPrompt: async (promptId: string) => {
      const response = await axios.get<Prompt>(
        `${DEFAULT_API_URL}/prompts/${promptId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // UPDATE prompt (PATCH)
    updatePrompt: async (promptId: string, data: Partial<Prompt>) => {
      const response = await axios.patch<Prompt>(
        `${DEFAULT_API_URL}/prompts/${promptId}`,
        data,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // DELETE prompt
    deletePrompt: async (promptId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompts/${promptId}`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },
  };
};

export default promptGeneratorApi;
