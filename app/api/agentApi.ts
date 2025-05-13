import axios from "axios";
import { getToken } from "../utils/tokenUtils";
import type {
  BodyCreateAgentV1ConvaiAgentsCreatePost,
  BodyPatchesAnAgentSettingsV1ConvaiAgentsAgentIdPatch,
} from "elevenlabs/api";
import type AgentListObject from "~/models/AgentListObject";

const DEFAULT_API_URL = process.env.API_URL as string;

const agentApi = (request?: Request, token?: string) => {
  const getAuthHeaders = async () => {
    const authToken = await getToken(request);
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  return {
    createAgent: async (agent: BodyCreateAgentV1ConvaiAgentsCreatePost) => {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${DEFAULT_API_URL}/agents`, agent, {
        headers,
      });
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
      const headers = await getAuthHeaders();
      const response = await axios.get<AgentListObject[]>(
        `${DEFAULT_API_URL}/agents`,
        {
          params,
          headers: { ...headers, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      console.log("Response from findAllAgents:", response.data);
      return response.data;
    },

    // FIND ONE agent
    findAgent: async (agentId: string) => {
      const headers = await getAuthHeaders();
      const response = await axios.get<AgentListObject>(
        `${DEFAULT_API_URL}/agents/${agentId}`,
        { headers }
      );
      return response.data;
    },

    // UPDATE agent
    updateAgent: async (
      agentId: string,
      data: BodyPatchesAnAgentSettingsV1ConvaiAgentsAgentIdPatch
    ) => {
      const headers = await getAuthHeaders();
      const response = await axios.patch(
        `${DEFAULT_API_URL}/agents/${agentId}`,
        data,
        {
          headers,
        }
      );
      return response.data;
    },

    // DELETE agent
    deleteAgent: async (agentId: string) => {
      const headers = await getAuthHeaders();
      const response = await axios.delete(
        `${DEFAULT_API_URL}/agents/${agentId}`,
        {
          headers,
        }
      );
      return response.data;
    },
  };
};

export default agentApi;
