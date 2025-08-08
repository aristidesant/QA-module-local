import axios from "axios";
import type {
  ConversationsModel,
  ConversationTableModel,
} from "~/models/ConversationsModels";

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

export type StartDemoParams = {
  agentId: string;
  phoneNumber: string;
  dynamicVariables?: {
    customerName: string;
    customerId: string;
  };
};

export type Conversation = {
  id: string;
  // Add other conversation fields as needed
  [key: string]: unknown;
};

export type UpdateConversationParams = {
  // Add fields that can be updated in a conversation
  [key: string]: unknown;
};

export type PostCallDataParams = {
  // Add fields for post-call data
  [key: string]: unknown;
};

/**
 * Generic Conversations API client (uses global axios interceptors for auth)
 */
const conversationsApi = (_authHeader: Record<string, string> = {}) => {
  return {
    // Create a new conversation
    createConversation: async (data: Record<string, unknown>) => {
      const response = await axios.post<Conversation>(
        `${DEFAULT_API_URL}/conversations`,
        data
      );
      return response.data;
    },

    // Get all conversations for current client
    getConversations: async () => {
      const response = await axios.get<ConversationTableModel[]>(
        `${DEFAULT_API_URL}/conversations`
      );
      return response.data;
    },

    // Start a new conversation
    startConversation: async (data: Record<string, unknown>) => {
      const response = await axios.post<Conversation>(
        `${DEFAULT_API_URL}/conversations/start`,
        data
      );
      return response.data;
    },

    // Start demo conversation
    startDemoConversation: async (params: StartDemoParams) => {
      const response = await axios.post<Conversation>(
        `${DEFAULT_API_URL}/conversations/start-demo`,
        params
      );
      return response.data;
    },

    // Webhook to receive post-call data
    postCallData: async (data: PostCallDataParams) => {
      const response = await axios.post<void>(
        `${DEFAULT_API_URL}/conversations/webhook/post-call-data`,
        data
      );
      return response.data;
    },

    // Get conversation by ID
    getConversationById: async (id: string) => {
      const response = await axios.get<ConversationsModel>(
        `${DEFAULT_API_URL}/conversations/${id}`
      );
      return response.data;
    },

    // Update a conversation
    updateConversation: async (id: string, data: UpdateConversationParams) => {
      const response = await axios.patch<Conversation>(
        `${DEFAULT_API_URL}/conversations/${id}`,
        data
      );
      return response.data;
    },

    // Delete a conversation
    deleteConversation: async (id: string) => {
      const response = await axios.delete<void>(
        `${DEFAULT_API_URL}/conversations/${id}`
      );
      return response.data;
    },
  };
};

export default conversationsApi;
