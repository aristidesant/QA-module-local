import axios from "axios";

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
 * Client Config API client (relies on global axios interceptor for auth)
 */
const clientConfigApi = () => {
  return {
    // Get client config by name
    getClientConfig: async (name: string) => {
      const response = await axios.get(
        `${DEFAULT_API_URL}/client-configs/${name}`,
        {
          timeout: 5000,
        }
      );
      return response.data;
    },
  };
};

export default clientConfigApi;
