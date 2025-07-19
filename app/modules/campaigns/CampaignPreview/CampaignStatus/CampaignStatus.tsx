import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Box,
  Progress,
  ThemeIcon,
} from "@mantine/core";
import { IconBolt } from "@tabler/icons-react";
import styles from "./CampaignStatus.module.css";

interface CampaignStatusProps {
  status?: string;
  description?: string;
  timeLeft?: string;
  progress?: number; // 0-100
}

const CampaignStatus: React.FC<CampaignStatusProps> = ({
  status = "Campaign Running",
  description = "The campaign is currently active and executing calls.",
  timeLeft = "3h:12min",
  progress = 70,
}) => {
  return (
    <Stack gap="xs">
      <Card radius="md" padding="md" withBorder className={styles.card}>
        <Group align="center" wrap="nowrap" gap={16}>
          <ThemeIcon
            radius="xl"
            size={40}
            color="green"
            variant="light"
            className={styles.icon}
          >
            <IconBolt size={24} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz="md" className={styles.statusTitle}>
              {status}
            </Text>
            <Text fz="sm" c="gray.6" className={styles.statusDesc}>
              {description}
            </Text>
          </Box>
        </Group>
      </Card>
      <Card radius="md" padding="md" withBorder className={styles.timeCard}>
        <Group justify="space-between" className={styles.timeHeader}>
          <Text fw={500} fz="sm">
            Today's time left
          </Text>
          <Text fw={500} fz="sm">
            {timeLeft}
          </Text>
        </Group>
        <Progress
          value={progress}
          size="md"
          radius="xl"
          color="blue"
          className={styles.progressBar}
        />
      </Card>
    </Stack>
  );
};

export default CampaignStatus;
