import axios from "axios";
import { getToken } from "../utils/tokenUtils";
import type {
  BodyCreateAgentV1ConvaiAgentsCreatePost,
  BodyPatchesAnAgentSettingsV1ConvaiAgentsAgentIdPatch,
  GetAgentResponseModel,
  GetAgentsPageResponseModel,
} from "elevenlabs/api";
import type AgentListObject from "~/models/AgentListObject";

const DEFAULT_API_URL = process.env.API_URL as string;

const agentApi = (request?: Request, token?: string) => {
  const getAuthHeaders = async () => {
    const authToken = await getToken(request, token);
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  return {
    createAgent: async (
      agent: BodyCreateAgentV1ConvaiAgentsCreatePost,
      apiUrl: string = DEFAULT_API_URL
    ) => {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${apiUrl}/agents`, agent, { headers });
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
    findAgent: async (agentId: string, apiUrl: string = DEFAULT_API_URL) => {
      const headers = await getAuthHeaders();
      const response = await axios.get<GetAgentResponseModel>(
        `${apiUrl}/agents/${agentId}`,
        { headers }
      );
      return response.data;
    },

    // UPDATE agent
    updateAgent: async (
      agentId: string,
      data: BodyPatchesAnAgentSettingsV1ConvaiAgentsAgentIdPatch,
      apiUrl: string = DEFAULT_API_URL
    ) => {
      const headers = await getAuthHeaders();
      const response = await axios.patch(`${apiUrl}/agents/${agentId}`, data, {
        headers,
      });
      return response.data;
    },
  };
};

export default agentApi;
