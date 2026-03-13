import type {
	DashboardDefinition,
	DashboardWidget,
	DashboardWidgetType,
} from '~/models/AnalyticsDashboard';

export type DashboardFormValues = {
	name: string;
	description: string;
	isDefault: boolean;
};

export type WidgetFormValues = {
	metricDefinitionId: string;
	widgetType: DashboardWidgetType;
	title: string;
	description: string;
	groupBy: string;
	limit: number | '';
	positionX: number;
	positionY: number;
	width: number;
	height: number;
	enabled: boolean;
};

export type DashboardModalState = {
	opened: boolean;
	editingDashboard: DashboardDefinition | null;
};

export type WidgetModalState = {
	opened: boolean;
	editingWidget: DashboardWidget | null;
};
