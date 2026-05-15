import type { LayoutItem } from 'react-grid-layout/legacy';
import type {
	DashboardDefinition,
	AnalyticsTimeRange,
	DashboardPeriod,
	DashboardRenderWidget,
	DashboardWidget,
	DashboardWidgetVisibilityScope,
	GroupedMetricResult,
	MetricCompareWith,
	MetricResultType,
	TimeSeriesMetricResult,
} from '~/models/AnalyticsDashboard';
import type { TFunction } from 'i18next';
import {
	DASHBOARD_LAYOUT_COLUMNS,
	DASHBOARD_LAYOUT_ROW_HEIGHT,
	normalizeWidgetLayoutForType,
	getMinimumDimensionsForWidgetType,
} from '~/modules/campaigns/dashboardLayout';
import type { DashboardWidgetType, ViewerWidgetLayout } from './types';

export const ACCENT_COLORS = [
	'#6366f1',
	'#0ea5e9',
	'#10b981',
	'#f59e0b',
	'#ec4899',
	'#8b5cf6',
];

const ACCENT_COLOR_TOKENS: Record<string, string> = {
	'#6366f1': 'indigo',
	'#0ea5e9': 'blue',
	'#10b981': 'green',
	'#f59e0b': 'orange',
	'#ec4899': 'pink',
	'#8b5cf6': 'grape',
};

export const getAccentToken = (color: string): string =>
	ACCENT_COLOR_TOKENS[color] ?? 'indigo';

export const GRID_MARGIN: [number, number] = [16, 16];
export const GRID_ROW_GAP = GRID_MARGIN[1];

export const EMPTY_DASHBOARDS: DashboardDefinition[] = [];
export const EMPTY_WIDGETS: DashboardWidget[] = [];

export type DashboardWidgetVisibilityContext = {
	activeClientId: number | null;
	currentUserId: number | null;
	canViewPrivateWidgets: boolean;
};

const normalizeWidgetVisibilityScope = (
	value?: DashboardWidgetVisibilityScope | null
): DashboardWidgetVisibilityScope => value ?? 'TEAM';

export const canViewDashboardWidget = (
	widget: DashboardWidget,
	context?: DashboardWidgetVisibilityContext
) => {
	if (!widget.enabled) {
		return false;
	}

	const scope = normalizeWidgetVisibilityScope(widget.visibilityScope);

	if (!context) {
		return true;
	}

	if (scope === 'GLOBAL') {
		return true;
	}

	if (scope === 'TEAM') {
		return (
			context.activeClientId == null ||
			widget.clientId === context.activeClientId
		);
	}

	return (
		context.canViewPrivateWidgets ||
		(context.currentUserId != null && widget.userId === context.currentUserId)
	);
};

export const getVisibleDashboardWidgets = (
	widgets: DashboardWidget[],
	context?: DashboardWidgetVisibilityContext
) => widgets.filter((widget) => canViewDashboardWidget(widget, context));

export const formatMetricValue = (
	value: string | number | boolean | null | undefined
) => {
	if (typeof value === 'number') return value.toLocaleString();
	if (typeof value === 'boolean') return value ? 'True' : 'False';
	if (value === null || value === undefined || value === '') return '-';
	return String(value);
};

export const resolveMetricDisplayValue = (
	value: string | number | boolean | null | undefined,
	valueFormat?: string | number | boolean | null
) =>
	valueFormat !== undefined && valueFormat !== null && valueFormat !== ''
		? valueFormat
		: value;

export const isPercentMetricResultType = (
	resultType?: MetricResultType | null
) => resultType === 'PERCENT';

type ComparisonCopyKeys = {
	label: string;
	detail?: string;
	seriesLabel: string;
};

const getComparisonRange = (
	timeRange?: AnalyticsTimeRange | null
): AnalyticsTimeRange => timeRange ?? 'WEEK';

