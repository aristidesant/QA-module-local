import axios from "axios";
import type { PromptCategory } from "~/models/PromptCategoryModel";
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
 * Generic Prompt Categories API client
 * Note: Authorization handled by global Axios interceptor.
 */
const promptCategoriesApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE prompt category
    createPromptCategory: async (promptCategory: Partial<PromptCategory>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/prompt-categories`,
        promptCategory
      );
      return response.data;
    },

    // FIND ALL prompt categories
    findAllPromptCategories: async (params?: Record<string, string>) => {
      const response = await axios.get<PromptCategory[]>(
        `${DEFAULT_API_URL}/prompt-categories`,
        {
          params,
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE prompt category
    findPromptCategory: async (promptCategoryId: string) => {
      const response = await axios.get<PromptCategory>(
        `${DEFAULT_API_URL}/prompt-categories/${promptCategoryId}`
      );
      return response.data;
    },

    // UPDATE prompt category (PATCH)
    updatePromptCategory: async (
      promptCategoryId: string,
      data: Partial<PromptCategory>
    ) => {
      const response = await axios.patch<PromptCategory>(
        `${DEFAULT_API_URL}/prompt-categories/${promptCategoryId}`,
        data
      );
      return response.data;
    },

    // DELETE prompt category
    deletePromptCategory: async (promptCategoryId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompt-categories/${promptCategoryId}`
      );
      return response.data;
    },
  };
};

export default promptCategoriesApi;
