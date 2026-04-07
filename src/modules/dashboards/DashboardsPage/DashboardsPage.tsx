import DashboardSection from '~/modules/campaigns/CampaignsForm/DashboardSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

const DashboardsPage = () => {
	return (
		<ContentContainer>
			<DashboardSection campaignId={null} allowGlobal />
		</ContentContainer>
	);
};

export default DashboardsPage;
