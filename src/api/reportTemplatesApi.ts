import axios, { type AxiosResponse } from 'axios';
import type {
	ReportTemplate,
	ReportValue,
	CreateReportTemplateDto,
	UpdateReportTemplateDto,
	BulkUpdateReportTemplateColumnsDto,
	ExportReportTemplateDto,
	CreateReportValueWithTemplateDto,
	UpdateReportValueDto,
} from '~/models/ReportValue';
import { DEFAULT_API_URL } from './config';

const reportTemplatesApi = () => {
	return {
		list: async (): Promise<ReportTemplate[]> => {
			const response = await axios.get<ReportTemplate[]>(
				`${DEFAULT_API_URL}/report-values/templates`
			);
			return response.data;
		},

		getById: async (id: number): Promise<ReportTemplate> => {
			const response = await axios.get<ReportTemplate>(
				`${DEFAULT_API_URL}/report-values/templates/${id}`
			);
			return response.data;
		},

		create: async (dto: CreateReportTemplateDto): Promise<ReportTemplate> => {
			const response = await axios.post<ReportTemplate>(
				`${DEFAULT_API_URL}/report-values/templates`,
				dto
			);
			return response.data;
		},

		update: async (
			id: number,
			dto: UpdateReportTemplateDto
		): Promise<ReportTemplate> => {
			const response = await axios.patch<ReportTemplate>(
				`${DEFAULT_API_URL}/report-values/templates/${id}`,
				dto
			);
			return response.data;
		},

		delete: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/report-values/templates/${id}`);
		},

		export: async (
			id: number,
			dto: ExportReportTemplateDto
		): Promise<AxiosResponse<Blob>> => {
			const response = await axios.post<Blob>(
				`${DEFAULT_API_URL}/report-values/templates/${id}/export`,
				dto,
				{
					responseType: 'blob',
					validateStatus: (status) => status < 500,
				}
			);

			if (response.status >= 400) {
				const text = await response.data.text();
				let message = 'Export failed';
				try {
					const json = JSON.parse(text);
					message = Array.isArray(json.message)
						? json.message.join(', ')
						: (json.message ?? message);
				} catch {
					/* not JSON */
				}
				throw new Error(message);
			}

			return response;
		},

		getColumns: async (
			templateId: number,
			params?: {
				page?: number;
				limit?: number;
				originType?: string;
				dataType?: string;
			}
		): Promise<ReportValue[]> => {
			const response = await axios.get<ReportValue[]>(
				`${DEFAULT_API_URL}/report-values`,
				{
					params: { reportTemplateId: templateId, ...params },
				}
			);
			return response.data;
		},

		getAllColumns: async (templateId: number): Promise<ReportValue[]> => {
			const response = await axios.get<ReportValue[]>(
				`${DEFAULT_API_URL}/report-values/columns/${templateId}`
			);
			return response.data;
		},

		bulkUpdateColumns: async (
			templateId: number,
			dto: BulkUpdateReportTemplateColumnsDto
		): Promise<ReportValue[]> => {
			const response = await axios.patch<ReportValue[]>(
				`${DEFAULT_API_URL}/report-values/templates/${templateId}/columns`,
				dto
			);
			return response.data;
		},

		createColumn: async (
			dto: CreateReportValueWithTemplateDto
		): Promise<ReportValue> => {
			const response = await axios.post<ReportValue>(
				`${DEFAULT_API_URL}/report-values`,
				dto
			);
			return response.data;
		},

		updateColumn: async (
			id: number,
			dto: UpdateReportValueDto
		): Promise<ReportValue> => {
			const response = await axios.patch<ReportValue>(
				`${DEFAULT_API_URL}/report-values/${id}`,
				dto
			);
			return response.data;
		},

		deleteColumn: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/report-values/${id}`);
		},

		duplicateColumn: async (
			id: number,
			dto: { sheet: number; sheetName: string; order: number; label: string }
		): Promise<ReportValue> => {
			const response = await axios.post<ReportValue>(
				`${DEFAULT_API_URL}/report-values/${id}/duplicate`,
				dto
			);
			return response.data;
		},
	};
};

export default reportTemplatesApi;
