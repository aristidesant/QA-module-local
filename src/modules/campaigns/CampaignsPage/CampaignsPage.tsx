import CampaignsList from '../CampaignsList';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { Campaign } from '~/models/CampaignsModel';

export default function CampaignsPage() {
	const { rightComponent, selectedCampaign, editCampaign, resetView } =
		useCampaignsStore((state) => state);

	return (
		<ContentContainer
			showBackButton={!!editCampaign}
			onBackClick={() => {
				resetView();
			}}
			rightSection={rightComponent || <></>}
		>
			{editCampaign ? (
				<CampaignsForm campaign={selectedCampaign as Campaign} />
			) : (
				<CampaignsList />
			)}
		</ContentContainer>
	);
}
