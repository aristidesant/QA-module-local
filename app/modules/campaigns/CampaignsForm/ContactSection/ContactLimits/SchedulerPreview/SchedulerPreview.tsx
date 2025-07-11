import { Box, Flex, Group, Text, Badge } from "@mantine/core";
import { IconCalendarEvent, IconClock } from "@tabler/icons-react";
import type { Scheduler } from "~/models/SchedulerModel";
import styles from "./SchedulerPreview.module.css";

interface SchedulerPreviewProps {
  scheduler?: Scheduler;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "green";
    case "paused":
      return "yellow";
    case "completed":
      return "blue";
    case "draft":
      return "gray";
    default:
      return "gray";
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Format time range for display
const formatTimeRange = (scheduler: Scheduler | undefined) => {
  if (!scheduler || !scheduler.dayConfigs) return "No schedule information";
  // Get active days
  const activeDays = scheduler.dayConfigs
    .filter(day => day.isActive)
    .map(day => day.dayOfWeek.substring(0, 1).toUpperCase())
    .join("-");
  
  // If no active days, return default message
  if (!activeDays) return "No active days";
  
  // Get first and last time range from any active day
  const timeRanges = scheduler.dayConfigs
    .filter(day => day.isActive && day.timeRanges.length > 0)
    .flatMap(day => day.timeRanges);
  
  if (timeRanges.length === 0) return `${activeDays} (No time ranges)`;
  
  // Get earliest start time and latest end time
  const startTimes = timeRanges.map(tr => tr.startTime);
  const endTimes = timeRanges.map(tr => tr.endTime);
  
  const earliestStart = startTimes.sort()[0];
  const latestEnd = endTimes.sort().reverse()[0];
  
  // Format times (convert from 24h to 12h format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };
  
  return `${activeDays} ${formatTime(earliestStart)} - ${formatTime(latestEnd)}`;
};

export function SchedulerPreview({ scheduler, onClick }: SchedulerPreviewProps) {
  // If no scheduler is provided, show a fallback message
  if (!scheduler) {
    return (
      <Box 
        className={styles.schedulerPreview}
        p="md"
      >
        <Flex justify="center" align="center">
          <Text size="sm" c="dimmed">
            Unable to display scheduler information
          </Text>
        </Flex>
      </Box>
    );
  }
  
  return (
    <Box 
      className={`${styles.schedulerPreview} ${onClick ? styles.clickable : ''}`}
      p="md"
      onClick={onClick}
    >
      <Flex justify="space-between" align="center">
        <Flex direction="column" gap={4}>
          <Group gap="xs" align="center">
            <IconCalendarEvent size={16} stroke={1.5} color="var(--mantine-color-blue-6)" />
            <Text fw={500} size="sm" truncate>
              {scheduler.name}
            </Text>
            <Badge 
              size="xs" 
              color={getStatusColor(scheduler.status)}
              variant="light"
            >
              {formatStatus(scheduler.status)}
            </Badge>
          </Group>
          
          <Group gap="xs" align="center">
            <IconClock size={14} stroke={1.5} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed" truncate>
              {formatTimeRange(scheduler)}
              {scheduler.callsPerHour && ` • ${scheduler.callsPerHour} calls/hour`}
            </Text>
          </Group>
        </Flex>
      </Flex>
    </Box>
  );
}
