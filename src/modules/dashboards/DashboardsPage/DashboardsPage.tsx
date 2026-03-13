import { useTranslation } from 'react-i18next';
import { IconLayoutDashboard } from '@tabler/icons-react';
import DashboardSection from '~/modules/campaigns/CampaignsForm/DashboardSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

const DashboardsPage = () => {
	const { t } = useTranslation('dashboards');

	return (
		<ContentContainer
			title={t('title')}
			description={t('description')}
			titleIcon={<IconLayoutDashboard size={16} />}
		>
			<DashboardSection campaignId={null} allowGlobal />
		</ContentContainer>
	);
};

export default DashboardsPage;
