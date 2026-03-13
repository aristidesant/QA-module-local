import type {
	DashboardRenderWidget,
	MetricComparison,
} from '~/models/AnalyticsDashboard';
import type { ViewerWidgetLayout } from '../types';
import CampaignDashboardViewerWidget from '../CampaignDashboardViewerWidget';
import styles from './CampaignDashboardViewerGrid.module.css';

interface CampaignDashboardViewerGridProps {
	widgets: DashboardRenderWidget[];
	activeLayoutMap: Map<number, ViewerWidgetLayout>;
	comparisonMap?: Map<number, MetricComparison>;
}

const CampaignDashboardViewerGrid = ({
	widgets,
	activeLayoutMap,
	comparisonMap,
}: CampaignDashboardViewerGridProps) => {
	return (
		<div className={styles.grid}>
			{widgets.map((widget, index) => (
				<CampaignDashboardViewerWidget
					key={widget.widgetId}
					widget={widget}
					index={index}
					layout={activeLayoutMap.get(widget.widgetId)}
					comparison={comparisonMap?.get(widget.widgetId)}
				/>
			))}
		</div>
	);
};

export default CampaignDashboardViewerGrid;
