import React from "react";
import { Card, Group, Stack, Button } from "@mantine/core";
import { IconEdit, IconDeviceFloppy } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Scheduler } from "~/models/SchedulerModel";
import {
  useUpdateSchedule,
  useActivateSchedule,
  useDeactivateSchedule,
} from "~/queries/schedulerQueries";
import styles from "./SchedulerCard.module.css";
import { DayScheduleCard } from "../DayScheduleCard";
import CallsOverview from "../CallsOverview";
import ScheduleHeader from "./ScheduleHeader";
import { ActiveContactListView } from "../../ContactSection/ActiveContactList/ActiveContactListView";
import CapacityCall from "../CapacityCall/CapacityCall";
import {
  SchedulerFormProvider,
  useSchedulerFormInit,
} from "./schedulerFormProvider";

export interface SchedulerCardProps {
  scheduler: Scheduler;
  campaignId: string | number;
  onUpdate?: (updatedScheduler: Scheduler) => void;
  onDelete?: (schedulerId: number) => void;
  onActivate?: (schedulerId: number) => void;
  onDeactivate?: (schedulerId: number) => void;
}

export const SchedulerCard: React.FC<SchedulerCardProps> = ({
  scheduler,
  campaignId,
  onUpdate,
  onDelete,
  onActivate,
  onDeactivate,
}) => {
  const [opened, { toggle, open, close }] = useDisclosure(false);
  const isActive = scheduler?.status === "active" || true;

  // Initialize API mutations
  const activateScheduleMutation = useActivateSchedule();
  const deactivateScheduleMutation = useDeactivateSchedule();
  const updateScheduleMutation = useUpdateSchedule();

  // Initialize form
  const form = useSchedulerFormInit(scheduler);

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      if (isActive) {
        await deactivateScheduleMutation.mutateAsync({
          campaignId,
          scheduleId: scheduler.id,
        });
        onDeactivate?.(scheduler.id);
      } else {
        await activateScheduleMutation.mutateAsync({
          campaignId,
          scheduleId: scheduler.id,
        });
        onActivate?.(scheduler.id);
      }
    } catch (error) {
      console.error("Failed to toggle scheduler status:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: Partial<Scheduler>) => {
    try {
      // Validate form data if needed
      const validation = form.validate();
      if (validation.hasErrors) {
        return; // Stop submission if validation fails
      }

      // Execute the mutation
      await updateScheduleMutation.mutateAsync({
        campaignId,
        scheduleId: scheduler.id,
        scheduleData: values,
      });

      // Call onUpdate callback with updated scheduler
      onUpdate?.({
        ...scheduler,
        ...values,
      } as Scheduler);

      // Close the form
      close();
    } catch (error) {
      console.error("Failed to update scheduler:", error);
    }
  };

  // Format time range for display
  const formatTimeRange = () => {
    return "L - V 9:00 am to 5:30 pm";
  };

  return (
    <Card withBorder p="xl" radius="md">
      <Stack gap="lg">
        {/* Schedule Header */}
        <ScheduleHeader
          isActive={isActive}
          timeRangeText={formatTimeRange()}
          onChange={handleToggleStatus}
          onEdit={() => toggle()}
          onDelete={() => onDelete?.(scheduler.id)}
        />
        {opened && (
          <SchedulerFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                {/* Capacity Call Section */}
                <CapacityCall agentsAssigned={10} />

                {/* Calls per hour section and Estimated completion time */}
                <CallsOverview
                  callsPerHour={form.values.callsPerHour || 40}
                  daysToComplete={form.values.estimatedCompletionDays || 4}
                />

                {/* Day Schedule Card */}
                <DayScheduleCard />

                {/* Active Contact List */}
                <ActiveContactListView
                  scheduleContactGroups={scheduler.scheduleContactGroups}
                  onUpdateComplete={() => {}}
                  campaignId={campaignId}
                />

                {/* Update Schedule Button */}
                <Group justify="flex-end">
                  <Button
                    variant="outline"
                    leftSection={<IconEdit size={16} />}
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={16} />}
                    loading={updateScheduleMutation.isPending}
                    className={styles.updateButton}
                  >
                    Update Schedule
                  </Button>
                </Group>
              </Stack>
            </form>
          </SchedulerFormProvider>
        )}
      </Stack>
    </Card>
  );
};
