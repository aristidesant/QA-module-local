import axios from "axios";
import { DEFAULT_API_URL } from "./config";

/**
 * File API client
 * - GET /files/access/{fileId}?presigned=true&expiresIn=...
 * - Returns a presigned URL string for temporary access
 *
 * Note: Authorization (if any) should be handled by global Axios interceptors,
 * consistent with other API clients in this project.
 */
export type GetPresignedUrlOptions = {
  /** Expiration time in seconds (server default will be used if not provided) */
  expiresIn?: number;
};

const fileApi = (_authHeader?: Record<string, string>) => {
  return {
    /**
     * Fetch a presigned URL for a file by ID.
     * Accepts both plain string response and object variants commonly used by APIs.
     */
    getPresignedFileUrl: async (
      fileId: number | string,
      options: GetPresignedUrlOptions = {}
    ): Promise<string> => {
      const { expiresIn } = options;

      const response = await axios.get<
        string | { url?: string; presignedUrl?: string; href?: string }
      >(`${DEFAULT_API_URL}/files/access/${fileId}`, {
        params: {
          presigned: true,
          ...(typeof expiresIn === "number" ? { expiresIn } : {}),
        },
        // Expect JSON or text; axios will parse JSON automatically
        // If server responds text/plain, data will be a string
        responseType: "json",
        // Small timeout to fail fast; adjust as needed
        timeout: 5000,
      });

      const data = response.data as unknown;

      if (typeof data === "string") {
        return data;
      }
      if (data && typeof data === "object") {
        const obj = data as {
          url?: string;
          presignedUrl?: string;
          href?: string;
        };
        const candidate = obj.url || obj.presignedUrl || obj.href;
        if (candidate) return candidate;
      }

      throw new Error("Unexpected response when requesting presigned file URL");
    },
  };
};

export default fileApi;
