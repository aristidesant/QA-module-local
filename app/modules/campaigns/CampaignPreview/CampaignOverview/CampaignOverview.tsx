import React from "react";
import { Text, Badge, Stack, Center, Group, ThemeIcon } from "@mantine/core";
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
          <>
            {campaign.type === "OUTBOUND" && (
              <ThemeIcon variant="transparent" color="green" size={"xs"}>
                <IconArrowUpRight />
              </ThemeIcon>
            )}
            {campaign.type === "INBOUND" && (
              <ThemeIcon variant="transparent" color="blue" size={"xs"}>
                <IconArrowUpRight />
              </ThemeIcon>
            )}
          </>
        }
        style={{ gap: 4, fontWeight: 500 }}
      >
        {campaign.type.charAt(0) + campaign.type.slice(1).toLowerCase()}
      </Badge>
    </Stack>
  );
};

export default CampaignOverview;
