import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';

const DashboardPreviewView = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { campaignId } = useDashboardSectionSelection();
	const { previewDashboard, closePreviewDashboard } =
		useDashboardSectionModals();

	if (!previewDashboard) {
		return null;
	}

	return (
		<ContentContainer
			showBackButton
			onBackClick={closePreviewDashboard}
			title={t('dashboardBuilder.preview.title')}
			description={t('dashboardBuilder.preview.description')}
			contentWidth='centered'
			mainScroll={false}
		>
			<CampaignDashboardViewer
				campaignId={campaignId}
				initialDashboardId={previewDashboard.id}
				allowLayoutEditing
			/>
		</ContentContainer>
	);
};

export default DashboardPreviewView;
