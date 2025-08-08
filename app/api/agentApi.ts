import axios from "axios";
import type { BodyCreateAgentV1ConvaiAgentsCreatePost } from "elevenlabs/api";
import type AgentListObject from "~/models/AgentListObject";

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
 * Generic Agent API client (uses global axios interceptors for auth)
 */
const agentApi = (_authHeader: Record<string, string> = {}) => {
  return {
    // CREATE agent
    createAgent: async (agent: BodyCreateAgentV1ConvaiAgentsCreatePost) => {
      const response = await axios.post(`${DEFAULT_API_URL}/agents`, agent);
      return response.data;
    },

    // FIND ALL agents
    findAllAgents: async (
      params?: {
        agentName?: string;
        agentId?: string;
        cursor?: string;
        limit?: number;
      },
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<AgentListObject[]>(
        `${DEFAULT_API_URL}/agents`,
        {
          params,
          ...(extraHeaders ? { headers: extraHeaders } : {}),
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE agent
    findAgent: async (agentId: string) => {
      const response = await axios.get<AgentListObject>(
        `${DEFAULT_API_URL}/agents/${agentId}`
      );
      return response.data;
    },

    // UPDATE agent (PATCH)
    updateAgent: async (agentId: string, data: Partial<AgentListObject>) => {
      // Convert camelCase to snake_case for API
      const response = await axios.patch(
        `${DEFAULT_API_URL}/agents/${agentId}`,
        data
      );
      // Convert response back to camelCase
      return response.data;
    },

    // DELETE agent
    deleteAgent: async (agentId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/agents/${agentId}`
      );
      return response.data;
    },
  };
};

export default agentApi;
