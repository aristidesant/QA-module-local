import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import analyticsDashboardsApi from '~/api/analyticsDashboardsApi';
import type {
	CreateDashboardDto,
	CreateDashboardWidgetDto,
	DashboardListParams,
	DashboardDefinition,
	DashboardRenderComparisonResponse,
	DashboardRenderRequest,
	DashboardRenderResponse,
	DashboardRenderUnifiedResponse,
	DashboardWidget,
	DashboardWidgetPreviewResponse,
	PreviewDashboardWidgetDto,
	UpdateDashboardDto,
	UpdateDashboardWidgetDto,
} from '~/models/AnalyticsDashboard';

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

const normalizePreviewPayload = (
	payload: PreviewDashboardWidgetDto
): PreviewDashboardWidgetDto => ({
	...(payload.campaignId == null ? {} : { campaignId: payload.campaignId }),
	widgetType: payload.widgetType,
	...(payload.width == null ? {} : { width: payload.width }),
	...(payload.height == null ? {} : { height: payload.height }),
	dataConfig: {
		metric: {
			sourceType: payload.dataConfig.metric.sourceType,
			aggregationType: payload.dataConfig.metric.aggregationType,
			...(payload.dataConfig.metric.fieldName
				? { fieldName: payload.dataConfig.metric.fieldName }
				: {}),
			...(payload.dataConfig.metric.metricKey
				? { metricKey: payload.dataConfig.metric.metricKey }
				: {}),
			...(payload.dataConfig.metric.valueField
				? { valueField: payload.dataConfig.metric.valueField }
				: {}),
			...(payload.dataConfig.metric.defaultFilter
				? { defaultFilter: payload.dataConfig.metric.defaultFilter }
				: {}),
			...(payload.dataConfig.metric.compareWith
				? { compareWith: payload.dataConfig.metric.compareWith }
				: {}),
			...(payload.dataConfig.metric.supportsGroupBy === undefined
				? {}
				: { supportsGroupBy: payload.dataConfig.metric.supportsGroupBy }),
			...(payload.dataConfig.metric.supportsTimeSeries === undefined
				? {}
				: { supportsTimeSeries: payload.dataConfig.metric.supportsTimeSeries }),
			resultType: payload.dataConfig.metric.resultType,
		},
		...(payload.dataConfig.query ? { query: payload.dataConfig.query } : {}),
		...(payload.dataConfig.runtimeFilters?.length
			? { runtimeFilters: payload.dataConfig.runtimeFilters }
			: {}),
		...(payload.dataConfig.joins?.length
			? { joins: payload.dataConfig.joins }
			: {}),
	},
	...(payload.viewConfig ? { viewConfig: payload.viewConfig } : {}),
	...(payload.timeRange ? { timeRange: payload.timeRange } : {}),
	...(payload.comparisonMode ? { comparisonMode: payload.comparisonMode } : {}),
});

export const useDashboardWidgetPreview = (
	payload?: PreviewDashboardWidgetDto | null,
	enabled = true
) => {
	return useQuery<DashboardWidgetPreviewResponse>({
		queryKey: ['dashboard-widget-preview', payload ?? null],
		queryFn: async ({ signal }) => {
			const api = analyticsDashboardsApi();
			if (!payload) throw new Error('Preview payload is required');
			return api.previewDashboardWidget(payload, signal);
		},
		enabled: enabled && Boolean(payload),
		retry: false,
		staleTime: 15000,
		gcTime: 300000,
		refetchOnWindowFocus: false,
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

export { normalizePreviewPayload };
