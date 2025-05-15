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
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const promptTypesApi = (authHeader: Record<string, string>) => {
  return {
    // CREATE prompt type
    createPromptType: async (promptType: Partial<PromptType>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/prompt-types`,
        promptType,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // FIND ALL prompt types
    findAllPromptTypes: async (
      params?: Record<string, string>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<PromptType[]>(
        `${DEFAULT_API_URL}/prompt-types`,
        {
          params,
          headers: { ...authHeader, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE prompt type
    findPromptType: async (promptTypeId: string) => {
      const response = await axios.get<PromptType>(
        `${DEFAULT_API_URL}/prompt-types/${promptTypeId}`,
        { headers: authHeader }
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
        data,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // DELETE prompt type
    deletePromptType: async (promptTypeId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompt-types/${promptTypeId}`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },
  };
};

export default promptTypesApi;
