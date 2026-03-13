import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { WidgetContentBaseProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const PendingLineChartWidgetContent = ({
	widget,
	accentColor,
}: WidgetContentBaseProps) => {
	const { t } = useTranslation('campaign.form.dashboards');

	return (
		<DashboardWidgetCard title={widget.title} accentColor={accentColor}>
			<div className={styles.lineChartPending}>
				<svg
					className={styles.lineChartGhost}
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
				<Text size='sm' c='dimmed' className={styles.lineChartPendingText}>
					{t('dashboardBuilder.form.compatibility.lineChartPending')}
				</Text>
			</div>
		</DashboardWidgetCard>
	);
};

export default PendingLineChartWidgetContent;
