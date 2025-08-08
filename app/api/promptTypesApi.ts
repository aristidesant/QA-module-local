import axios from "axios";
import type { PromptType } from "~/models/PromptTypeModel";
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
 * Generic Prompt Types API client
 * Note: Authorization handled by global Axios interceptor.
 */
const promptTypesApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE prompt type
    createPromptType: async (promptType: Partial<PromptType>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/prompt-types`,
        promptType
      );
      return response.data;
    },

    // FIND ALL prompt types
    findAllPromptTypes: async (params?: Record<string, string>) => {
      const response = await axios.get<PromptType[]>(
        `${DEFAULT_API_URL}/prompt-types`,
        {
          params,
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE prompt type
    findPromptType: async (promptTypeId: string) => {
      const response = await axios.get<PromptType>(
        `${DEFAULT_API_URL}/prompt-types/${promptTypeId}`
      );
      return response.data;
    },

    // UPDATE prompt type (PATCH)
    updatePromptType: async (
      promptTypeId: string,
      data: Partial<PromptType>
    ) => {
      const response = await axios.patch<PromptType>(
        `${DEFAULT_API_URL}/prompt-types/${promptTypeId}`,
        data
      );
      return response.data;
    },

    // DELETE prompt type
    deletePromptType: async (promptTypeId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompt-types/${promptTypeId}`
      );
      return response.data;
    },
  };
};

export default promptTypesApi;
