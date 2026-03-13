import type {
	DashboardDefinition,
	DashboardWidget,
	DashboardWidgetType,
	MetricDefinition,
} from '~/models/AnalyticsDashboard';
import {
	DEFAULT_WIDGET_LAYOUT,
	normalizeWidgetLayout,
} from '~/modules/campaigns/dashboardLayout';
import type {
	DashboardFormValues,
	WidgetFormValues,
} from './DashboardSection.types';

const GROUPED_WIDGET_TYPES: DashboardWidgetType[] = [
	'BAR_CHART',
	'PIE_CHART',
	'DONUT_CHART',
	'TABLE',
];

const TIMESERIES_WIDGET_TYPES: DashboardWidgetType[] = ['LINE_CHART'];

const CONVERSATION_GROUP_BY_FIELDS = [
	'id',
	'status',
	'agent_id',
	'campaign_id',
	'contact_id',
	'created_at',
	'start_date',
	'end_date',
];

const DISPOSITION_GROUP_BY_FIELDS = [
	'disposition_name',
	'call_status',
	'requires_reschedule',
	'is_voice_mail',
	'do_not_call',
	'status_contact',
	'created_at',
];

const ATTRIBUTE_TYPED_GROUP_BY_FIELDS = [
	'value_string',
	'value_number',
	'value_boolean',
	'value_json',
];

export const getWidgetTypeLabel = (
	t: (key: string) => string,
	widgetType: DashboardWidgetType
) => t(`dashboardBuilder.widgetTypes.${widgetType}`);

export const supportsGroupedWidget = (widgetType: DashboardWidgetType) =>
	GROUPED_WIDGET_TYPES.includes(widgetType);

export const supportsTimeSeriesWidget = (widgetType: DashboardWidgetType) =>
	TIMESERIES_WIDGET_TYPES.includes(widgetType);

export const buildGroupBySuggestions = (
	metricDefinition: MetricDefinition | null,
	attributeMetricKeys: string[]
) => {
	if (!metricDefinition) {
		return [];
	}

	if (metricDefinition.sourceType === 'CONVERSATION') {
		return CONVERSATION_GROUP_BY_FIELDS;
	}

	if (metricDefinition.sourceType === 'DISPOSITION') {
		return DISPOSITION_GROUP_BY_FIELDS;
	}

	return [...ATTRIBUTE_TYPED_GROUP_BY_FIELDS, ...attributeMetricKeys];
};

export const dashboardFormValues = (
	dashboard?: DashboardDefinition | null
): DashboardFormValues => ({
	name: dashboard?.name ?? '',
	description: dashboard?.description ?? '',
	isDefault: dashboard?.isDefault ?? false,
});

export const widgetFormValues = (
	widget?: DashboardWidget | null
): WidgetFormValues => {
	const normalizedLayout = normalizeWidgetLayout({
		positionX: widget?.positionX ?? DEFAULT_WIDGET_LAYOUT.positionX,
		positionY: widget?.positionY ?? DEFAULT_WIDGET_LAYOUT.positionY,
		width: widget?.width ?? DEFAULT_WIDGET_LAYOUT.width,
		height: widget?.height ?? DEFAULT_WIDGET_LAYOUT.height,
	});

	return {
		metricDefinitionId: widget?.metricDefinitionId
			? String(widget.metricDefinitionId)
			: '',
		widgetType: widget?.widgetType ?? 'KPI',
		title: widget?.title ?? '',
		description: widget?.description ?? '',
		groupBy:
			typeof widget?.config?.groupBy === 'string' ? widget.config.groupBy : '',
		limit: typeof widget?.config?.limit === 'number' ? widget.config.limit : '',
		positionX: normalizedLayout.positionX,
		positionY: normalizedLayout.positionY,
		width: normalizedLayout.width,
		height: normalizedLayout.height,
		enabled: widget?.enabled ?? true,
	};
};
