import type FileModel from './FileModel';

export interface ContactFileSummary {
	contactGroupFileId: number;
	headers: string[];
	totalRows: number;
	file: FileModel;
}

export type ContactFileUploadResponse = ContactFileSummary;

// Support single or multiple csvField mappings per system field
export type CsvFieldMapping = { csvField: string };
export type MappedResult = Record<string, CsvFieldMapping | CsvFieldMapping[]>;

// Extended field mapping type that supports nested dynamicColumns
export type FieldMappingWithDynamicColumns = Record<
	string,
	CsvFieldMapping | CsvFieldMapping[] | MappedResult
>;

export interface ProcessContactGroupFileRequest {
	fieldMapping: FieldMappingWithDynamicColumns;
	contactGroupFileId: number;
	groupName: string;
	groupDescription: string;
	groupExpiration: string; // ISO date string
	groupMaxCallPerContact: number;
	groupMaxCallPerGroup: number;
	humanEquivalent: number;
	schedulerId: number;
	schemaId?: number;
	maxWaves: number;
	waveExecutionDelaySeconds: number;
}

export interface ProcessContactGroupFileResponse {
	success: boolean;
	message: string;
	contactGroupId?: number;
	totalProcessed?: number;
	failedCount?: number;
}

// Append previously uploaded file into an existing contact group
export interface AppendContactGroupFileRequest {
	contactGroupFileId: number;
	schemaId?: number;
}

export interface AppendContactGroupFileResponse {
	contactGroupFileId: number;
	contactGroupId: number;
	processedRows: number;
	errorRows: number;
	status: string; // e.g., "complete"
}
