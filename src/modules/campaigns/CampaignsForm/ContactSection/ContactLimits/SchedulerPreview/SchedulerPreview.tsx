import { Box, Flex, Group, Text, Badge } from "@mantine/core";
import { IconCalendarEvent, IconClock } from "@tabler/icons-react";
import type { Scheduler } from "~/models/SchedulerModel";
import styles from "./SchedulerPreview.module.css";

interface SchedulerPreviewProps {
  scheduler?: Scheduler;
  onClick?: () => void;
}

/**
 * Returns Mantine color for scheduler status
 */
const getStatusColor = (status: string): string => {
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

/**
 * Formats scheduler status for display
 */
const formatStatus = (status: string): string => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Formats scheduler time range for display
 */
const formatTimeRange = (scheduler?: Scheduler): string => {
  if (!scheduler || !Array.isArray(scheduler.dayConfigs))
    return "No schedule information";

  // Get active days
  const activeDaysArr = scheduler.dayConfigs.filter((day) => day.isActive);
  const activeDays = activeDaysArr
    .map((day) => day.dayOfWeek.charAt(0).toUpperCase())
    .join("-");
  if (!activeDays) return "No active days";

  // Get all startHour and endHour from active days
  const startHours = activeDaysArr.map((day) => day.startHour).filter(Boolean);
  const endHours = activeDaysArr.map((day) => day.endHour).filter(Boolean);

  if (startHours.length === 0 || endHours.length === 0)
    return `${activeDays} (No time ranges)`;

  // Get earliest start and latest end
  const earliestStart = startHours.sort()[0];
  const latestEnd = endHours.sort().reverse()[0];

  /**
   * Converts 24h time string (HH:mm:ss) to 12h format
   */
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  return `${activeDays} ${formatTime(earliestStart)} - ${formatTime(
    latestEnd
  )}`;
};

export function SchedulerPreview({
  scheduler,
  onClick,
}: SchedulerPreviewProps) {
  // If no scheduler is provided, show a fallback message
  if (!scheduler) {
    return (
      <Box className={styles.schedulerPreview} p="md">
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
      className={`${styles.schedulerPreview} ${
        onClick ? styles.clickable : ""
      }`}
      p="md"
      onClick={onClick}
    >
      <Flex justify="space-between" align="center">
        <Flex direction="column" gap={4}>
          <Group gap="xs" align="center">
            <IconCalendarEvent
              size={16}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
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
            <IconClock
              size={14}
              stroke={1.5}
              color="var(--mantine-color-gray-6)"
            />
            <Text size="xs" c="dimmed" truncate>
              {formatTimeRange(scheduler)}
              {scheduler.callsPerHour &&
                ` • ${scheduler.callsPerHour} calls/hour`}
            </Text>
          </Group>
        </Flex>
      </Flex>
    </Box>
  );
}
