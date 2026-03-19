import type {
	DashboardWidgetComparisonData,
	DashboardDefinition,
	DashboardWidget,
} from '~/models/AnalyticsDashboard';

export type ViewerWidgetLayout = {
	widgetId: number;
	positionX: number;
	positionY: number;
	width: number;
	height: number;
};

export type DashboardOption = {
	value: string;
	label: string;
};

export type DashboardWidgetType = DashboardWidget['widgetType'];
export type DashboardList = DashboardDefinition[];
export type WidgetComparisonData = DashboardWidgetComparisonData;
