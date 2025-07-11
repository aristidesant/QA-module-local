import React from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import styles from "./WorkingHoursHeader.module.css";

interface WorkingHoursHeaderProps {
  title?: string;
  description?: string;
}

export const WorkingHoursHeader: React.FC<WorkingHoursHeaderProps> = ({
  title = "Working Hours",
  description = "Define the days and time ranges during which your agents are allowed to make calls.",
}) => {
  return (
    <Box className={styles.header}>
      <Group gap="xs" mb={4}>
        <IconClock size={20} className={styles.icon} />
        <Text fw={500} size="md" className={styles.title}>
          {title}
        </Text>
      </Group>

      <Text size="sm" c="dimmed" className={styles.description}>
        {description}
      </Text>
    </Box>
  );
};
