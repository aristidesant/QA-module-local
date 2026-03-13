import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	CreateDashboardDto,
	CreateDashboardWidgetDto,
	CreateMetricDefinitionDto,
	DashboardDefinition,
	DashboardRenderComparisonRequest,
	DashboardRenderComparisonResponse,
	DashboardRenderRequest,
	DashboardRenderResponse,
	DashboardWidget,
	MetricDefinition,
	UpdateDashboardDto,
	UpdateDashboardWidgetDto,
	UpdateMetricDefinitionDto,
} from '~/models/AnalyticsDashboard';

type ListParams = Record<string, string | number | boolean | null | undefined>;

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
		getMetricDefinitions: async (params?: ListParams) => {
			const response = await axios.get<
				MetricDefinition[] | { data: MetricDefinition[] }
			>(`${DEFAULT_API_URL}/analytics-dashboards/metric-definitions`, {
				params,
			});
			return extractArray<MetricDefinition>(response.data);
		},

		getMetricDefinitionById: async (id: number | string) => {
			const response = await axios.get<MetricDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/metric-definitions/${id}`
			);
			return response.data;
		},

		createMetricDefinition: async (data: CreateMetricDefinitionDto) => {
			const response = await axios.post<MetricDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/metric-definitions`,
				data
			);
			return response.data;
		},

		updateMetricDefinition: async (
			id: number | string,
			data: UpdateMetricDefinitionDto
		) => {
			const response = await axios.patch<MetricDefinition>(
				`${DEFAULT_API_URL}/analytics-dashboards/metric-definitions/${id}`,
				data
			);
			return response.data;
		},

		deleteMetricDefinition: async (id: number | string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/analytics-dashboards/metric-definitions/${id}`
			);
			return response.data;
		},

		getDashboards: async (params?: ListParams) => {
			const response = await axios.get<
				DashboardDefinition[] | { data: DashboardDefinition[] }
			>(`${DEFAULT_API_URL}/analytics-dashboards/dashboards`, { params });
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
