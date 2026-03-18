import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/components/DashboardWidgetCard';
import type { WidgetPreviewModel } from '../../DashboardSection.types';
import styles from './DashboardWidgetPreview.module.css';
import viewerStyles from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/CampaignDashboardViewerWidgetContent.module.css';

type DashboardWidgetPreviewLineChartProps = {
	preview: WidgetPreviewModel;
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

	return (
		<div className={styles.previewFrame} data-size={preview.sizePreset}>
			<DashboardWidgetCard
				title={preview.title}
				accentColor={preview.accentColor}
			>
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
						{t('dashboardBuilder.form.compatibility.lineChartPending')}
					</Text>
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

export default DashboardWidgetPreviewLineChart;
