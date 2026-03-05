export enum ReportValueOriginType {
	SQL = 'SQL',
	DYNAMIC = 'DYNAMIC',
	OBJECT = 'OBJECT',
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
	order: number;
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
	campaignId: number;
}

export interface UpdateReportValueDto {
	originType?: ReportValueOriginType;
	key?: string;
	label?: string;
	dataType?: ReportValueDataType;
	order?: number;
}
