import type {
	CreateReportTemplatePayload,
	GeneratedReport,
	GenerateReportPayload,
	PaginatedResponse,
	ReportTemplate,
	ReportTemplateListQueryParams,
	UpdateReportTemplatePayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getReportTemplates(params?: ReportTemplateListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<ReportTemplate>>(
		'/report-templates',
		{ params }
	);
	return response.data;
}

export async function getReportTemplateDetail(templateId: number) {
	const response = await qaHttpClient.get<ReportTemplate>(
		`/report-templates/${templateId}`
	);
	return response.data;
}

export async function getGeneratedReports(templateId: number) {
	const response = await qaHttpClient.get<PaginatedResponse<GeneratedReport>>(
		`/report-templates/${templateId}/reports`
	);
	return response.data;
}

export async function createReportTemplate(payload: CreateReportTemplatePayload) {
	const response = await qaHttpClient.post<ReportTemplate>(
		'/report-templates',
		payload
	);
	return response.data;
}

export async function updateReportTemplate(templateId: number, payload: UpdateReportTemplatePayload) {
	const response = await qaHttpClient.patch<ReportTemplate>(
		`/report-templates/${templateId}`,
		payload
	);
	return response.data;
}

export async function generateReport(templateId: number, payload: GenerateReportPayload) {
	const response = await qaHttpClient.post<GeneratedReport>(
		`/report-templates/${templateId}/generate`,
		payload
	);
	return response.data;
}
