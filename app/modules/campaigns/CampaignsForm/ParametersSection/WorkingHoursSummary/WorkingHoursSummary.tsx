import React from "react";
import { Box, Text, Group } from "@mantine/core";
import { IconClock, IconCalendarClock } from "@tabler/icons-react";
import styles from "./WorkingHoursSummary.module.css";

interface DaySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

interface WorkingHoursSummaryProps {
  workingHours: Record<string, DaySchedule>;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const formatDayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1, 3);
};

export const WorkingHoursSummary: React.FC<WorkingHoursSummaryProps> = ({
  workingHours,
}) => {
  // Get active days
  const activeDays = DAYS.filter((day) => workingHours[day]?.enabled);

  // Get time range (assuming same time for all active days)
  const getTimeRange = (): string => {
    if (activeDays.length === 0) return "No active days";

    const firstActiveDay = activeDays[0];
    const schedule = workingHours[firstActiveDay];

    if (!schedule?.from || !schedule?.to) return "No time range set";

    return `${schedule.from} - ${schedule.to}`;
  };

  // Format active days text
  const getActiveDaysText = (): string => {
    if (activeDays.length === 0) return "No active days";

    const dayNames = activeDays.map(formatDayName);

    if (dayNames.length === 7) return "Every day";

    if (
      dayNames.length === 5 &&
      !dayNames.includes("Sat") &&
      !dayNames.includes("Sun")
    ) {
      return "Weekdays";
    }

    if (
      dayNames.length === 2 &&
      dayNames.includes("Sat") &&
      dayNames.includes("Sun")
    ) {
      return "Weekends";
    }

    return dayNames.join(", ");
  };

  return (
    <Box className={styles.summary}>
      <Group gap={4} c="dimmed" align="center" mb={2}>
        <IconClock size={14} />
        <Text size="xs">{getTimeRange()}</Text>
      </Group>

      <Group gap={4} c="dimmed" align="center">
        <IconCalendarClock size={14} />
        <Text size="xs">{getActiveDaysText()}</Text>
      </Group>
    </Box>
  );
};
