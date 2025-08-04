import axios from "axios";
import type { DispositionNode } from "~/models/DispositionNodeModel";

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
 * Disposition Nodes API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const dispositionNodesApi = (authHeader: Record<string, string>) => {
  return {
    // Create new node
    createNode: async (data: Partial<DispositionNode>) => {
      const response = await axios.post<DispositionNode>(
        `${DEFAULT_API_URL}/disposition-nodes`,
        data,
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      return response.data;
    },

    // Get all nodes (with filters)
    getNodes: async (params?: Record<string, any>) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes`,
        { headers: authHeader, params }
      );
      return response.data;
    },

    // Get specific node
    getNodeById: async (id: number | string) => {
      const response = await axios.get<DispositionNode>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Update node
    updateNode: async (id: number | string, data: Partial<DispositionNode>) => {
      const response = await axios.patch<DispositionNode>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}`,
        data,
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      return response.data;
    },

    // Soft delete node
    deleteNode: async (id: number | string) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/disposition-nodes/${id}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Restore deleted node
    restoreNode: async (id: number | string) => {
      const response = await axios.put<DispositionNode>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}/restore`,
        {},
        { headers: authHeader }
      );
      return response.data;
    },

    // Get complete tree structure for catalog
    getTreeByCatalog: async (catalogId: number | string) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes/tree/catalog/${catalogId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Get root nodes for catalog
    getRootsByCatalog: async (catalogId: number | string) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes/roots/catalog/${catalogId}`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Get direct children
    getChildren: async (id: number | string) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}/children`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Get all ancestors
    getAncestors: async (id: number | string) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}/ancestors`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Get all descendants
    getDescendants: async (id: number | string) => {
      const response = await axios.get<DispositionNode[]>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}/descendants`,
        { headers: authHeader }
      );
      return response.data;
    },

    // Move node to new parent
    moveNode: async (id: number | string, parentId: number | null) => {
      const response = await axios.put<DispositionNode>(
        `${DEFAULT_API_URL}/disposition-nodes/${id}/move`,
        { parentId },
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      return response.data;
    },

    // Bulk update node orders
    bulkUpdateOrder: async (orders: Array<{ id: number; order: number }>) => {
      const response = await axios.put(
        `${DEFAULT_API_URL}/disposition-nodes/bulk-order`,
        orders,
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      return response.data;
    },
  };
};

export default dispositionNodesApi;
