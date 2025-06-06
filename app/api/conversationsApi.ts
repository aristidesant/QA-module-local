import axios from "axios";

// filepath: /Users/ramonmena/Projects/n-ai/app/api/conversationsApi.ts

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

type StartDemoParams = {
  agentId: string;
  phoneNumber: string;
};

/**
 * Generic Conversations API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const conversationsApi = (authHeader: Record<string, string>) => {
  return {
    // START DEMO conversation
    startDemoConversation: async (params: StartDemoParams) => {
      const response = await axios.post<Record<string, unknown>>(
        `${DEFAULT_API_URL}/conversations/start-demo`,
        params,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },
  };
};

export default conversationsApi;
