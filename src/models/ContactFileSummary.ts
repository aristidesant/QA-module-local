import type FileModel from "./FileModel";

export interface ContactFileSummary {
  contactGroupFileId: number;
  headers: string[];
  totalRows: number;
  file: FileModel;
}

export type ContactFileUploadResponse = ContactFileSummary;

export type MappedResult = Record<string, { csvField: string }>;

export interface ProcessContactGroupFileRequest {
  fieldMapping: MappedResult;
  contactGroupFileId: number;
  groupName: string;
  groupDescription: string;
  groupExpiration: string; // ISO date string
  groupMaxCallPerContact: number;
  groupMaxCallPerGroup: number;
  schedulerId: number;
}

export interface ProcessContactGroupFileResponse {
  success: boolean;
  message: string;
  contactGroupId?: number;
  totalProcessed?: number;
  failedCount?: number;
}
