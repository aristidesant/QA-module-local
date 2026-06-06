import { useTranslation } from 'react-i18next';
import DashboardSection from '~/modules/campaigns/CampaignsForm/DashboardSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

const DashboardsPage = () => {
	const { t } = useTranslation('campaign.form.dashboards');

	return (
		<ContentContainer
			title={t('dashboardBuilder.title')}
			description={t('dashboardBuilder.description')}
		>
			<DashboardSection
				campaignId={null}
				allowGlobal
				allowMainSlot
				fullHeight
				overlayTopOffset={0}
			/>
		</ContentContainer>
	);
};

export default DashboardsPage;
