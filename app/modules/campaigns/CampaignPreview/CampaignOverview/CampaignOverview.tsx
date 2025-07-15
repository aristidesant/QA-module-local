import React from "react";
import { Text, Badge, Stack, Center, Group } from "@mantine/core";
import { IconArrowUpRight } from "@tabler/icons-react";
import classes from "./CampaignOverview.module.css";
import type { Campaign } from "../../../../models/CampaignsModel";

interface CampaignOverviewProps {
  campaign: Campaign;
}

const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaign }) => {
  return (
    <Stack gap={4} align="center" className={classes.simpleCard}>
      <Text size="xs" c="dimmed" mb={2}>
        Campaign
      </Text>
      <Text fw={700} size="lg" className={classes.campaignName}>
        {campaign.name}
      </Text>
      <Badge
        variant="light"
        color="gray"
        size="md"
        radius="xl"
        className={classes.outboundBadge}
        leftSection={null}
        rightSection={
          <IconArrowUpRight size={16} color="var(--mantine-color-green-6)" />
        }
        style={{ gap: 4, fontWeight: 500 }}
      >
        Outbound
      </Badge>
    </Stack>
  );
};

export default CampaignOverview;
