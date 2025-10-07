import CampaignsList from '../CampaignsList';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { Campaign } from '~/models/CampaignsModel';
import { useGetCampaign } from '~/queries/campaignsQueries';

export default function CampaignsPage() {
	const { rightComponent, selectedCampaign, editCampaign, resetView } =
		useCampaignsStore((state) => state);
	const { data: campaign } = useGetCampaign(
		selectedCampaign?.id ? `${selectedCampaign?.id}` : ``
	); // Ensure campaign data is fresh

	return (
		<ContentContainer
			showBackButton={!!editCampaign}
			onBackClick={() => {
				resetView();
			}}
			rightSection={rightComponent || <></>}
		>
			{editCampaign && campaign ? (
				<CampaignsForm campaign={campaign as Campaign} />
			) : (
				<CampaignsList />
			)}
		</ContentContainer>
	);
}
