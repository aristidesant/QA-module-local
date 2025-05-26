import axios from "axios";
import type {
  AgentVoice,
  AgentVoiceDBModel,
  AgentVoiceResponse,
} from "~/models/AgentVoiceModel";

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
 * Agent Voices API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const agentVoicesApi = (authHeader: Record<string, string>) => {
  return {
    // CREATE voice
    createVoice: async (voice: Partial<AgentVoiceDBModel>) => {
      const response = await axios.post(`${DEFAULT_API_URL}/voices`, voice, {
        headers: authHeader,
      });
      return response.data;
    },

    // FIND ALL voices
    findAllVoices: async (
      params?: Record<string, string>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<AgentVoiceDBModel[]>(
        `${DEFAULT_API_URL}/voices`,
        {
          params,
          headers: { ...authHeader, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE voice
    findVoice: async (voiceId: string) => {
      const response = await axios.get<AgentVoiceDBModel>(
        `${DEFAULT_API_URL}/voices/${voiceId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // UPDATE voice (PATCH)
    updateVoice: async (voiceId: string, data: Partial<AgentVoiceDBModel>) => {
      const response = await axios.patch<AgentVoiceDBModel>(
        `${DEFAULT_API_URL}/voices/${voiceId}`,
        data,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // DELETE voice
    deleteVoice: async (voiceId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/voices/${voiceId}`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // GET voices from /voices/elevenlabs (returns AgentVoiceResponse)
    getElevenlabsVoices: async (
      params?: Record<string, string>,
      extraHeaders?: Record<string, string>
    ) => {
      const response = await axios.get<AgentVoiceResponse>(
        `${DEFAULT_API_URL}/voices/elevenlabs`,
        {
          params: {
            ...params,
          },
          headers: { ...authHeader, ...(extraHeaders || {}) },
          timeout: 5000,
        }
      );
      return response.data;
    },
  };
};

export default agentVoicesApi;