const buildComparisonCopyKeys = (
	compareWith: MetricCompareWith | null | undefined,
	timeRange?: AnalyticsTimeRange | null
): ComparisonCopyKeys => {
	const range = getComparisonRange(timeRange);
	const isAverage = compareWith === 'AVERAGE';

	if (isAverage) {
		return {
			label: 'dashboard.comparison.vsAverage',
			detail: 'dashboard.comparison.averageValue',
			seriesLabel: 'dashboard.lineChart.averageBaseline',
		};
	}

	switch (range) {
		case 'TODAY':
			return {
				label: 'dashboard.comparison.vsPreviousDay',
				detail: 'dashboard.comparison.yesterdayValue',
				seriesLabel: 'dashboard.lineChart.previous',
			};
		case 'MONTH':
			return {
				label: 'dashboard.comparison.vsPreviousMonth',
				detail: 'dashboard.comparison.previousMonthValue',
				seriesLabel: 'dashboard.lineChart.previous',
			};
		case 'YEAR':
			return {
				label: 'dashboard.comparison.vsPreviousYear',
				detail: 'dashboard.comparison.previousYearValue',
				seriesLabel: 'dashboard.lineChart.previous',
			};
		case 'WEEK':
		default:
			return {
				label: 'dashboard.comparison.vsPreviousWeek',
				detail: 'dashboard.comparison.previousWeekValue',
				seriesLabel: 'dashboard.lineChart.previous',
			};
	}
};

export const buildWidgetComparisonCopy = (
	compareWith: MetricCompareWith | null | undefined,
	timeRange: AnalyticsTimeRange | null | undefined,
	comparisonValue: string | number | boolean | null | undefined,
	t: TFunction
) => {
	const keys = buildComparisonCopyKeys(compareWith, timeRange);

	return {
		label: t(keys.label),
		detail:
			comparisonValue === undefined
				? undefined
				: t(keys.detail ?? keys.label, {
						value: formatMetricValue(comparisonValue),
					}),
		seriesLabel: t(keys.seriesLabel),
	};
};

export const formatPeriodDate = (iso: string): string =>
	new Date(iso).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});

export const isSameCalendarDay = (
	startIso: string,
	endIso: string
): boolean => {
	const start = new Date(startIso);
	const end = new Date(endIso);

	return (
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate()
	);
};

export const isDashboardPeriod = (
	period?: DashboardPeriod | null
): period is DashboardPeriod => Boolean(period?.start && period?.end);

export const formatDashboardPeriod = (
	period?: DashboardPeriod | null
): string | null => {
	if (!isDashboardPeriod(period)) {
		return null;
	}

	const startLabel = formatPeriodDate(period.start);

	if (isSameCalendarDay(period.start, period.end)) {
		return startLabel;
	}

	return `${startLabel} – ${formatPeriodDate(period.end)}`;
};

export const getNumericValue = (value: string | number | boolean | null) => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === 'boolean') {
		return value ? 1 : 0;
	}

	if (typeof value === 'string') {
		const parsedValue = Number(value);
		return Number.isFinite(parsedValue) ? parsedValue : 0;
	}

	return 0;
};

export const isGroupedMetricResult = (
	widget: DashboardRenderWidget
): widget is DashboardRenderWidget & { result: GroupedMetricResult } =>
	widget.result?.kind === 'grouped';

export const isTimeSeriesMetricResult = (
	widget: DashboardRenderWidget
): widget is DashboardRenderWidget & { result: TimeSeriesMetricResult } =>
	widget.result?.kind === 'time_series';

export const getWidgetRenderLayout = (
	widget: DashboardWidget
): ViewerWidgetLayout => ({
	widgetId: widget.id,
	...normalizeWidgetLayoutForType(
		{
			positionX: widget.positionX,
			positionY: widget.positionY,
			width: widget.width,
			height: widget.height,
		},
		widget.widgetType
	),
});

export const getWidgetHeightInPixels = (
	layout: Pick<ViewerWidgetLayout, 'height'>
) => {
	const totalHeight =
		layout.height * DASHBOARD_LAYOUT_ROW_HEIGHT +
		Math.max(layout.height - 1, 0) * GRID_ROW_GAP;

	return Math.max(totalHeight, 84);
};

