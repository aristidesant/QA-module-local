import { Stack } from "@mantine/core";
import CampaignsList from "../CampaignsList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { useCampaignsStore } from "~/store/campaignsStore";
import { CampaignsForm } from "../CampaignsForm/CampaignsForm";

export default function CampaignsPage() {
  const { rightComponent, selectedCampaign, resetView } = useCampaignsStore(
    (state) => state
  );

  return (
    <ContentContainer
      title="Campaigns creation"
      showBackButton={!!selectedCampaign}
      onBackClick={() => {
        resetView();
      }}
      description="Create and manage your campaigns"
      rightSection={rightComponent || <></>}
    >
      {selectedCampaign ? (
        <Stack>
          <CampaignsForm campaign={selectedCampaign} />
        </Stack>
      ) : (
        <CampaignsList />
      )}
    </ContentContainer>
  );
}
