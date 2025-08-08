import axios from "axios";
import type { ToolModel } from "~/models/ToolModel";

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
 * Tool API client
 * Note: Authorization handled by global Axios interceptor.
 */
const toolApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all tools
    getAllTools: async () => {
      const response = await axios.get<ToolModel[]>(`${DEFAULT_API_URL}/tools`);
      return response.data;
    },

    // GET tool by ID
    getToolById: async (id: string | number) => {
      const response = await axios.get<ToolModel>(
        `${DEFAULT_API_URL}/tools/${id}`
      );
      return response.data;
    },

    // POST create tool
    createTool: async (data: Partial<ToolModel>) => {
      const response = await axios.post<ToolModel>(
        `${DEFAULT_API_URL}/tools`,
        data
      );
      return response.data;
    },

    // PUT update tool
    updateTool: async (id: string | number, data: Partial<ToolModel>) => {
      const response = await axios.put<ToolModel>(
        `${DEFAULT_API_URL}/tools/${id}`,
        data
      );
      return response.data;
    },

    // DELETE tool
    deleteTool: async (id: string | number) => {
      const response = await axios.delete(`${DEFAULT_API_URL}/tools/${id}`);
      return response.data;
    },

    // POST create tool bulk
    createToolBulk: async (data: Partial<ToolModel>[]) => {
      const response = await axios.post<ToolModel[]>(
        `${DEFAULT_API_URL}/tools/bulk`,
        data
      );
      return response.data;
    },

    // GET tools by category
    getToolsByCategory: async (categoryId: string | number) => {
      const response = await axios.get<ToolModel[]>(
        `${DEFAULT_API_URL}/tools/categories/${categoryId}/tools`
      );
      return response.data;
    },
  };
};

export default toolApi;
