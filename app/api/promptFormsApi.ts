import axios from "axios";
import type { PromptForm } from "~/models/PromptFormModel";
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
 * Generic Prompt Forms API client
 * Note: Authorization handled by global Axios interceptor.
 */
const promptFormsApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE prompt form
    createPromptForm: async (promptForm: Partial<PromptForm>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/prompt-forms`,
        promptForm
      );
      return response.data;
    },

    // FIND ALL prompt forms
    findAllPromptForms: async (params?: Record<string, any>) => {
      const response = await axios.get<PromptForm[]>(
        `${DEFAULT_API_URL}/prompt-forms`,
        {
          params,
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE prompt form
    findPromptForm: async (promptFormId: string) => {
      const response = await axios.get<PromptForm>(
        `${DEFAULT_API_URL}/prompt-forms/${promptFormId}`
      );
      return response.data;
    },

    // UPDATE prompt form (PATCH)
    updatePromptForm: async (
      promptFormId: string,
      data: Partial<PromptForm>
    ) => {
      const response = await axios.patch<PromptForm>(
        `${DEFAULT_API_URL}/prompt-forms/${promptFormId}`,
        data
      );
      return response.data;
    },

    // DELETE prompt form
    deletePromptForm: async (promptFormId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompt-forms/${promptFormId}`
      );
      return response.data;
    },
  };
};

export default promptFormsApi;
