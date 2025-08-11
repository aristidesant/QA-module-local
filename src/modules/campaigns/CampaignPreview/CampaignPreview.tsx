import React from "react";
import { Stack, ScrollArea } from "@mantine/core";
import CampaignOverview from "./CampaignOverview";
import type { Campaign } from "../../../models/CampaignsModel";
import CampaignStatus from "./CampaignStatus";
import CampaignContactOutcomeSummary from "./CampaignContactOutcomeSummary";
import CampaignParameters from "./CampaignParameters";
import AssignedAgents from "./AssignedAgents";
import ContactsList from "./ContactsList";

interface CampaignPreviewProps {
  campaign: Campaign & {
    stats?: {
      callsMade: number;
      callsAnswered: number;
      conversionRate: number;
      avgCallDuration: string;
      lastUpdated: string;
    };
    agentPerformance?: Array<{
      id: number;
      name: string;
      callsHandled: number;
      successRate: number;
      avgRating: number;
    }>;
  };
}

// Helper functions moved to AssignedAgents component

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaign }) => {
  
  // Safely get campaign stats with defaults

  // No additional metrics needed - moved to CampaignPerformance component

  return (
    <ScrollArea h="100%" type="scroll" offsetScrollbars>
      <Stack gap="xs" p="xs">
        {/* Campaign Overview */}
        <CampaignOverview campaign={campaign} />

        <CampaignStatus />

        <CampaignContactOutcomeSummary />

        {/* New sections from the image */}
        <CampaignParameters parameters={campaign.parameters} />

        <AssignedAgents agents={campaign.assignedAgents} />

        <ContactsList contactList={campaign.contactList} />
      </Stack>
    </ScrollArea>
  );
};

export default CampaignPreview;
