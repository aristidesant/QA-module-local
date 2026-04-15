import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';

const DashboardPreviewView = () => {
	const { campaignId } = useDashboardSectionSelection();
	const { previewDashboard, closePreviewDashboard } =
		useDashboardSectionModals();

	if (!previewDashboard) {
		return null;
	}

	return (
		<CampaignDashboardViewer
			campaignId={campaignId}
			initialDashboardId={previewDashboard.id}
			allowLayoutEditing
			onBackClick={closePreviewDashboard}
		/>
	);
};

export default DashboardPreviewView;
