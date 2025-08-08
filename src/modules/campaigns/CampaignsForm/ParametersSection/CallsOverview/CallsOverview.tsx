import React from "react";
import { Box, Group, Text } from "@mantine/core";
import { IconClock, IconCalendarTime } from "@tabler/icons-react";
import styles from "./CallsOverview.module.css";
import { useSchedulerFormContext } from "../SchedulerCard/schedulerFormProvider";

export const CallsOverview: React.FC = () => {
  const form = useSchedulerFormContext();
  return (
    <div className={styles.container}>
      {/* Calls per hour card */}
      <div className={styles.card}>
        <Group justify="space-between" align="center">
          <Box>
            <Group gap={8} align="center">
              <span className={styles.iconWrapper}>
                <IconClock size={18} />
              </span>
              <Text className={styles.title}>Calls per hour</Text>
            </Group>
            <Text className={styles.subtitle} ml={26}>
              Hourly distribution of daily call capacity
            </Text>
          </Box>
          <Box style={{ textAlign: "right" }}>
            <Text className={styles.value}>{form.values?.callsPerHour}</Text>
            <Text className={styles.subtitle}>Calls per hour</Text>
          </Box>
        </Group>
      </div>

      {/* Estimated completion time card */}
      <div className={styles.card}>
        <Group justify="space-between" align="center">
          <Box>
            <Text className={styles.title}>Estimated completion time</Text>
            <Text className={styles.subtitle}>
              Projected timeline based on current capacity
            </Text>
          </Box>
          <div className={styles.iconContainer}>
            <IconCalendarTime size={22} stroke={1.5} />
          </div>
        </Group>
        <Group align="flex-end" gap={6} mt={12}>
          <Text className={styles.value}>
            {form.values?.estimatedCompletionDays}
          </Text>
          <Text className={styles.daysLabel} mb={4}>
            days
          </Text>
        </Group>
      </div>
    </div>
  );
};

export default CallsOverview;
