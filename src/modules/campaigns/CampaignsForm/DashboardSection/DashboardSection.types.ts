import type {
	DashboardDefinition,
	DashboardMainSlot,
	DashboardWidgetComparisonData,
	DashboardWidgetPreviewResponse,
	DashboardWidget,
	DashboardWidgetType,
	DashboardWidgetJoinConfig,
	DashboardWidgetMetricConfig,
	DashboardWidgetVisibilityScope,
	MetricCompareWith,
	MetricComparison,
	MetricAggregationType,
	MetricResultType,
	MetricSourceType,
	MetricValueField,
	RuntimeFilterOperator,
	TimeSeriesPoint,
	WidgetPresetAlias,
	WidgetPresetKind,
} from '~/models/AnalyticsDashboard';
import type { DashboardWidgetSizePreset } from '~/modules/campaigns/dashboardLayout';

export type DashboardFormValues = {
	name: string;
	description: string;
	mainSlot: DashboardMainSlot | null;
	isDefault: boolean;
};

export type WidgetFormValues = {
	widgetType: DashboardWidgetType;
	title: string;
	description: string;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName: string | null;
	metricKey: string | null;
	valueField: MetricValueField | null;
	compareWith: MetricCompareWith;
	resultType: MetricResultType | null;
	supportsGroupBy: boolean;
	supportsTimeSeries: boolean;
	aggregateByContact: boolean;
	groupBy: string | null;
	limit: number | '';
	viewColor: string;
	viewValueFormat: string | null;
	viewLegend: boolean;
	visibilityScope: DashboardWidgetVisibilityScope;
	roleIds: number[];
	width: number;
	height: number;
	enabled: boolean;
	defaultFilters: WidgetFilterFormRow[];
	runtimeFilters: WidgetRuntimeFilterFormRow[];
	presetEnabled: boolean;
	presetAlias: WidgetPresetAlias | null;
	presetKind: WidgetPresetKind | null;
	presetSource: 'CONVERSATION' | 'DISPOSITION' | null;
	presetField: string | null;
	presetValues: string[];
	presetDisplayLabel: string;
	includeChildren: boolean;
};

export type WidgetFilterValueType = 'string' | 'number' | 'boolean' | 'null';

export type WidgetFilterFormRow = {
	id: string;
	key: string | null;
	value: string | null;
	valueType: WidgetFilterValueType | null;
};

export type WidgetRuntimeFilterValue = string | string[] | null;

export type WidgetRuntimeFilterFormRow = {
	id: string;
	field: string | null;
	operator: RuntimeFilterOperator | null;
	value: WidgetRuntimeFilterValue;
};

export type WidgetTypeOption = {
	value: DashboardWidgetType;
	label: string;
	description: string;
	disabled?: boolean;
};

export type WidgetMetricOption = {
	value: string;
	label: string;
};

export type MetricColumnConfigEntry = {
	label: string;
	value: string;
	type: string;
	join?: DashboardWidgetJoinConfig | null;
	options?: string[] | null;
};

export type MetricColumnsConfig = {
	disposition: MetricColumnConfigEntry[];
	conversation: MetricColumnConfigEntry[];
};

export type WidgetMetricDraft = Pick<
	DashboardWidgetMetricConfig,
	| 'sourceType'
	| 'aggregationType'
	| 'fieldName'
	| 'metricKey'
	| 'compareWith'
	| 'supportsGroupBy'
	| 'supportsTimeSeries'
>;

export type WidgetPreviewRow = {
	label: string;
	value: string | number | boolean | null;
};

export type WidgetPreviewModel =
	| {
			kind: 'empty';
			title: string;
			description?: string;
			sizePreset: DashboardWidgetSizePreset;
			accentColor: string;
	  }
	| {
			kind: 'kpi';
			title: string;
			subtitle?: string;
			description?: string;
			sizePreset: DashboardWidgetSizePreset;
			accentColor: string;
			value: string | number | boolean | null;
			comparison?: MetricComparison;
			comparisonLabel?: string;
			comparisonDetail?: string;
	  }
	| {
			kind: 'grouped';
			title: string;
			subtitle?: string;
			description?: string;
			sizePreset: DashboardWidgetSizePreset;
			accentColor: string;
			widgetType: Exclude<DashboardWidgetType, 'KPI' | 'LINE_CHART'>;
			groupByLabel: string;
			rows: WidgetPreviewRow[];
			showLegend: boolean;
	  }
	| {
			kind: 'line_chart';
			title: string;
			subtitle?: string;
			description?: string;
			sizePreset: DashboardWidgetSizePreset;
			accentColor: string;
			points: TimeSeriesPoint[];
			comparisonLabel?: string;
	  };

export type WidgetCompatibilityState = {
	isGroupedWidget: boolean;
	requiresValueField: boolean;
	inferredResultType: MetricResultType;
	inferredSupportsGroupBy: boolean;
	inferredSupportsTimeSeries: boolean;
	compatibilityNoticeKey?: string;
};

export type WidgetGuidedState = {
	titleSuggestion: string;
	metricLabel: string;
	sourceLabel: string;
	aggregationLabel: string;
	visibilityScopeLabel: string;
	rolesSummaryLabel: string;
	compatibility: WidgetCompatibilityState;
	preview: WidgetPreviewModel;
	filterKeySuggestions: string[];
};

export type WidgetPreviewRemoteState = {
	data?: DashboardWidgetPreviewResponse;
	comparison?: DashboardWidgetComparisonData;
	isLoading: boolean;
	isFetching: boolean;
	isReady: boolean;
	errorMessage?: string;
	isShowingStaleData: boolean;
};

export type DashboardModalState = {
	opened: boolean;
	editingDashboard: DashboardDefinition | null;
};

export type WidgetModalState = {
	opened: boolean;
	editingWidget: DashboardWidget | null;
};
