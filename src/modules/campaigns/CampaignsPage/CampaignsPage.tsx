import CampaignsList from '../CampaignsList';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { Campaign } from '~/models/CampaignsModel';
import { useGetCampaign } from '~/queries/campaignsQueries';

export default function CampaignsPage() {
	const { selectedCampaign, editCampaign } = useCampaignsStore(
		(state) => state
	);
	const { data: campaign } = useGetCampaign(
		selectedCampaign?.id ? `${selectedCampaign?.id}` : ''
	);

	// Show campaign form if editing, otherwise show campaign list
	if (editCampaign && campaign) {
		return <CampaignsForm campaign={campaign as Campaign} />;
	}

	return <CampaignsList />;
}
