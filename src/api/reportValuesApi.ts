import axios from 'axios';
import type {
	ReportValue,
	CreateReportValueDto,
	UpdateReportValueDto,
} from '~/models/ReportValue';
import { DEFAULT_API_URL } from './config';

type ReportExportFormat = 'csv' | 'xlsx';

const reportValuesApi = () => {
	return {
		getColumns: async (contactGroupId: number): Promise<ReportValue[]> => {
			const response = await axios.get<ReportValue[]>(
				`${DEFAULT_API_URL}/report-values/columns/${contactGroupId}`
			);
			return response.data;
		},

		create: async (dto: CreateReportValueDto): Promise<ReportValue> => {
			const response = await axios.post<ReportValue>(
				`${DEFAULT_API_URL}/report-values`,
				dto
			);
			return response.data;
		},

		update: async (
			id: number,
			dto: UpdateReportValueDto
		): Promise<ReportValue> => {
			const response = await axios.patch<ReportValue>(
				`${DEFAULT_API_URL}/report-values/${id}`,
				dto
			);
			return response.data;
		},

		remove: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/report-values/${id}`);
		},

		exportReport: async (
			contactGroupId: number,
			format: ReportExportFormat = 'csv'
		) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/report-values/export/${contactGroupId}`,
				{
					params: { format },
					responseType: 'blob',
					validateStatus: (status) => status < 500,
				}
			);
			return response;
		},
	};
};

export default reportValuesApi;
