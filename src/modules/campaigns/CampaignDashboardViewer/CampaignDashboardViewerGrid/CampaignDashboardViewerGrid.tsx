import type {
	AnalyticsTimeRange,
	DashboardRenderWidget,
} from '~/models/AnalyticsDashboard';
import type { ViewerWidgetLayout, WidgetComparisonData } from '../types';
import CampaignDashboardViewerWidget from '../CampaignDashboardViewerWidget';
import styles from './CampaignDashboardViewerGrid.module.css';

interface CampaignDashboardViewerGridProps {
	widgets: DashboardRenderWidget[];
	activeLayoutMap: Map<number, ViewerWidgetLayout>;
	comparisonMap?: Map<number, WidgetComparisonData>;
	comparisonPeriodLabel?: string;
	selectedTimeRange?: AnalyticsTimeRange | null;
}

const CampaignDashboardViewerGrid = ({
	widgets,
	activeLayoutMap,
	comparisonMap,
	comparisonPeriodLabel,
	selectedTimeRange,
}: CampaignDashboardViewerGridProps) => {
	return (
		<div className={styles.grid}>
			{widgets.map((widget, index) => (
				<CampaignDashboardViewerWidget
					key={widget.widgetId}
					widget={widget}
					index={index}
					layout={activeLayoutMap.get(widget.widgetId)}
					comparisonData={comparisonMap?.get(widget.widgetId)}
					comparisonPeriodLabel={comparisonPeriodLabel}
					selectedTimeRange={selectedTimeRange}
				/>
			))}
		</div>
	);
};

export default CampaignDashboardViewerGrid;
