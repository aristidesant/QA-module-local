import axios from "axios";
import type { AgentVoiceModel } from "~/models/AgentVoiceModel";

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
 * Note: Authorization is handled by a global Axios interceptor.
 */
const agentVoicesApi = (_authHeader?: Record<string, string>) => {
  return {
    // CREATE voice
    createVoice: async (voice: Partial<AgentVoiceModel>) => {
      const response = await axios.post(`${DEFAULT_API_URL}/voices`, voice);
      return response.data;
    },

    // FIND ALL voices
    findAllVoices: async (params?: Record<string, string>) => {
      const response = await axios.get<AgentVoiceModel[]>(
        `${DEFAULT_API_URL}/voices`,
        {
          params,
          timeout: 5000,
        }
      );
      return response.data;
    },

    // FIND ONE voice
    findVoice: async (voiceId: string) => {
      const response = await axios.get<AgentVoiceModel>(
        `${DEFAULT_API_URL}/voices/${voiceId}`
      );
      return response.data;
    },

    // UPDATE voice (PATCH)
    updateVoice: async (voiceId: string, data: Partial<AgentVoiceModel>) => {
      const response = await axios.patch<AgentVoiceModel>(
        `${DEFAULT_API_URL}/voices/${voiceId}`,
        data
      );
      return response.data;
    },

    // DELETE voice
    deleteVoice: async (voiceId: string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/voices/${voiceId}`
      );
      return response.data;
    },

    // GET voices from /voices/elevenlabs (returns AgentVoiceResponse)
    getElevenlabsVoices: async (params?: Record<string, string>) => {
      const response = await axios.get<AgentVoiceModel>(
        `${DEFAULT_API_URL}/voices/elevenlabs`,
        {
          params: {
            ...params,
          },
          timeout: 5000,
        }
      );
      return response.data;
    },
  };
};

export default agentVoicesApi;
