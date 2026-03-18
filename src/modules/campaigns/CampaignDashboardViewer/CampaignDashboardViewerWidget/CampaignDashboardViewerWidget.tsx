import { ThemeIcon, Tooltip } from '@mantine/core';
import { IconExclamationCircle, IconGripHorizontal } from '@tabler/icons-react';
import type {
	AnalyticsTimeRange,
	DashboardRenderWidget,
} from '~/models/AnalyticsDashboard';
import { useTranslation } from 'react-i18next';
import {
	ACCENT_COLORS,
	getWidgetClassName,
	getWidgetStyle,
} from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout, WidgetComparisonData } from '../types';
import CampaignDashboardViewerWidgetContent from '../CampaignDashboardViewerWidgetContent';
import styles from './CampaignDashboardViewerWidget.module.css';

interface CampaignDashboardViewerWidgetProps {
	widget: DashboardRenderWidget;
	index: number;
	layout?: ViewerWidgetLayout;
	isEditing?: boolean;
	comparisonData?: WidgetComparisonData;
	comparisonPeriodLabel?: string;
	selectedTimeRange?: AnalyticsTimeRange | null;
}

const CampaignDashboardViewerWidget = ({
	widget,
	index,
	layout,
	isEditing = false,
	comparisonData,
	comparisonPeriodLabel,
	selectedTimeRange,
}: CampaignDashboardViewerWidgetProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
	const showComparisonWarning =
		widget.status === 'UNSUPPORTED' && Boolean(widget.result);

	return (
		<div
			className={getWidgetClassName(widget.widgetType, styles, isEditing)}
			style={isEditing ? undefined : getWidgetStyle(layout)}
		>
			{showComparisonWarning ? (
				<div className={styles.widgetWarningBadge}>
					<Tooltip
						label={t('dashboard.comparisonUnavailableTooltip')}
						withArrow
						withinPortal
						position='left'
					>
						<ThemeIcon
							variant='subtle'
							color='orange'
							size={18}
							radius='xl'
							aria-label={t('dashboard.comparisonUnavailableTooltip')}
							className={styles.widgetWarningButton}
						>
							<IconExclamationCircle size={12} stroke={2.4} />
						</ThemeIcon>
					</Tooltip>
				</div>
			) : null}
			{isEditing && (
				<div className={styles.widgetDragHandle}>
					<IconGripHorizontal size={14} stroke={1.5} />
				</div>
			)}
			<div className={styles.widgetContent}>
				<CampaignDashboardViewerWidgetContent
					widget={widget}
					accentColor={accentColor}
					layout={layout}
					noDragClassName={styles.widgetNoDrag}
					comparisonData={comparisonData}
					comparisonPeriodLabel={comparisonPeriodLabel}
					selectedTimeRange={selectedTimeRange}
				/>
			</div>
		</div>
	);
};

export default CampaignDashboardViewerWidget;
