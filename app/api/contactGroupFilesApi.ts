import axios from "axios";
import type {
  ContactFileSummary,
  ProcessContactGroupFileRequest,
  ProcessContactGroupFileResponse,
} from "~/models/ContactFileSummary";

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
 * Contact Group Files API client
 * Note: Authorization handled by global Axios interceptor.
 */
const contactGroupFilesApi = (_authHeader?: Record<string, string>) => {
  return {
    /**
     * Uploads a contact group file
     * @param file - The CSV file to upload
     * @param campaignId - The campaign ID to associate with the file
     * @returns The uploaded file information
     */
    uploadContactGroupFile: async (file: File, campaignId: number) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId.toString());

      const response = await axios.post<ContactFileSummary>(
        `${DEFAULT_API_URL}/contact-group-files/upload`,
        formData
      );
      return response.data;
    },

    /**
     * Processes a contact group file with the provided field mappings
     * @param data - The processing configuration including field mappings
     * @returns The processing result with status and statistics
     */
    processContactGroupFile: async (
      data: ProcessContactGroupFileRequest
    ): Promise<ProcessContactGroupFileResponse> => {
      const response = await axios.post<ProcessContactGroupFileResponse>(
        `${DEFAULT_API_URL}/contact-group-files/process`,
        data
      );
      return response.data;
    },
  };
};

export default contactGroupFilesApi;
