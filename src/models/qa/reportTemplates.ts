import type { ListQueryParams } from './shared';

export type ReportExportFormat = 'PDF' | 'CSV' | 'EXCEL';
export type GenerationSchedule = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ReportTemplateFilter {
	filterType: string;
	value: string | number | unknown;
}

export interface ReportTemplateListQueryParams extends ListQueryParams {
	clientId?: number;
	createdByUserId?: number;
	sortBy?: 'id' | 'name' | 'createdAt' | 'lastGeneratedAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface ReportTemplate {
	id: number;
	clientId: number;
	createdByUserId: number;

	name: string;
	description?: string | null;

	// Saved filters
	filters: ReportTemplateFilter[];

	// Auto-generation configuration
	autoGenerateEnabled: boolean;
	generationSchedule?: GenerationSchedule | null;
	generationTime?: string | null;
	sendByEmailEnabled: boolean;
	emailRecipients?: string[] | null;

	// Export formats
	exportFormats: ReportExportFormat[];

	// Metadata
	lastGeneratedAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface GeneratedReport {
	id: number;
	templateId: number;
	clientId: number;

	generatedAt: string;
	fileKey?: string | null;
	fileFormat: ReportExportFormat;
	fileSize?: number | null;
	downloadUrl?: string | null;

	createdAt?: string;
}

export interface ReportTemplateWithReports extends ReportTemplate {
	generatedReports?: GeneratedReport[];
	reportCount?: number;
}

export interface CreateReportTemplatePayload {
	name: string;
	description?: string;
	filters: ReportTemplateFilter[];
	autoGenerateEnabled?: boolean;
	generationSchedule?: GenerationSchedule;
	generationTime?: string;
	sendByEmailEnabled?: boolean;
	emailRecipients?: string[];
	exportFormats: ReportExportFormat[];
}

export interface UpdateReportTemplatePayload {
	name?: string;
	description?: string;
	filters?: ReportTemplateFilter[];
	autoGenerateEnabled?: boolean;
	generationSchedule?: GenerationSchedule;
	generationTime?: string;
	sendByEmailEnabled?: boolean;
	emailRecipients?: string[];
	exportFormats?: ReportExportFormat[];
}

export interface GenerateReportPayload {
	templateId: number;
	exportFormat: ReportExportFormat;
	sendEmail?: boolean;
}
