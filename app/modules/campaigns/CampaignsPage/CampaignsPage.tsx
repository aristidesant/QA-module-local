import { Stack } from "@mantine/core";
import CampaignsList from "../CampaignsList";
import PageHeader from "~/components/ui/PageHeader";

export default function CampaignsPage() {
  return (
    <Stack>
      <PageHeader
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Campaigns", path: "/campaigns" },
        ]}
      />
      <CampaignsList />
    </Stack>
  );
}
