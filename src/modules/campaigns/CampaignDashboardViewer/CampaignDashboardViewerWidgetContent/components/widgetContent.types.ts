import type {
	DashboardRenderWidget,
	GroupedMetricResult,
	MetricComparison,
} from '~/models/AnalyticsDashboard';
import type { ViewerWidgetLayout } from '../../types';

export interface WidgetContentBaseProps {
	widget: DashboardRenderWidget;
	accentColor: string;
	layout?: ViewerWidgetLayout;
	noDragClassName: string;
	comparison?: MetricComparison;
}

export interface WidgetChartDatum {
	name: string;
	value: number;
	color: string;
}

export interface GroupedWidgetContentProps extends Omit<
	WidgetContentBaseProps,
	'comparison'
> {
	widget: DashboardRenderWidget & { result: GroupedMetricResult };
	chartData: WidgetChartDatum[];
}
