import { Stack } from "@mantine/core";
import CampaignsList from "../CampaignsList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import { useCampaignsStore } from "~/store/campaignsStore";
import { CampaignsForm } from "../CampaignsForm/CampaignsForm";

export default function CampaignsPage() {
  const { rightComponent, selectedCampaign } = useCampaignsStore(
    (state) => state
  );
  return (
    <ContentContainer
      title="Campaigns creation"
      description="Create and manage your campaigns"
      rightSection={rightComponent || <>Ok</>}
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
