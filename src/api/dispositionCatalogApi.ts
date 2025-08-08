import axios from "axios";
import type {
  DispositionCatalogModel,
  CreateDispositionCatalog,
} from "~/models/DispositionCatalogModels";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import { DEFAULT_API_URL } from "./config";

/**
 * Disposition Catalog API client
 * Note: Authorization handled by global Axios interceptor.
 */
const dispositionCatalogApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all disposition catalogs
    getAllDispositionCatalogs: async () => {
      const response = await axios.get<DispositionCatalogModel[]>(
        `${DEFAULT_API_URL}/disposition-catalogs`
      );
      return response.data;
    },

    // POST create disposition catalog
    createDispositionCatalog: async (data: CreateDispositionCatalog) => {
      const response = await axios.post<DispositionCatalogModel>(
        `${DEFAULT_API_URL}/disposition-catalogs`,
        data
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
        data
      );
      return response.data;
    },

    // DELETE a disposition catalog by ID
    deleteDispositionCatalog: async (id: number) => {
      await axios.delete(`${DEFAULT_API_URL}/disposition-catalogs/${id}`);
    },

    // GET current disposition flow for a campaign
    getCurrentDispositionFlow: async (campaignId: string | number) => {
      const response = await axios.get<DispositionFlowModel>(
        `${DEFAULT_API_URL}/disposition-catalogs/flow/current?campaignId=${campaignId}`
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
        dispositionData
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
        data
      );
      return response.data;
    },
  };
};

export default dispositionCatalogApi;
