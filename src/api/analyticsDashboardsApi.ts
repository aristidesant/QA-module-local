import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	CreateDashboardDto,
	CreateDashboardWidgetDto,
	DashboardListParams,
	DashboardDefinition,
	DashboardWidgetPreviewResponse,
	DashboardRenderComparisonRequest,
	DashboardRenderComparisonResponse,
	DashboardRenderRequest,
	DashboardRenderResponse,
	DashboardWidget,
	PreviewDashboardWidgetDto,
	UpdateDashboardDto,
	UpdateDashboardWidgetDto,
} from '~/models/AnalyticsDashboard';

const normalizeDashboardListParams = (params?: DashboardListParams) => {
	if (!params || params.campaignId == null) {
		return {
			...params,
			global: true,
		};
	}

	return params;
};

const extractArray = <T>(payload: unknown): T[] => {
	if (Array.isArray(payload)) {
		return payload as T[];
	}

	if (payload && typeof payload === 'object') {
		const record = payload as Record<string, unknown>;

		if (Array.isArray(record.data)) {
			return record.data as T[];
		}

		if (Array.isArray(record.items)) {
			return record.items as T[];
		}
	}

	return [];
};

const analyticsDashboardsApi = () => {
	return {
		getDashboards: async (params?: DashboardListParams) => {
			const response = await axios.get<
				DashboardDefinition[] | { data: DashboardDefinition[] }
			>(`${DEFAULT_API_URL}/analytics-dashboards/dashboards`, {
				params: normalizeDashboardListParams(params),
			});
			return extractArray<DashboardDefinition>(response.data);
		},

		getDashboardById: async (id: number | string) => {
			const response = await axios.get<DashboardDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${id}`
			);
			return response.data;
		},

		createDashboard: async (data: CreateDashboardDto) => {
			const response = await axios.post<DashboardDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards`,
				data
			);
			return response.data;
		},

		updateDashboard: async (id: number | string, data: UpdateDashboardDto) => {
			const response = await axios.patch<DashboardDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${id}`,
				data
			);
			return response.data;
		},

		deleteDashboard: async (id: number | string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${id}`
			);
			return response.data;
		},

		getDashboardWidgets: async (dashboardId: number | string) => {
			const response = await axios.get<
				DashboardWidget[] | { data: DashboardWidget[] }
			>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${dashboardId}/widgets`
			);
			return extractArray<DashboardWidget>(response.data);
		},

		createDashboardWidget: async (data: CreateDashboardWidgetDto) => {
			const response = await axios.post<DashboardWidget>(
				`${DEFAULT_API_URL}/analytics-dashboards/widgets`,
				data
			);
			return response.data;
		},

		updateDashboardWidget: async (
			id: number | string,
			data: UpdateDashboardWidgetDto
		) => {
			const response = await axios.patch<DashboardWidget>(
				`${DEFAULT_API_URL}/analytics-dashboards/widgets/${id}`,
				data
			);
			return response.data;
		},

		deleteDashboardWidget: async (id: number | string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/analytics-dashboards/widgets/${id}`
			);
			return response.data;
		},

		previewDashboardWidget: async (
			data: PreviewDashboardWidgetDto,
			signal?: AbortSignal
		) => {
			const response = await axios.post<DashboardWidgetPreviewResponse>(
				`${DEFAULT_API_URL}/analytics-dashboards/widgets/preview`,
				data,
				{ signal }
			);
			return response.data;
		},

		renderDashboard: async (
			dashboardId: number | string,
			data: DashboardRenderRequest = {}
		) => {
			const response = await axios.post<DashboardRenderResponse>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${dashboardId}/render`,
				data
			);
			return response.data;
		},

		renderDashboardComparison: async (
			dashboardId: number | string,
			data: DashboardRenderComparisonRequest = {}
		) => {
			const response = await axios.post<DashboardRenderComparisonResponse>(
				`${DEFAULT_API_URL}/analytics-dashboards/dashboards/${dashboardId}/render-comparison`,
				data
			);
			return response.data;
		},
	};
};

export default analyticsDashboardsApi;
