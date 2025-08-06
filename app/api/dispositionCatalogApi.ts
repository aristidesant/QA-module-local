import axios from "axios";
import type {
  DispositionCatalogModel,
  CreateDispositionCatalog,
} from "~/models/DispositionCatalogModels";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";

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
 * Disposition Catalog API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const dispositionCatalogApi = (authHeader: Record<string, string>) => {
  return {
    // GET all disposition catalogs
    getAllDispositionCatalogs: async () => {
      const response = await axios.get<DispositionCatalogModel[]>(
        `${DEFAULT_API_URL}/disposition-catalogs`,
        { headers: authHeader }
      );
      return response.data;
    },

    // POST create disposition catalog
    createDispositionCatalog: async (data: CreateDispositionCatalog) => {
      const response = await axios.post<DispositionCatalogModel>(
        `${DEFAULT_API_URL}/disposition-catalogs`,
        data,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // PUT update disposition catalog
    updateDispositionCatalog: async (
      id: number,
      data: CreateDispositionCatalog
    ) => {
      const response = await axios.patch<DispositionCatalogModel>(
        `${DEFAULT_API_URL}/disposition-catalogs/${id}`,
        data,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // GET current disposition flow for a campaign
    getCurrentDispositionFlow: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-catalogs/flow/current?campaignId=${campaignId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // POST save disposition configuration for a campaign
    saveDispositionConfiguration: async (
      campaignId: string | number,
      dispositionData: object
    ) => {
      const response = await axios.post(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/disposition-configuration`,
        dispositionData,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // POST save disposition flow
    saveDispositionFlow: async (
      data: Partial<DispositionFlowModel> & {
        campaignId: string | number;
        name?: string; // Allow optional name for the flow
      }
    ) => {
      const response = await axios.post<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-catalogs/flow`,
        data,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  };
};

export default dispositionCatalogApi;
