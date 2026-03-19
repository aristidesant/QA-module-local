import { BarChart } from '@mantine/charts';
import DashboardWidgetCard from '../DashboardWidgetCard';
import { getWidgetChartMetrics } from '../../../CampaignDashboardViewer.helpers';
import type { GroupedWidgetContentProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const BarChartWidgetContent = ({
	widget,
	accentColor,
	layout,
	chartData,
}: GroupedWidgetContentProps) => {
	const metrics = getWidgetChartMetrics(layout);

	return (
		<DashboardWidgetCard
			title={widget.title}
			accentColor={accentColor}
			groupByLabel={widget.result.meta.groupBy}
		>
			<div className={styles.chartWrapper}>
				<BarChart
					data={chartData}
					dataKey='name'
					series={[{ name: 'value', color: accentColor }]}
					withLegend={false}
					withTooltip
					tickLine='none'
					gridAxis='y'
					h={metrics.chartHeight}
					strokeDasharray='3 3'
					barProps={{ radius: [4, 4, 0, 0] }}
					valueFormatter={(value) =>
						Number.isFinite(value) ? value.toLocaleString() : '0'
					}
				/>
			</div>
		</DashboardWidgetCard>
	);
};

export default BarChartWidgetContent;
