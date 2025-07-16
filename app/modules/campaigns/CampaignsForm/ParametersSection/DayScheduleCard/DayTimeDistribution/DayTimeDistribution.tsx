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
  Button,
  LoadingOverlay,
  Tooltip,
} from "@mantine/core";
import styles from "./DayTimeDistribution.module.css";
import type { DayConfig, HourConfig } from "~/models/SchedulerModel";
import { useForm } from "@mantine/form";
import {
  useBulkUpdateHourConfigs,
  useDayConfigHourConfigs,
} from "~/queries/hourConfigQueries";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { IconDeviceFloppy } from "@tabler/icons-react";

interface DayTimeDistributionProps {
  dayConfig?: DayConfig;
}

const DayTimeDistribution: React.FC<DayTimeDistributionProps> = ({
  dayConfig,
}) => {
  const bulkUpdateMutation = useBulkUpdateHourConfigs();
  const { selectedCampaign } = useCampaignsStore((state) => state);
  const campaignId = selectedCampaign?.id;
  const dayConfigId = dayConfig?.id;

  const {
    data: hourConfigs,
    isLoading,
    isFetching,
  } = useDayConfigHourConfigs({
    campaignId,
    dayConfigId,
    enabled: !!campaignId && !!dayConfigId,
  });

  const form = useForm<{ time: HourConfig[] }>({
    initialValues: {
      time: hourConfigs || [],
    },
  });

  React.useEffect(() => {
    if (hourConfigs) {
      form.setValues({ time: hourConfigs });
    }
  }, [hourConfigs]);

  const onTimeSlotChange = (index: number, value: number) => {
    const updatedTime = form.values.time.map((slot, i) =>
      i === index ? { ...slot, capacity: String(Math.round(value)) } : slot
    );
    form.setValues({ time: updatedTime });
  };

  const totalCalls = form.values.time.reduce(
    (acc, slot) =>
      acc + (slot.capacity ? Math.round(Number(slot.capacity)) : 0),
    0
  );

  const formatHour12 = (hour: number | string) => {
    let h = typeof hour === "string" ? parseInt(hour, 10) : hour;
    if (isNaN(h)) return "";
    const suffix = h === 0 ? "AM" : h < 12 ? "AM" : "PM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12} ${suffix}`;
  };

  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <form
      style={{ position: "relative" }}
      onSubmit={form.onSubmit((values) => {
        if (!campaignId) return;
        const hourConfigs = values.time.map((slot) => ({
          id: slot.id,
          capacity: Number(slot.capacity),
          isActive: slot.isActive ?? true,
        }));
        bulkUpdateMutation.mutate({ campaignId, hourConfigs });
      })}
    >
      <LoadingOverlay
        visible={bulkUpdateMutation.isPending || isFetching || isLoading}
        zIndex={1000}
      />
      <Stack className={styles.container}>
        <Box className={styles.header}>
          <Text className={styles.dayLabel}>
            {capitalize(dayConfig?.dayOfWeek)}
          </Text>
          <Text className={styles.subtitle}>
            Distribute your daily call capacity by hour
          </Text>
        </Box>

        <Stack gap={32} className={styles.cardsStack}>
          {form.values?.time.map((slot, index) => (
            <Card key={index} radius="md" shadow={undefined}>
              <Flex justify="space-between" align="center">
                <Text className={styles.timeLabel}>
                  {formatHour12(slot.hour)}
                </Text>
                <Group gap="xs" className={styles.sliderGroup}>
                  <Tooltip
                    label={Math.round(Number(slot.capacity) || 0)}
                    withArrow
                    position="top"
                    withinPortal
                  >
                    <Slider
                      value={Number(slot.capacity) || 0}
                      className={styles.slider}
                      thumbSize={14}
                      styles={{
                        markLabel: {
                          display: "none",
                        },
                      }}
                      size="md"
                      color="blue"
                      min={0}
                      max={120}
                      onChange={(val: number) => onTimeSlotChange(index, val)}
                    />
                  </Tooltip>
                  <Text className={styles.callsLabel}>
                    Calls
                    <br />
                    {Math.round(Number(slot.capacity) || 0)}
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
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          type="submit"
          variant="light"
          color="blue"
        >
          Save Changes
        </Button>
      </Stack>
    </form>
  );
};

export default DayTimeDistribution;
