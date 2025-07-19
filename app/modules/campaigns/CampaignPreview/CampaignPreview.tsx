import React from "react";
import { Stack, Box } from "@mantine/core";
import CampaignOverview from "./CampaignOverview";
import type { Campaign } from "../../../models/CampaignsModel";
import CampaignStatus from "./CampaignStatus";
import CampaignContactOutcomeSummary from "./CampaignContactOutcomeSummary";

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

// Format date string
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaign }) => {
  // Safely get campaign stats with defaults
  const stats = campaign.stats || {
    callsMade: 0,
    callsAnswered: 0,
    conversionRate: 0,
    avgCallDuration: "0:00",
    lastUpdated: new Date().toISOString(),
  };

  // No additional metrics needed - moved to CampaignPerformance component

  return (
    <Box p="0">
      <Stack gap="xs">
        {/* Campaign Overview */}
        <CampaignOverview campaign={campaign} />

        <CampaignStatus />

        <CampaignContactOutcomeSummary />
      </Stack>
    </Box>
  );
};

export default CampaignPreview;
