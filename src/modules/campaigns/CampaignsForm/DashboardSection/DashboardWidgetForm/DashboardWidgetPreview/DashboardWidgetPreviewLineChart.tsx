import { LineChart } from '@mantine/charts';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/components/DashboardWidgetCard';
import type { DashboardWidgetSizePreset } from '~/modules/campaigns/dashboardLayout';
import type { WidgetPreviewModel } from '../../DashboardSection.types';
import styles from './DashboardWidgetPreview.module.css';
import viewerStyles from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/CampaignDashboardViewerWidgetContent.module.css';

const CHART_HEIGHTS: Record<DashboardWidgetSizePreset, number> = {
	SMALL: 72,
	MEDIUM: 96,
	LARGE: 120,
	FULL: 144,
	CUSTOM: 120,
};

type DashboardWidgetPreviewLineChartProps = {
	preview: Extract<WidgetPreviewModel, { kind: 'line_chart' }>;
	statusMessage?: string;
	statusTone?: 'muted' | 'danger';
};

const DashboardWidgetPreviewLineChart = ({
	preview,
	statusMessage,
	statusTone = 'muted',
}: DashboardWidgetPreviewLineChartProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const statusColor = statusTone === 'danger' ? 'red' : 'dimmed';
	const chartHeight = CHART_HEIGHTS[preview.sizePreset];

	const data = preview.points.map((point) => ({
		label: point.label,
		value: point.value,
	}));

	return (
		<div className={styles.previewFrame} data-size={preview.sizePreset}>
			<DashboardWidgetCard
				title={preview.title}
				accentColor={preview.accentColor}
			>
				{data.length > 0 ? (
					<div className={viewerStyles.chartWrapper}>
						<LineChart
							data={data}
							dataKey='label'
							series={[{ name: 'value', color: preview.accentColor }]}
							withLegend={false}
							withTooltip
							withDots={data.length <= 12}
							curveType='monotone'
							tickLine='none'
							gridAxis='y'
							strokeDasharray='3 3'
							h={chartHeight}
							valueFormatter={(value) =>
								Number.isFinite(value) ? value.toLocaleString() : '0'
							}
						/>
					</div>
				) : (
					<div className={viewerStyles.lineChartPending}>
						<svg
							className={viewerStyles.lineChartGhost}
							viewBox='0 0 200 60'
							fill='none'
							preserveAspectRatio='none'
						>
							<polyline
								points='0,50 30,38 60,42 90,20 120,28 150,12 180,18 200,8'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								fill='none'
							/>
						</svg>
						<Text
							size='sm'
							c='dimmed'
							className={viewerStyles.lineChartPendingText}
						>
							{t('dashboardBuilder.form.preview.emptyMetricTitle')}
						</Text>
					</div>
				)}
			</DashboardWidgetCard>
			{statusMessage ? (
				<Text size='xs' c={statusColor} className={styles.statusText}>
					{statusMessage}
				</Text>
			) : null}
		</div>
	);
};

export default DashboardWidgetPreviewLineChart;
