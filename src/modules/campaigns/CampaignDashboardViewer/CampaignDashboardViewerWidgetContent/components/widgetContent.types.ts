import type {
	AnalyticsTimeRange,
	DashboardRenderWidget,
	GroupedMetricResult,
	TimeSeriesMetricResult,
} from '~/models/AnalyticsDashboard';
import type { ViewerWidgetLayout, WidgetComparisonData } from '../../types';

export interface WidgetContentBaseProps {
	widget: DashboardRenderWidget;
	accentColor: string;
	layout?: ViewerWidgetLayout;
	noDragClassName: string;
	comparisonData?: WidgetComparisonData;
	comparisonPeriodLabel?: string;
	selectedTimeRange?: AnalyticsTimeRange | null;
}

export interface WidgetChartDatum {
	name: string;
	value: number;
	color: string;
}

export interface GroupedWidgetContentProps extends Omit<
	WidgetContentBaseProps,
	'comparisonData' | 'comparisonPeriodLabel'
> {
	widget: DashboardRenderWidget & { result: GroupedMetricResult };
	chartData: WidgetChartDatum[];
}

export interface TimeSeriesWidgetContentProps extends Omit<
	WidgetContentBaseProps,
	'comparisonPeriodLabel'
> {
	widget: DashboardRenderWidget & { result: TimeSeriesMetricResult };
}
