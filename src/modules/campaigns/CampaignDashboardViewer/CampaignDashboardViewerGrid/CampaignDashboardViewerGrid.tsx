import { Stack, Text } from '@mantine/core';
import { IconSquarePlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign.form.dashboards');

	if (widgets.length === 0) {
		return (
			<div className={styles.emptyState}>
				<IconSquarePlus
					size={22}
					className={styles.emptyStateIcon}
					strokeWidth={1.75}
				/>
				<Stack gap={2} align='center'>
					<Text size='sm' fw={600} className={styles.emptyStateTitle}>
						{t('dashboardBuilder.emptyWidgetTitle')}
					</Text>
					<Text size='xs' className={styles.emptyStateDescription} ta='center'>
						{t('dashboardBuilder.emptyWidgetDescription')}
					</Text>
				</Stack>
			</div>
		);
	}

	return (
		<div className={styles.grid}>
			<div className={styles.gridInner}>
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
		</div>
	);
};

export default CampaignDashboardViewerGrid;
