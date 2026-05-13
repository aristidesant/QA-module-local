import { BarChart } from '@mantine/charts';
import { useChartReady } from '~/hooks/useChartReady';
import { getWidgetChartMetrics } from '../../../CampaignDashboardViewer.helpers';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { GroupedWidgetContentProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const BarChartWidgetContent = ({
	widget,
	accentColor,
	layout,
	chartData,
}: GroupedWidgetContentProps) => {
	const ready = useChartReady();
	const { chartHeight } = getWidgetChartMetrics(layout);

	return (
		<DashboardWidgetCard
			title={widget.title}
			accentColor={accentColor}
			groupByLabel={widget.result.meta.groupBy}
		>
			<div className={styles.chartWrapper}>
				{ready ? (
					<BarChart
						h={chartHeight}
						data={chartData}
						dataKey='name'
						series={[{ name: 'value', color: accentColor }]}
						withLegend={false}
						withTooltip
						tickLine='none'
						gridAxis='y'
						strokeDasharray='3 3'
						barProps={{ radius: [4, 4, 0, 0] }}
						valueFormatter={(value) =>
							Number.isFinite(value) ? value.toLocaleString() : '0'
						}
					/>
				) : (
					<div className={styles.chartPlaceholder} />
				)}
			</div>
		</DashboardWidgetCard>
	);
};

export default BarChartWidgetContent;
