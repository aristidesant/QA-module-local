import { DonutChart } from '@mantine/charts';
import { Box, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useChartReady } from '~/hooks/useChartReady';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { GroupedWidgetContentProps } from '../widgetContent.types';
import { useTranslation } from 'react-i18next';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const sharedStyles = styles;
const LABEL_HEIGHT = 80;

const DonutChartWidgetContent = ({
	widget,
	accentColor,
	chartData,
}: GroupedWidgetContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const { ref, width, height } = useElementSize();
	const ready = useChartReady();
	const visibleChartData = chartData.filter((item) => item.value > 0);
	const hasVisibleData = visibleChartData.length > 0;
	const chartSize = Math.max(Math.min(width, height - LABEL_HEIGHT), 72);

	if (!hasVisibleData) {
		return (
			<DashboardWidgetCard
				title={widget.title}
				accentColor={accentColor}
				groupByLabel={widget.result.meta.groupBy}
			>
				<div className={sharedStyles.emptyWidgetState}>
					<Text size='sm' c='dimmed'>
						{t('dashboard.emptyWidgetData')}
					</Text>
				</div>
			</DashboardWidgetCard>
		);
	}

	return (
		<DashboardWidgetCard
			title={widget.title}
			accentColor={accentColor}
			groupByLabel={widget.result.meta.groupBy}
		>
			<div ref={ref} className={styles.donutChartWrapper}>
				{ready ? (
					<DonutChart
						withLabels
						withLabelsLine
						size={chartSize}
						thickness={30}
						data={visibleChartData}
					/>
				) : (
					<Box h={chartSize} w={chartSize} />
				)}
			</div>
		</DashboardWidgetCard>
	);
};

export default DonutChartWidgetContent;
