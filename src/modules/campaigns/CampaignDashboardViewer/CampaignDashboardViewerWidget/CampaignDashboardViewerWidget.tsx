import type {
	DashboardRenderWidget,
	MetricComparison,
} from '~/models/AnalyticsDashboard';
import {
	ACCENT_COLORS,
	getWidgetClassName,
	getWidgetStyle,
} from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout } from '../types';
import CampaignDashboardViewerWidgetContent from '../CampaignDashboardViewerWidgetContent';
import styles from './CampaignDashboardViewerWidget.module.css';

interface CampaignDashboardViewerWidgetProps {
	widget: DashboardRenderWidget;
	index: number;
	layout?: ViewerWidgetLayout;
	isEditing?: boolean;
	comparison?: MetricComparison;
}

const CampaignDashboardViewerWidget = ({
	widget,
	index,
	layout,
	isEditing = false,
	comparison,
}: CampaignDashboardViewerWidgetProps) => {
	const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

	return (
		<div
			className={getWidgetClassName(widget.widgetType, styles, isEditing)}
			style={isEditing ? undefined : getWidgetStyle(layout)}
		>
			<div className={styles.widgetContent}>
				<CampaignDashboardViewerWidgetContent
					widget={widget}
					accentColor={accentColor}
					layout={layout}
					noDragClassName={styles.widgetNoDrag}
					comparison={comparison}
				/>
			</div>
		</div>
	);
};

export default CampaignDashboardViewerWidget;
