import React from "react";
import {
  Box,
  Group,
  Switch,
  Text,
  Flex,
  Stack,
} from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { IconClockOff } from "@tabler/icons-react";
import styles from "./DayScheduleCard.module.css";
import { useSchedulerFormContext } from "../SchedulerCard/schedulerFormProvider";
import type { DayConfig } from "~/models/SchedulerModel";


const formatDayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

export const DayScheduleCard: React.FC = () => {
  const form = useSchedulerFormContext();
  const displayDays: DayConfig[] = form.values.dayConfigs || []; // fetched from form context


  // Handle day toggle
  const handleDayToggle = (index: number) => {
    const updatedDays = [...displayDays];
    updatedDays[index] = {
      ...updatedDays[index],
      isActive: !updatedDays[index].isActive,
    };

    form.setFieldValue("dayConfigs", updatedDays);
  };

  // Handle time change
  const handleTimeChange = (
    index: number,
    timeType: "startTime" | "endTime",
    value: string
  ) => {
    // Add seconds to the time value if they're not already present
    const formattedValue =
      value && !value.includes(":00") ? `${value}:00` : value;

    const updatedDays = [...displayDays];
    if (
      updatedDays[index].timeRanges &&
      updatedDays[index].timeRanges.length > 0
    ) {
      updatedDays[index].timeRanges[0] = {
        ...updatedDays[index].timeRanges[0],
        [timeType]: formattedValue,
      };
    }

    form.setFieldValue("dayConfigs", updatedDays);
  };
  return (
    <Stack gap="xs">
      {displayDays.map((day, index) => {
        const isActive = day.isActive;
        const isHighlighted = day.dayOfWeek === "wednesday"; // Example for highlighted day

        return (
          <Box
            key={index}
            className={`${styles.dayRow} ${
              isHighlighted ? styles.highlighted : ""
            }`}
          >
            <Flex justify="space-between" align="center">
              <Group gap="xs" align="center" flex={1}>
                <Switch
                  className={styles.daySwitch}
                  size="md"
                  checked={isActive}
                  onChange={() => handleDayToggle(index)}
                />
                <Text className={styles.dayName}>
                  {formatDayName(day.dayOfWeek)}
                </Text>
              </Group>

              {isActive ? (
                <Group flex={2} gap="xs" grow>
                  <TimePicker
                    size="md"
                    withDropdown
                    format="12h"
                    variant="filled"
                    leftSection="From"
                    value={
                      day.timeRanges[0]?.startTime?.replace(":00", "") ||
                      "09:00"
                    }
                    onChange={(value) =>
                      handleTimeChange(index, "startTime", value || "")
                    }
                  />
                  <TimePicker
                    size="md"
                    format="12h"
                    withDropdown
                    variant="filled"
                    leftSection="To"
                    value={
                      day.timeRanges[0]?.endTime?.replace(":00", "") || "17:30"
                    }
                    onChange={(value) =>
                      handleTimeChange(index, "endTime", value || "")
                    }
                  />
                </Group>
              ) : (
                <Box flex={2} className={styles.closedBadge}>
                  <IconClockOff size={16} />
                  <Text size="sm">Closed</Text>
                </Box>
              )}
            </Flex>
          </Box>
        );
      })}
    </Stack>
  );
};
