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
		selectedCampaign?.id ? `${selectedCampaign?.id}` : ``
	); // Ensure campaign data is fresh

	return (
		<>
			{editCampaign && campaign ? (
				<CampaignsForm campaign={campaign as Campaign} />
			) : (
				<CampaignsList />
			)}
		</>
	);
}
