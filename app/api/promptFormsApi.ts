import axios from "axios";
import type { PromptForm } from "~/models/PromptFormMOdel";
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
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const promptFormsApi = (authHeader: Record<string, string>) => {
  return {
    // CREATE prompt form
    createPromptForm: async (promptForm: Partial<PromptForm>) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/prompt-forms`,
        promptForm,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // FIND ALL prompt forms
    findAllPromptForms: async (
      params?: Record<string, any>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<PromptForm[]>(
        `${DEFAULT_API_URL}/prompt-forms`,
        {
          params,
          headers: { ...authHeader, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE prompt form
    findPromptForm: async (promptFormId: string) => {
      const response = await axios.get<PromptForm>(
        `${DEFAULT_API_URL}/prompt-forms/${promptFormId}`,
        { headers: authHeader }
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
        data,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // DELETE prompt form
    deletePromptForm: async (promptFormId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/prompt-forms/${promptFormId}`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },
  };
};

export default promptFormsApi;
