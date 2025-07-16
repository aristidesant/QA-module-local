import React, { useEffect, useState } from "react";
import { Box, Group, Switch, Text, Flex, Stack } from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { IconClockOff } from "@tabler/icons-react";
import styles from "./DayScheduleCard.module.css";
import { useSchedulerFormContext } from "../SchedulerCard/schedulerFormProvider";
import { useCampaignsStore } from "~/stores/campaignsStore";
import DayTimeDistribution from "./DayTimeDistribution";

const formatDayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

export const DayScheduleCard: React.FC = () => {
  const { setRightComponent } = useCampaignsStore((state) => state);
  const form = useSchedulerFormContext();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    console.log("[DayScheduleCard] Mounted. Initial form values:", form.values);
  }, []);

  useEffect(() => {
    console.log(
      "[DayScheduleCard] form.values.dayConfigs changed:",
      form.values.dayConfigs
    );
  }, [form.values.dayConfigs]);

  return (
    <Stack gap="xs">
      {form.values.dayConfigs?.map((day, index) => {
        const isActive = day.isActive;
        const isSelected = selectedDay === day.dayOfWeek;

        return (
          <Box
            key={index}
            className={`${styles.dayRow} ${
              isSelected ? styles.highlighted : ""
            } ${styles.selectable}`}
            onClick={() => {
              console.log(`[DayScheduleCard] Clicked day row:`, day.dayOfWeek);
              setSelectedDay(day.dayOfWeek);
              setRightComponent?.(<DayTimeDistribution dayConfig={day} />);
            }}
          >
            <Flex justify="space-between" align="center">
              <Group gap="xs" align="center" flex={1}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Switch
                    className={styles.daySwitch}
                    size="md"
                    checked={isActive}
                    onChange={(e) => {
                      e.stopPropagation();

                      form.setFieldValue(
                        `dayConfigs.${index}.isActive`,
                        !isActive
                      );
                    }}
                  />
                </div>
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
                    value={form.values.dayConfigs?.[index].startHour}
                    onChange={(value) => {
                      form.setFieldValue(
                        `dayConfigs.${index}.startHour`,
                        value
                      );
                    }}
                  />
                  <TimePicker
                    size="md"
                    format="12h"
                    withDropdown
                    variant="filled"
                    leftSection="To"
                    value={form.values.dayConfigs?.[index].endHour}
                    onChange={(value) => {
                      form.setFieldValue(`dayConfigs.${index}.endHour`, value);
                    }}
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
