import React from "react";
import { Stack, Text, Switch, Group, Button, Box, Grid, rem } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconCopy, IconClockOff } from "@tabler/icons-react";
import styles from "./ParametersSection.module.css";

interface DaySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

interface ParametersSectionProps {
  workingHours: Record<string, DaySchedule>;
  onChange: (day: string, field: keyof DaySchedule, value: any) => void;
  onCopyToAll: (day: string) => void;
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
  return day.charAt(0).toUpperCase() + day.slice(1);
};

export const ParametersSection: React.FC<ParametersSectionProps> = ({
  workingHours,
  onChange,
  onCopyToAll,
}) => {
  return (
    <Stack gap="md" className={styles.workingHoursContainer}>
      {DAYS.map((day) => (
        <div key={day} className={styles.dayRow}>
          {/* Column 1: Day switch and name */}
          <div className={styles.dayColumn}>
            <Switch
              checked={workingHours[day]?.enabled ?? false}
              onChange={(e) =>
                onChange(day, "enabled", e.currentTarget.checked)
              }
              aria-label={`Toggle ${formatDayName(day)} schedule`}
              className={styles.daySwitch}
            />
            <Text fw={500} className={styles.dayText}>
              {formatDayName(day)}
            </Text>
          </div>

          {/* Column 2: Time inputs or closed state */}
          <div className={styles.timeColumn}>
            {workingHours[day]?.enabled ? (
              <Group gap="sm" className={styles.timeInputsContainer}>
                <TimeInput
                  value={workingHours[day]?.from || ""}
                  onChange={(e) =>
                    onChange(day, "from", e.currentTarget.value)
                  }
                  className={styles.timeInput}
                  size="sm"
                  variant="filled"
                  label="From"
                  labelProps={{ className: styles.timeLabel }}
                />
                <Text className={styles.timeSeparator}>to</Text>
                <TimeInput
                  value={workingHours[day]?.to || ""}
                  onChange={(e) =>
                    onChange(day, "to", e.currentTarget.value)
                  }
                  className={styles.timeInput}
                  size="sm"
                  variant="filled"
                  label="To"
                  labelProps={{ className: styles.timeLabel }}
                />
              </Group>
            ) : (
              <Box className={styles.closedBadge}>
                <IconClockOff size={16} />
                <Text size="sm">Closed</Text>
              </Box>
            )}
          </div>

          {/* Column 3: Copy button (only for Monday) */}
          <div className={styles.actionColumn}>
            {day === "monday" && (
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconCopy size={14} />}
                onClick={() => onCopyToAll(day)}
                className={styles.copyButton}
              >
                Copy to all days
              </Button>
            )}
          </div>
        </div>
      ))}
    </Stack>
  );
};

export default ParametersSection;
