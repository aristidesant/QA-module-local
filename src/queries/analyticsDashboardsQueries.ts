import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import analyticsDashboardsApi from '~/api/analyticsDashboardsApi';
import type {
	CreateDashboardDto,
	CreateDashboardWidgetDto,
	CreateMetricDefinitionDto,
	DashboardListParams,
	DashboardDefinition,
	DashboardRenderComparisonResponse,
	DashboardRenderRequest,
	DashboardRenderResponse,
	DashboardRenderUnifiedResponse,
	DashboardWidget,
	MetricDefinition,
	UpdateDashboardDto,
	UpdateDashboardWidgetDto,
	UpdateMetricDefinitionDto,
} from '~/models/AnalyticsDashboard';

type ListParams = Record<string, string | number | boolean | null | undefined>;

const toUnifiedRenderResponse = (
	response: DashboardRenderResponse
): DashboardRenderUnifiedResponse => ({
	renderResult: response,
});

const toUnifiedComparisonResponse = (
	response: DashboardRenderComparisonResponse
): DashboardRenderUnifiedResponse => {
	const comparisonMap = new Map(
		response.widgets
			.filter(
				(widget) => widget.comparison || widget.previous || widget.current
			)
			.map((widget) => [
				widget.widgetId,
				{
					comparison: widget.comparison,
					previous: widget.previous,
					current: widget.current,
				},
			])
	);

	return {
		renderResult: {
			dashboardId: response.dashboardId,
			campaignId: response.campaignId,
			name: response.name,
			timeRange: response.timeRange,
			period: response.period?.current,
			widgets: response.widgets.map((widget) => ({
				widgetId: widget.widgetId,
				widgetType: widget.widgetType,
				title: widget.title,
				status: widget.status,
				result: widget.current ?? null,
				message: widget.message,
			})),
		},
		comparisonMap: comparisonMap.size ? comparisonMap : undefined,
		comparisonPeriod: response.period,
	};
};

export const useMetricDefinitions = (params?: ListParams) => {
	return useQuery({
		queryKey: ['metric-definitions', params],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			return api.getMetricDefinitions(params);
		},
	});
};

export const useMetricDefinition = (id?: number | string) => {
	return useQuery<MetricDefinition>({
		queryKey: ['metric-definition', id],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			if (!id) throw new Error('Metric definition id is required');
			return api.getMetricDefinitionById(id);
		},
		enabled: Boolean(id),
	});
};

export const useCreateMetricDefinition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMetricDefinitionDto) => {
			const api = analyticsDashboardsApi();
			return api.createMetricDefinition(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['metric-definitions'] });
		},
	});
};

export const useUpdateMetricDefinition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number | string;
			data: UpdateMetricDefinitionDto;
		}) => {
			const api = analyticsDashboardsApi();
			return api.updateMetricDefinition(id, data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['metric-definitions'] });
			queryClient.invalidateQueries({
				queryKey: ['metric-definition', variables.id],
			});
		},
	});
};

export const useDeleteMetricDefinition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number | string) => {
			const api = analyticsDashboardsApi();
			return api.deleteMetricDefinition(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['metric-definitions'] });
			queryClient.invalidateQueries({ queryKey: ['metric-definition', id] });
		},
	});
};

export const useDashboards = (params?: DashboardListParams) => {
	return useQuery<DashboardDefinition[]>({
		queryKey: ['dashboards', params],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			return api.getDashboards(params);
		},
	});
};

export const useDashboard = (id?: number | string) => {
	return useQuery<DashboardDefinition>({
		queryKey: ['dashboard', id],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			if (!id) throw new Error('Dashboard id is required');
			return api.getDashboardById(id);
		},
		enabled: Boolean(id),
	});
};

export const useCreateDashboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateDashboardDto) => {
			const api = analyticsDashboardsApi();
			return api.createDashboard(data);
		},
		onSuccess: (dashboard) => {
			queryClient.invalidateQueries({ queryKey: ['dashboards'] });
			queryClient.invalidateQueries({
				queryKey: ['dashboard', dashboard.id],
			});
		},
	});
};

export const useUpdateDashboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number | string;
			data: UpdateDashboardDto;
		}) => {
			const api = analyticsDashboardsApi();
			return api.updateDashboard(id, data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['dashboards'] });
			queryClient.invalidateQueries({
				queryKey: ['dashboard', variables.id],
			});
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useDeleteDashboard = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number | string) => {
			const api = analyticsDashboardsApi();
			return api.deleteDashboard(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['dashboards'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useDashboardWidgets = (dashboardId?: number | string) => {
	return useQuery<DashboardWidget[]>({
		queryKey: ['dashboard-widgets', dashboardId],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			if (!dashboardId) throw new Error('Dashboard id is required');
			return api.getDashboardWidgets(dashboardId);
		},
		enabled: Boolean(dashboardId),
	});
};

export const useCreateDashboardWidget = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateDashboardWidgetDto) => {
			const api = analyticsDashboardsApi();
			return api.createDashboardWidget(data);
		},
		onSuccess: (widget) => {
			queryClient.invalidateQueries({
				queryKey: ['dashboard-widgets', widget.dashboardId],
			});
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useUpdateDashboardWidget = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number | string;
			data: UpdateDashboardWidgetDto;
		}) => {
			const api = analyticsDashboardsApi();
			return api.updateDashboardWidget(id, data);
		},
		onSuccess: (widget) => {
			queryClient.invalidateQueries({
				queryKey: ['dashboard-widgets', widget.dashboardId],
			});
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useUpdateDashboardWidgetLayouts = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			dashboardId,
			items,
		}: {
			dashboardId: number | string;
			items: Array<{
				id: number | string;
				data: Pick<
					UpdateDashboardWidgetDto,
					'positionX' | 'positionY' | 'width' | 'height'
				>;
			}>;
		}) => {
			const api = analyticsDashboardsApi();
			await Promise.all(
				items.map((item) => api.updateDashboardWidget(item.id, item.data))
			);
			return { dashboardId, items };
		},
		onSuccess: ({ dashboardId }) => {
			queryClient.invalidateQueries({
				queryKey: ['dashboard-widgets', dashboardId],
			});
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useDeleteDashboardWidget = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			dashboardId,
		}: {
			id: number | string;
			dashboardId: number | string;
		}) => {
			const api = analyticsDashboardsApi();
			await api.deleteDashboardWidget(id);
			return { id, dashboardId };
		},
		onSuccess: ({ dashboardId }) => {
			queryClient.invalidateQueries({
				queryKey: ['dashboard-widgets', dashboardId],
			});
			queryClient.invalidateQueries({ queryKey: ['dashboard-render-unified'] });
		},
	});
};

export const useDashboardRenderUnified = (
	dashboardId?: number | string,
	payload: DashboardRenderRequest = {},
	comparisonEnabled = false
) => {
	return useQuery<DashboardRenderUnifiedResponse>({
		queryKey: [
			'dashboard-render-unified',
			comparisonEnabled ? 'comparison' : 'default',
			dashboardId,
			payload,
		],
		queryFn: async () => {
			const api = analyticsDashboardsApi();
			if (!dashboardId) throw new Error('Dashboard id is required');
			if (comparisonEnabled) {
				const comparisonResponse = await api.renderDashboardComparison(
					dashboardId,
					{
						...payload,
						comparisonMode: 'PREVIOUS_PERIOD',
					}
				);
				return toUnifiedComparisonResponse(comparisonResponse);
			}
			const renderResponse = await api.renderDashboard(dashboardId, payload);
			return toUnifiedRenderResponse(renderResponse);
		},
		enabled: Boolean(dashboardId),
	});
};
