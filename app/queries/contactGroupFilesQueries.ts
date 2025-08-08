import { useMutation } from "@tanstack/react-query";
import contactGroupFilesApi from "~/api/contactGroupFilesApi";
import type {
  ContactFileSummary,
  ProcessContactGroupFileRequest,
  ProcessContactGroupFileResponse,
} from "~/models/ContactFileSummary";

export interface ContactList {
  id: string;
  name: string;
  expires?: string;
  isActive: boolean;
}

interface UploadContactGroupFileOptions {
  onSuccess?: (data: ContactFileSummary) => void;
  onError?: (error: unknown) => void;
}

export const useUploadContactGroupFile = (
  options?: UploadContactGroupFileOptions
) => {
  return useMutation({
    mutationFn: async (params: {
      file: File;
      campaignId: string | number;
    }): Promise<ContactFileSummary> => {
      if (!params.campaignId) throw new Error("Campaign ID is required");
      const api = contactGroupFilesApi();
      return api.uploadContactGroupFile(params.file, Number(params.campaignId));
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

interface ProcessContactGroupFileOptions {
  onSuccess?: (data: ProcessContactGroupFileResponse) => void;
  onError?: (error: unknown) => void;
}

export const useProcessContactGroupFile = (
  options?: ProcessContactGroupFileOptions
) => {
  return useMutation({
    mutationFn: async (
      data: ProcessContactGroupFileRequest
    ): Promise<ProcessContactGroupFileResponse> => {
      const api = contactGroupFilesApi();
      return api.processContactGroupFile(data);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};
