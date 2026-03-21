import { BarChart, DonutChart, PieChart } from '@mantine/charts';
import { Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/components/DashboardWidgetCard';
import {
	formatMetricValue,
	resolveLabel,
} from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.helpers';
import { buildWidgetChartData } from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/components/widgetContent.helpers';
import type { DashboardWidgetType } from '~/models/AnalyticsDashboard';
import type { WidgetPreviewModel } from '../../DashboardSection.types';
import styles from './DashboardWidgetPreview.module.css';
import DashboardWidgetPreviewEmpty from './DashboardWidgetPreviewEmpty';
import viewerStyles from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/CampaignDashboardViewerWidgetContent.module.css';

type DashboardWidgetPreviewGroupedProps = {
	preview: Extract<WidgetPreviewModel, { kind: 'grouped' }>;
	widgetType: Exclude<DashboardWidgetType, 'KPI' | 'LINE_CHART'>;
	statusMessage?: string;
	statusTone?: 'muted' | 'danger';
};

const PREVIEW_METRICS = {
	SMALL: { chartHeight: 78, pieSize: 92 },
	MEDIUM: { chartHeight: 96, pieSize: 108 },
	LARGE: { chartHeight: 122, pieSize: 128 },
	FULL: { chartHeight: 138, pieSize: 144 },
} as const;

const getPreviewMetrics = (sizePreset: WidgetPreviewModel['sizePreset']) =>
	sizePreset === 'CUSTOM'
		? PREVIEW_METRICS.MEDIUM
		: PREVIEW_METRICS[sizePreset];

const DashboardWidgetPreviewGrouped = ({
	preview,
	widgetType,
	statusMessage,
	statusTone = 'muted',
}: DashboardWidgetPreviewGroupedProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const statusColor = statusTone === 'danger' ? 'red' : 'dimmed';

	const chartData = buildWidgetChartData(preview.rows, t);
	const total = chartData.reduce((sum, item) => sum + item.value, 0);
	const metrics = getPreviewMetrics(preview.sizePreset);
	const showLongLegend = chartData.length > 6;
	const pieLayoutClass = showLongLegend
		? `${viewerStyles.pieLayout} ${viewerStyles['pieLayout--wideLegend']}`
		: viewerStyles.pieLayout;
	const legendClass = showLongLegend
		? `${viewerStyles.legendList} ${viewerStyles['legendList--twoCol']}`
		: viewerStyles.legendList;

	if (chartData.length === 0) {
		return (
			<DashboardWidgetPreviewEmpty
				preview={preview}
				description={preview.description}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	const groupedWidgetType = widgetType as
		| 'BAR_CHART'
		| 'PIE_CHART'
		| 'DONUT_CHART'
		| 'TABLE';

	if (groupedWidgetType === 'TABLE') {
		return (
			<div className={styles.previewFrame} data-size={preview.sizePreset}>
				<DashboardWidgetCard
					title={preview.title}
					accentColor={preview.accentColor}
					groupByLabel={preview.groupByLabel}
					variant='builderPreview'
				>
					<div className={viewerStyles.tableWrapper}>
						<Table striped highlightOnHover stickyHeader>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('dashboard.table.label')}</Table.Th>
									<Table.Th>{t('dashboard.table.value')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{chartData.map((row, rowIndex) => (
									<Table.Tr key={`${row.name}-${rowIndex}`}>
										<Table.Td>
											{resolveLabel(row.name, t('dashboard.unknownLabel'))}
										</Table.Td>
										<Table.Td>{formatMetricValue(row.value)}</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
				</DashboardWidgetCard>
				{statusMessage ? (
					<Text size='xs' c={statusColor} className={styles.statusText}>
						{statusMessage}
					</Text>
				) : null}
			</div>
		);
	}

	if (
		groupedWidgetType === 'PIE_CHART' ||
		groupedWidgetType === 'DONUT_CHART'
	) {
		const chartSize = showLongLegend
			? Math.max(metrics.pieSize - 12, 104)
			: metrics.pieSize;
		const chartThickness =
			groupedWidgetType === 'DONUT_CHART'
				? Math.max(24, Math.round(chartSize * 0.24))
				: undefined;

		return (
			<div className={styles.previewFrame} data-size={preview.sizePreset}>
				<DashboardWidgetCard
					title={preview.title}
					accentColor={preview.accentColor}
					groupByLabel={preview.groupByLabel}
					variant='builderPreview'
				>
					<div className={pieLayoutClass}>
						<div className={viewerStyles.pieChartWrapper}>
							{groupedWidgetType === 'DONUT_CHART' ? (
								<DonutChart
									data={chartData}
									size={chartSize}
									thickness={chartThickness}
									withTooltip
									tooltipDataSource='segment'
									strokeWidth={1}
									strokeColor='rgba(255,255,255,0.9)'
									paddingAngle={1}
									chartLabel={total.toLocaleString()}
								/>
							) : (
								<PieChart
									data={chartData}
									size={chartSize}
									withTooltip
									tooltipDataSource='segment'
									strokeWidth={1}
									strokeColor='rgba(255,255,255,0.9)'
									paddingAngle={2}
								/>
							)}
						</div>
						<div className={legendClass}>
							{chartData.map((item) => {
								const pct = total > 0 ? (item.value / total) * 100 : 0;

								return (
									<div key={item.name} className={viewerStyles.legendRow}>
										<div className={viewerStyles.legendRowTop}>
											<div className={viewerStyles.legendRowLeft}>
												<span
													className={viewerStyles.legendDot}
													style={{ backgroundColor: item.color }}
												/>
												<Text
													size='xs'
													truncate
													className={viewerStyles.legendName}
												>
													{item.name}
												</Text>
											</div>
											<div className={viewerStyles.legendMeta}>
												<Text
													size='xs'
													c='dimmed'
													className={viewerStyles.legendPct}
												>
													{pct.toFixed(1)}%
												</Text>
												<Text
													size='xs'
													fw={600}
													className={viewerStyles.legendValue}
												>
													{item.value.toLocaleString()}
												</Text>
											</div>
										</div>
										<div className={viewerStyles.legendBar}>
											<div
												className={viewerStyles.legendBarFill}
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
				{statusMessage ? (
					<Text size='xs' c={statusColor} className={styles.statusText}>
						{statusMessage}
					</Text>
				) : null}
			</div>
		);
	}

	return (
		<div className={styles.previewFrame} data-size={preview.sizePreset}>
			<DashboardWidgetCard
				title={preview.title}
				accentColor={preview.accentColor}
				groupByLabel={preview.groupByLabel}
				variant='builderPreview'
			>
				<div className={viewerStyles.chartWrapper}>
					<BarChart
						data={chartData}
						dataKey='name'
						series={[{ name: 'value', color: preview.accentColor }]}
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
			{statusMessage ? (
				<Text size='xs' c={statusColor} className={styles.statusText}>
					{statusMessage}
				</Text>
			) : null}
		</div>
	);
};

export default DashboardWidgetPreviewGrouped;
