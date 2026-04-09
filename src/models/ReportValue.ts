export enum ReportValueOriginType {
	SQL = 'SQL',
	DYNAMIC = 'DYNAMIC',
	OBJECT = 'OBJECT',
	METADATA = 'METADATA',
}

export enum ReportValueDataType {
	STRING = 'STRING',
	NUMBER = 'NUMBER',
	BOOLEAN = 'BOOLEAN',
	DATE = 'DATE',
	DATETIME = 'DATETIME',
}

export interface ReportValue {
	id: number;
	originType: ReportValueOriginType;
	key: string;
	label: string;
	dataType: ReportValueDataType;
	format?: string | null;
	order: number;
	sheet: number;
	sheetName: string;
	campaignId: number;
	userId: number;
	clientId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface CreateReportValueDto {
	originType: ReportValueOriginType;
	key: string;
	label: string;
	dataType: ReportValueDataType;
	order?: number;
	sheet?: number;
	sheetName?: string;
	campaignId: number;
}

export interface UpdateReportValueDto {
	originType?: ReportValueOriginType;
	key?: string;
	label?: string;
	dataType?: ReportValueDataType;
	format?: string | null;
	order?: number;
	sheet?: number;
	sheetName?: string;
}

export interface BulkUpdateReportValueItemDto {
	id: number;
	originType?: ReportValueOriginType;
	key?: string;
	label?: string;
	dataType?: ReportValueDataType;
	format?: string | null;
	order?: number;
	sheet?: number;
	sheetName?: string;
}

export interface BulkUpdateReportValuesDto {
	reportValues: BulkUpdateReportValueItemDto[];
}

export interface DuplicateReportValueDto {
	sheet: number;
	sheetName: string;
	order: number;
	label: string;
}
