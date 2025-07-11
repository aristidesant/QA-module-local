import React from 'react';
import { Box, Group, Text, Badge } from '@mantine/core';
import { IconClock, IconCalendarTime } from '@tabler/icons-react';
import styles from './CallsOverview.module.css';

export interface CallsOverviewProps {
  callsPerHour: number;
  daysToComplete?: number;
}

export const CallsOverview: React.FC<CallsOverviewProps> = ({
  callsPerHour = 235,
  daysToComplete = 4,
}) => {
  return (
    <div className={styles.container}>
      {/* Calls per hour card */}
      <div className={styles.card}>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="xs">
              <span className={styles.iconWrapper}>
                <IconClock size={16} />
              </span>
              <Text className={styles.title}>
                Calls per hour
              </Text>
            </Group>
            <Text className={styles.subtitle} ml={24}>
              Hourly distribution of daily call capacity
            </Text>
          </Box>
          <Box>
            <Text className={styles.value}>
              {callsPerHour}
            </Text>
            <Text className={styles.subtitle} ta="right">
              Calls per hour
            </Text>
          </Box>
        </Group>
      </div>

      {/* Estimated completion time card */}
      <div className={styles.card}>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text className={styles.title}>
              Estimated completion time
            </Text>
            <Text className={styles.subtitle}>
              Projected timeline based on current capacity
            </Text>
          </Box>
          <div className={styles.iconContainer}>
            <IconCalendarTime size={20} stroke={1.5} />
          </div>
        </Group>
        <Group align="flex-end" gap={5} mt="md">
          <Text className={styles.value}>
            {daysToComplete}
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
