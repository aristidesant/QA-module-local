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
 * Client Config API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const clientConfigApi = (authHeader: Record<string, string>) => {
  return {
    // Get client config by name
    getClientConfig: async (name: string) => {
      const response = await axios.get(
        `${DEFAULT_API_URL}/client-configs/${name}`,
        {
          headers: authHeader,
          timeout: 5000,
        }
      );
      return response.data;
    },
  };
};

export default clientConfigApi;
