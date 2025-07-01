import React from "react";
import {
  Text,
  Badge,
  Group,
  Stack,
  Paper,
  Avatar,
  ThemeIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { RightSection as Section } from "~/components/RightSection";
import CampaignOverview from "./CampaignOverview";
import { CampaignPerformance } from "./CampaignPerformance";
import { AssignedAgents } from "./AssignedAgents";
import { ContactsList } from "./ContactsList";
import classes from "./CampaignPreview.module.css";
import type { Campaign } from "../../../models/CampaignsModel";

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

        {/* Campaign Performance */}
        {campaign.stats && (
          <CampaignPerformance stats={stats} createdAt={campaign.createdAt} />
        )}

        {/* Assigned Agents */}
        {campaign.assignedAgents && campaign.assignedAgents.length > 0 && (
          <AssignedAgents agents={campaign.assignedAgents} />
        )}

        {/* Contacts List */}
        {campaign.contactList && (
          <ContactsList contactList={campaign.contactList} />
        )}
      </Stack>
    </Box>
  );
};

export default CampaignPreview;
