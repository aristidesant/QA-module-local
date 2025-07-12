import React from "react";
import {
  Box,
  Text,
  Slider,
  Stack,
  Group,
  Flex,
  Paper,
  Card,
} from "@mantine/core";
import styles from "./DayTimeDistribution.module.css";
import type { DayConfig } from "~/models/SchedulerModel";

interface TimeSlot {
  time: string;
  percentage: number;
  calls: number;
}

interface DayTimeDistributionProps {
  dayConfig?: DayConfig;
  timeSlots?: TimeSlot[];
  totalCalls?: number;
  onTimeSlotChange?: (index: number, newPercentage: number) => void;
}

const DayTimeDistribution: React.FC<DayTimeDistributionProps> = ({
  timeSlots = [
    { time: "9:00 AM", percentage: 100, calls: 222 },
    { time: "10:00 AM", percentage: 120, calls: 266 },
    { time: "11:00 AM", percentage: 100, calls: 222 },
    { time: "12:00 PM", percentage: 50, calls: 111 },
    { time: "1:00 PM", percentage: 100, calls: 222 },
    { time: "2:00 PM", percentage: 20, calls: 266 },
    { time: "3:00 PM", percentage: 100, calls: 222 },
    { time: "4:00 PM", percentage: 100, calls: 222 },
    { time: "5:00 PM", percentage: 100, calls: 222 },
    { time: "5:30 PM", percentage: 100, calls: 222 },
  ],
  totalCalls = 2000,
  onTimeSlotChange,
  dayConfig,
}) => {
  console.log({ dayConfig });
  return (
    <Stack className={styles.container}>
      <Box className={styles.header}>
        <Text className={styles.dayLabel}>{dayConfig?.dayOfWeek}</Text>
        <Text className={styles.subtitle}>
          Distribute your daily call capacity by hour
        </Text>
      </Box>

      <Stack gap={"sm"} className={styles.cardsStack}>
        {timeSlots.map((slot, index) => (
          <Card key={index} radius="md" shadow={undefined}>
            <Flex justify="space-between" align="center">
              <Text className={styles.timeLabel}>{slot.time}</Text>
              <Group gap="xs" className={styles.sliderGroup}>
                <Slider
                  value={slot.percentage}
                  className={styles.slider}
                  thumbSize={14}
                  size="md"
                  color="blue"
                  min={0}
                  max={120}
                  label={`${slot.percentage}%`}
                  onChange={(val) => onTimeSlotChange?.(index, val)}
                />
                <Text className={styles.callsLabel}>
                  Calls
                  <br />
                  {slot.calls}
                </Text>
              </Group>
            </Flex>
          </Card>
        ))}
      </Stack>

      <Paper
        className={styles.totalCard}
        radius="md"
        withBorder
        shadow={undefined}
        data-no-shadow
      >
        <Flex justify="space-between" align="center">
          <Text className={styles.totalLabel}>Total</Text>
          <Text className={styles.totalCalls}>
            {totalCalls.toLocaleString()} calls
          </Text>
        </Flex>
      </Paper>
    </Stack>
  );
};

export default DayTimeDistribution;
