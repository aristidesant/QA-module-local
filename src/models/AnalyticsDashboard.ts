export type AnalyticsTimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';

export type AnalyticsComparisonMode = 'PREVIOUS_PERIOD';

export type MetricTrend = 'UP' | 'DOWN' | 'FLAT' | 'UNAVAILABLE';

export type MetricSourceType = 'CONVERSATION' | 'ATTRIBUTE' | 'DISPOSITION';

export type MetricAggregationType =
	| 'COUNT'
	| 'SUM'
	| 'AVG'
	| 'MIN'
	| 'MAX'
	| 'DISTINCT_COUNT';

export type DashboardWidgetType =
	| 'KPI'
	| 'LINE_CHART'
	| 'BAR_CHART'
	| 'PIE_CHART'
	| 'DONUT_CHART'
	| 'TABLE'
	| 'FUNNEL';

export type MetricValueField =
	| 'VALUE_STRING'
	| 'VALUE_NUMBER'
	| 'VALUE_BOOLEAN'
	| 'VALUE_JSON';

export type MetricResultType = 'NUMBER' | 'BOOLEAN' | 'STRING' | 'TIME';

export type RuntimeFilterOperator =
	| 'eq'
	| 'neq'
	| 'in'
	| 'not_in'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'
	| 'is_null'
	| 'is_not_null';

export interface RuntimeFilter {
	field: string;
	operator: RuntimeFilterOperator;
	value?: string | number | boolean | string[] | number[] | boolean[] | null;
}

export interface DashboardWidgetQueryConfig {
	groupBy?: string;
	limit?: number;
}

export type DashboardWidgetFilterValue = string | number | boolean | null;

export type DashboardWidgetDefaultFilter = Record<
	string,
	DashboardWidgetFilterValue
>;

export interface DashboardWidgetMetricConfig {
	key?: string | null;
	name?: string;
	description?: string | null;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName?: string | null;
	metricKey?: string | null;
	valueField?: MetricValueField | null;
	defaultFilter?: DashboardWidgetDefaultFilter | null;
	supportsGroupBy?: boolean;
	supportsTimeSeries?: boolean;
	resultType: MetricResultType;
}

export interface DashboardWidgetDataConfig {
	metric: DashboardWidgetMetricConfig;
	query?: DashboardWidgetQueryConfig | null;
}

export interface DashboardWidgetViewConfig {
	color?: string;
	legend?: boolean;
	valueFormat?: string;
	[key: string]: unknown;
}

