import type { LayoutItem } from 'react-grid-layout/legacy';
import type {
	DashboardDefinition,
	DashboardRenderWidget,
	DashboardWidget,
	GroupedMetricResult,
} from '~/models/AnalyticsDashboard';
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

export const GRID_MARGIN: [number, number] = [16, 16];
export const GRID_ROW_GAP = GRID_MARGIN[1];

export const EMPTY_DASHBOARDS: DashboardDefinition[] = [];
export const EMPTY_WIDGETS: DashboardWidget[] = [];

export const formatMetricValue = (
	value: string | number | boolean | null | undefined
) => {
	if (typeof value === 'number') return value.toLocaleString();
	if (typeof value === 'boolean') return value ? 'True' : 'False';
	if (value === null || value === undefined || value === '') return '-';
	return String(value);
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
	widget.status === 'SUCCESS' && widget.result?.kind === 'grouped';

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
	const extraRows = options?.extraRows ?? Math.max(baseRows, 6);
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
