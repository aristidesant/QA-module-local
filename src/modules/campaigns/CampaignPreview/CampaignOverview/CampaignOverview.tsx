import React, { useState } from "react";
import { Text, Badge, Stack, Group, ThemeIcon, Button } from "@mantine/core";
import {
  IconArrowUpRight,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import classes from "./CampaignOverview.module.css";
import type { Campaign } from "../../../../models/CampaignsModel";

interface CampaignOverviewProps {
  campaign: Campaign;
  onPause?: () => void;
  onResume?: () => void;
}

const CampaignOverview: React.FC<CampaignOverviewProps> = ({
  campaign,
  onPause,
  onResume,
}) => {
  const [isRunning, setIsRunning] = useState(
    campaign.status?.toLowerCase() !== "paused"
  );

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
      onPause?.();
    } else {
      setIsRunning(true);
      onResume?.();
    }
  };

  return (
    <Stack gap={4} align="center" className={classes.simpleCard}>
      <Text size="xs" c="dimmed" mb={2}>
        Campaign
      </Text>

      <Group gap={8} align="center">
        <Text fw={700} size="lg" className={classes.campaignName}>
          {campaign.name}
        </Text>
      </Group>

      <Group gap="sm" align="center">
        <Badge
          variant="light"
          color="gray"
          size="md"
          radius="xl"
          p="md"
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
          style={{ gap: 4, fontWeight: 500, alignContent: "center" }}
        >
          {campaign.type.charAt(0) + campaign.type.slice(1).toLowerCase()}
        </Badge>

        <Button
          variant={isRunning ? "light" : "filled"}
          color={isRunning ? "red" : "green"}
          size="sm"
          leftSection={
            isRunning ? (
              <IconPlayerPause size={14} />
            ) : (
              <IconPlayerPlay size={14} />
            )
          }
          onClick={handleToggle}
          className={classes.toggleButton}
        >
          {isRunning ? "Pause" : "Resume"}
        </Button>
      </Group>
    </Stack>
  );
};

export default CampaignOverview;