export interface DashboardDefinition {
	id: number;
	clientId: number;
	campaignId: number | null;
	contactGroupId?: number | null;
	userId: number;
	name: string;
	description: string | null;
	isDefault: boolean;
	layoutConfig: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface DashboardListParams {
	campaignId?: number | string | null;
	contactGroupId?: number | string | null;
	global?: boolean;
	[key: string]: string | number | boolean | null | undefined;
}

export interface CreateDashboardDto {
	campaignId?: number | null;
	contactGroupId?: number | null;
	name: string;
	description?: string;
	isDefault?: boolean;
	layoutConfig?: Record<string, unknown> | null;
}

export interface UpdateDashboardDto extends Partial<CreateDashboardDto> {}

export interface DashboardWidget {
	id: number;
	clientId: number;
	dashboardId: number;
	userId: number;
	widgetType: DashboardWidgetType;
	title: string;
	description: string | null;
	positionX: number;
	positionY: number;
	width: number;
	height: number;
	dataConfig: DashboardWidgetDataConfig;
	viewConfig: DashboardWidgetViewConfig | null;
	enabled: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface CreateDashboardWidgetDto {
	dashboardId: number;
	widgetType: DashboardWidgetType;
	title: string;
	description?: string;
	positionX?: number;
	positionY?: number;
	width?: number;
	height?: number;
	dataConfig: DashboardWidgetDataConfig;
	viewConfig?: DashboardWidgetViewConfig | null;
	enabled?: boolean;
}

export interface UpdateDashboardWidgetDto extends Partial<CreateDashboardWidgetDto> {}

export interface PreviewDashboardWidgetDto {
	campaignId?: number | null;
	widgetType: DashboardWidgetType;
	width?: number;
	height?: number;
	dataConfig: DashboardWidgetDataConfig;
	viewConfig?: Pick<DashboardWidgetViewConfig, 'legend' | 'valueFormat'> | null;
	timeRange?: AnalyticsTimeRange;
	comparisonMode?: AnalyticsComparisonMode;
}

export interface SingleValueMetricResult {
	kind: 'single_value';
	metricKey: string;
	value: string | number | boolean | null;
	valueFormat?: string | number | boolean | null;
	meta: {
		campaignId: number | null;
		sourceType: MetricSourceType;
		aggregationType: MetricAggregationType;
	};
}

export interface GroupedMetricRow {
	label: string;
	value: string | number | boolean | null;
}

export interface GroupedMetricResult {
	kind: 'grouped';
	metricKey: string;
	rows: GroupedMetricRow[];
	meta: {
		campaignId: number | null;
		sourceType: MetricSourceType;
		aggregationType: MetricAggregationType;
		groupBy: string;
	};
}

export interface TimeSeriesPoint {
	bucketStart: string;
	bucketEnd: string;
	label: string;
	value: number;
	valueFormat: number;
}

export interface TimeSeriesMetricResult {
	kind: 'time_series';
	metricKey: string;
	points: TimeSeriesPoint[];
	meta: {
		campaignId: number | null;
		sourceType: MetricSourceType;
		aggregationType: MetricAggregationType;
		granularity: 'hour' | 'day' | 'week' | 'month';
	};
}

export type DashboardMetricResult =
	| SingleValueMetricResult
	| GroupedMetricResult
	| TimeSeriesMetricResult;

export type DashboardRenderWidgetStatus = 'SUCCESS' | 'UNSUPPORTED' | 'ERROR';

export interface DashboardRenderWidget {
	widgetId: number;
	widgetType: DashboardWidgetType;
	title: string;
	status: DashboardRenderWidgetStatus;
	result: DashboardMetricResult | null;
	message?: string;
}

export interface DashboardRenderRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	filters?: RuntimeFilter[];
	contactGroupId?: number | null;
}

export interface DashboardPeriod {
	start: string;
	end: string;
}

export interface DashboardRenderResponse {
	dashboardId: number;
	campaignId: number | null;
	name: string;
	timeRange?: AnalyticsTimeRange;
	period?: DashboardPeriod;
	widgets: DashboardRenderWidget[];
}

export interface MetricComparison {
	absoluteChange: number | null;
	percentageChange: number | null;
	trend: MetricTrend;
}

export interface DashboardRenderComparisonRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	comparisonMode?: AnalyticsComparisonMode;
	contactGroupId?: number | null;
}

export interface DashboardComparisonWidget {
	widgetId: number;
	widgetType: DashboardWidgetType;
	title: string;
	status: DashboardRenderWidgetStatus;
	current?: DashboardMetricResult;
	previous?: DashboardMetricResult;
	comparison?: MetricComparison;
	message?: string;
}

export interface DashboardRenderComparisonResponse {
	dashboardId: number;
	campaignId: number | null;
	name: string;
	timeRange?: AnalyticsTimeRange;
	comparisonMode?: AnalyticsComparisonMode;
	period?: {
		current: DashboardPeriod;
		previous: DashboardPeriod;
	};
	widgets: DashboardComparisonWidget[];
}

export interface DashboardWidgetComparisonData {
	comparison?: MetricComparison;
	previous?: DashboardMetricResult;
	current?: DashboardMetricResult;
}

export interface DashboardWidgetPreviewResponse {
	widget: DashboardRenderWidget;
	comparison?: DashboardWidgetComparisonData;
	period?: {
		current: DashboardPeriod;
		previous: DashboardPeriod;
	};
}

export interface DashboardRenderUnifiedResponse {
	renderResult: DashboardRenderResponse;
	comparisonMap?: Map<number, DashboardWidgetComparisonData>;
	comparisonPeriod?: {
		current: DashboardPeriod;
		previous: DashboardPeriod;
	};
}
