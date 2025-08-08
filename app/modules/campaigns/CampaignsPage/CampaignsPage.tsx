import CampaignsList from "../CampaignsList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { CampaignsForm } from "../CampaignsForm/CampaignsForm";

export default function CampaignsPage() {
	const { rightComponent, selectedCampaign, resetView } = useCampaignsStore(
		(state) => state
	);

	return (
		<ContentContainer
			// title="Campaigns creation"
			showBackButton={!!selectedCampaign}
			onBackClick={() => {
				resetView();
			}}
			// description="Create and manage your campaigns"
			rightSection={rightComponent || <></>}
		>
			{selectedCampaign ? (
				<CampaignsForm campaign={selectedCampaign} />
			) : (
				<CampaignsList />
			)}
		</ContentContainer>
	);
}
