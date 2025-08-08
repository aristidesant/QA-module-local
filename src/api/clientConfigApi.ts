import axios from "axios";
import { DEFAULT_API_URL } from "./config";

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
