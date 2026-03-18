import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '../DashboardWidgetCard';
import { getWidgetChartMetrics } from '../../../CampaignDashboardViewer.helpers';
import type { TimeSeriesWidgetContentProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const LineChartWidgetContent = ({
	widget,
	accentColor,
	layout,
}: TimeSeriesWidgetContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const metrics = getWidgetChartMetrics(layout);

	const data = widget.result.points.map((point) => ({
		label: point.label,
		value: point.value,
	}));

	if (data.length === 0) {
		return (
			<DashboardWidgetCard title={widget.title} accentColor={accentColor}>
				<div className={styles.emptyWidgetState}>
					<span>{t('dashboard.emptyWidgetData')}</span>
				</div>
			</DashboardWidgetCard>
		);
	}

	return (
		<DashboardWidgetCard title={widget.title} accentColor={accentColor}>
			<div className={styles.chartWrapper}>
				<LineChart
					data={data}
					dataKey='label'
					series={[{ name: 'value', color: accentColor }]}
					withLegend={false}
					withTooltip
					withDots={data.length <= 12}
					curveType='monotone'
					tickLine='none'
					gridAxis='y'
					strokeDasharray='3 3'
					h={metrics.chartHeight}
					valueFormatter={(value) =>
						Number.isFinite(value) ? value.toLocaleString() : '0'
					}
				/>
			</div>
		</DashboardWidgetCard>
	);
};

export default LineChartWidgetContent;
