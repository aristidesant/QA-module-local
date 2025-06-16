import React from "react";
import { Stack, Text, Switch, Group, Button, Box } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconCopy, IconMoon } from "@tabler/icons-react";
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
    <Stack gap="md">
      <div className={styles.workingHoursContainer}>
        {DAYS.map((day) => (
          <div key={day} className={styles.dayRow}>
            <Switch
              checked={workingHours[day]?.enabled ?? false}
              onChange={(e) =>
                onChange(day, "enabled", e.currentTarget.checked)
              }
              label={formatDayName(day)}
              className={styles.daySwitch}
            />

            {workingHours[day]?.enabled ? (
              <Group gap="xs">
                <TimeInput
                  value={workingHours[day]?.from || ""}
                  onChange={(e) =>
                    onChange(day, "from", e.currentTarget.value)
                  }
                  className={styles.timeInput}
                  size="sm"
                  variant="filled"
                />
                <Text>to</Text>
                <TimeInput
                  value={workingHours[day]?.to || ""}
                  onChange={(e) => onChange(day, "to", e.currentTarget.value)}
                  className={styles.timeInput}
                  size="sm"
                  variant="filled"
                />
                {day === "monday" && (
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconCopy size={14} />}
                    onClick={() => onCopyToAll(day)}
                  >
                    Copy to all days
                  </Button>
                )}
              </Group>
            ) : (
              <Box className={styles.closedBadge}>
                <IconMoon size={16} />
                <Text size="sm">Closed</Text>
              </Box>
            )}
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default ParametersSection;
