import { PieChart } from '@mantine/charts';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { getWidgetChartMetrics } from '../../../CampaignDashboardViewer.helpers';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { GroupedWidgetContentProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const PieChartWidgetContent = ({
	widget,
	accentColor,
	layout,
	noDragClassName,
	chartData,
}: GroupedWidgetContentProps) => {
	const metrics = getWidgetChartMetrics(layout);
	const { t } = useTranslation('campaign.form.dashboards');
	const isLongLegend = chartData.length > 6;
	const pieLayoutClass = isLongLegend
		? `${styles.pieLayout} ${styles['pieLayout--wideLegend']}`
		: styles.pieLayout;
	const legendClass = isLongLegend
		? `${styles.legendList} ${styles['legendList--twoCol']} ${noDragClassName}`
		: `${styles.legendList} ${noDragClassName}`;
	const total = chartData.reduce((sum, item) => sum + item.value, 0);
	const chartSize = isLongLegend
		? Math.max(metrics.pieSize - 20, 110)
		: metrics.pieSize;

	return (
		<DashboardWidgetCard
			title={widget.title}
			accentColor={accentColor}
			liveLabel={t('dashboard.liveBadge')}
			groupByLabel={widget.result.meta.groupBy}
		>
			<div className={pieLayoutClass}>
				<div className={styles.pieChartWrapper}>
					<div className={styles.donutCenterWrapper}>
						<PieChart
							data={chartData}
							size={chartSize}
							withTooltip
							tooltipDataSource='segment'
							strokeWidth={1}
							strokeColor='rgba(255,255,255,0.9)'
							paddingAngle={2}
						/>
					</div>
				</div>
				<div className={legendClass}>
					{chartData.map((item) => {
						const pct = total > 0 ? (item.value / total) * 100 : 0;

						return (
							<div key={item.name} className={styles.legendRow}>
								<div className={styles.legendRowTop}>
									<div className={styles.legendRowLeft}>
										<span
											className={styles.legendDot}
											style={{ backgroundColor: item.color }}
										/>
										<Text size='xs' truncate className={styles.legendName}>
											{item.name}
										</Text>
									</div>
									<div className={styles.legendMeta}>
										<Text size='xs' c='dimmed' className={styles.legendPct}>
											{pct.toFixed(1)}%
										</Text>
										<Text size='xs' fw={600} className={styles.legendValue}>
											{item.value.toLocaleString()}
										</Text>
									</div>
								</div>
								<div className={styles.legendBar}>
									<div
										className={styles.legendBarFill}
										style={{
											width: `${pct}%`,
											backgroundColor: item.color,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</DashboardWidgetCard>
	);
};

export default PieChartWidgetContent;
