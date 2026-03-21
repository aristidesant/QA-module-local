import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardWidgetCard from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/components/DashboardWidgetCard';
import type { WidgetPreviewModel } from '../../DashboardSection.types';
import styles from './DashboardWidgetPreview.module.css';
import viewerStyles from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerWidgetContent/CampaignDashboardViewerWidgetContent.module.css';

type DashboardWidgetPreviewEmptyProps = {
	preview: WidgetPreviewModel;
	description?: string | null;
	statusMessage?: string;
	statusTone?: 'muted' | 'danger';
};

const DashboardWidgetPreviewEmpty = ({
	preview,
	description,
	statusMessage,
	statusTone = 'muted',
}: DashboardWidgetPreviewEmptyProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const statusColor = statusTone === 'danger' ? 'red' : 'dimmed';
	const resolvedDescription =
		description ??
		preview.description ??
		t('dashboardBuilder.form.preview.emptyWidgetDescription');

	return (
		<div className={styles.previewFrame} data-size={preview.sizePreset}>
			<DashboardWidgetCard
				title={preview.title}
				accentColor={preview.accentColor}
				variant='builderPreview'
			>
				<div className={viewerStyles.emptyWidgetState}>
					<Text size='sm' c='dimmed'>
						{resolvedDescription}
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

export default DashboardWidgetPreviewEmpty;