export const getEditorCanvasMinHeight = (
	layouts: Pick<ViewerWidgetLayout, 'positionY' | 'height'>[],
	options?: { extraRows?: number; minimumRows?: number }
) => {
	const layoutBottomRow = layouts.reduce(
		(maxBottomRow, layout) =>
			Math.max(maxBottomRow, layout.positionY + layout.height),
		0
	);
	const minimumRows = options?.minimumRows ?? 3;
	const baseRows = Math.max(layoutBottomRow, minimumRows);
	const extraRows = options?.extraRows ?? 2;
	const totalRows = baseRows + extraRows;

	return (
		totalRows * DASHBOARD_LAYOUT_ROW_HEIGHT +
		Math.max(totalRows - 1, 0) * GRID_ROW_GAP
	);
};

export const getWidgetStyle = (layout?: ViewerWidgetLayout) => {
	if (!layout) {
		return undefined;
	}

	return {
		gridColumn: `${layout.positionX + 1} / span ${layout.width}`,
		gridRow: `${layout.positionY + 1} / span ${layout.height}`,
		height: `${getWidgetHeightInPixels(layout)}px`,
	} as React.CSSProperties;
};

export const getWidgetClassName = (
	widgetType: DashboardWidgetType,
	styles: Record<string, string>,
	isEditing = false
) => {
	const classes = [styles.widgetItem];

	if (widgetType === 'KPI') classes.push(styles['widgetItem--kpi']);
	if (widgetType === 'TABLE') classes.push(styles['widgetItem--table']);
	if (widgetType !== 'KPI' && widgetType !== 'TABLE') {
		classes.push(styles['widgetItem--chart']);
	}
	if (isEditing) classes.push(styles.widgetItemEditing);

	return classes.join(' ');
};

export const createLayoutMap = (layouts: ViewerWidgetLayout[]) =>
	new Map(layouts.map((layout) => [layout.widgetId, layout]));

export const createWidgetTypeMap = (widgets: DashboardWidget[]) =>
	new Map(widgets.map((widget) => [widget.id, widget.widgetType]));

export const areLayoutsEqual = (
	left: ViewerWidgetLayout | undefined,
	right: ViewerWidgetLayout | undefined
) =>
	Boolean(
		left &&
		right &&
		left.positionX === right.positionX &&
		left.positionY === right.positionY &&
		left.width === right.width &&
		left.height === right.height
	);

export const areLayoutCollectionsEqual = (
	left: ViewerWidgetLayout[],
	right: ViewerWidgetLayout[]
) =>
	left.length === right.length &&
	left.every((item, index) => areLayoutsEqual(item, right[index]));

export const toGridLayout = (
	layout: ViewerWidgetLayout,
	widgetType: DashboardWidgetType
): LayoutItem => {
	const minimumDimensions = getMinimumDimensionsForWidgetType(widgetType);

	return {
		i: String(layout.widgetId),
		x: layout.positionX,
		y: layout.positionY,
		w: layout.width,
		h: layout.height,
		minW: minimumDimensions.width,
		minH: minimumDimensions.height,
		maxW: DASHBOARD_LAYOUT_COLUMNS,
	};
};

export const fromGridLayout = (
	layout: LayoutItem,
	widgetType: DashboardWidgetType
): ViewerWidgetLayout => ({
	widgetId: Number(layout.i),
	...normalizeWidgetLayoutForType(
		{
			positionX: layout.x,
			positionY: layout.y,
			width: layout.w,
			height: layout.h,
		},
		widgetType
	),
});

export const getWidgetChartMetrics = (layout?: ViewerWidgetLayout) => {
	const contentHeight = getWidgetHeightInPixels(layout ?? { height: 3 });

	return {
		chartHeight: Math.max(contentHeight - 72, 72),
		pieSize: Math.max(Math.min(contentHeight - 84, 180), 72),
	};
};

export const resolveLabel = (
	label: string | null | undefined,
	fallback: string
): string => {
	if (!label || label === 'null' || label === 'undefined') return fallback;
	return label;
};
