import React, { use } from "react";
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
  // Extract campaignId and dayConfigId from dayConfig
  const campaignId = selectedCampaign?.id;
  const dayConfigId = dayConfig?.id;

  // Fetch hour configs for this day config
  const {
    data: hourConfigs,
    isLoading,
    isFetching,
  } = useDayConfigHourConfigs({
    campaignId,
    dayConfigId,
    enabled: !!campaignId && !!dayConfigId,
  });

  // Form initialization
  const form = useForm<{ time: HourConfig[] }>({
    initialValues: {
      time: hourConfigs || [],
    },
  });

  // Update form values when hourConfigs change
  React.useEffect(() => {
    if (hourConfigs) {
      form.setValues({ time: hourConfigs });
    }
  }, [hourConfigs]);

  // Handler to update slot capacity
  const onTimeSlotChange = (index: number, value: number) => {
    const updatedTime = form.values.time.map((slot, i) =>
      i === index ? { ...slot, capacity: String(value) } : slot
    );
    form.setValues({ time: updatedTime });
  };

  // Calculate total calls
  const totalCalls = form.values.time.reduce(
    (acc, slot) => acc + (slot.capacity ? Number(slot.capacity) : 0),
    0
  );

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
          <Text className={styles.dayLabel}>{dayConfig?.dayOfWeek}</Text>
          <Text className={styles.subtitle}>
            Distribute your daily call capacity by hour
          </Text>
        </Box>

        <Stack gap={"sm"} className={styles.cardsStack}>
          {form.values?.time.map((slot, index) => (
            <Card key={index} radius="md" shadow={undefined}>
              <Flex justify="space-between" align="center">
                <Text className={styles.timeLabel}>{slot.hour}</Text>
                <Group gap="xs" className={styles.sliderGroup}>
                  <Slider
                    value={Number(form.values.time[index]?.capacity) || 0}
                    className={styles.slider}
                    thumbSize={14}
                    size="md"
                    color="blue"
                    min={0}
                    max={120}
                    label={`${form.values.time[index]?.capacity}`}
                    onChange={(val) => onTimeSlotChange(index, val)}
                  />
                  <Text className={styles.callsLabel}>
                    Calls
                    <br />
                    {form.values.time[index]?.capacity}
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
