import React from "react";
import { Card, Group, Stack, Button, LoadingOverlay } from "@mantine/core";
import { IconEdit, IconDeviceFloppy } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Scheduler } from "~/models/SchedulerModel";
import {
  useUpdateSchedule,
  useActivateSchedule,
  useDeactivateSchedule,
  useDeleteSchedule,
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
import { modals } from "@mantine/modals";

export interface SchedulerCardProps {
  scheduler: Scheduler;
  campaignId: string | number;
  handleReload?: () => void;
}

export const SchedulerCard: React.FC<SchedulerCardProps> = ({
  scheduler,
  campaignId,
  handleReload,
}) => {
  const [opened, { toggle, open, close }] = useDisclosure(false);

  // Initialize API mutations
  const activateScheduleMutation = useActivateSchedule();
  const deactivateScheduleMutation = useDeactivateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  // Initialize form
  const form = useSchedulerFormInit(scheduler);
  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      if (scheduler.status === "active") {
        await deactivateScheduleMutation.mutateAsync({
          campaignId,
          scheduleId: scheduler.id,
        });
        handleReload?.();
      } else {
        await activateScheduleMutation.mutateAsync({
          campaignId,
          scheduleId: scheduler.id,
        });
        handleReload?.();
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
      handleReload?.();

      // Close the form
      close();
    } catch (error) {
      console.error("Failed to update scheduler:", error);
    }
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Schedule",
      children: "Are you sure you want to delete this schedule?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      onConfirm: async () => {
        try {
          await deleteScheduleMutation.mutateAsync({
            campaignId,
            scheduleId: scheduler.id,
          });
          handleReload?.();
        } catch (error) {
          console.error("Failed to delete scheduler:", error);
        }
      },
    });
  };

  return (
    <Card withBorder p="md" radius="md">
      <LoadingOverlay
        visible={
          updateScheduleMutation.isPending ||
          deleteScheduleMutation.isPending ||
          activateScheduleMutation.isPending ||
          deactivateScheduleMutation.isPending
        }
      />
      <Stack gap="lg">
        {/* Schedule Header */}
        <ScheduleHeader
          schedule={scheduler}
          onChange={handleToggleStatus}
          onEdit={() => toggle()}
          onDelete={() => handleDelete()}
        />
        {opened && (
          <SchedulerFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                {/* Capacity Call Section */}
                <CapacityCall agentsAssigned={10} />

                {/* Calls per hour section and Estimated completion time */}
                <CallsOverview
                  callsPerHour={Number(form.values.callsPerHour) || 40}
                  daysToComplete={
                    Number(form.values.estimatedCompletionDays) || 4
                  }
                />

                {/* Day Schedule Card */}
                <DayScheduleCard />

                {/* Active Contact List */}
                <ActiveContactListView
                  scheduleContactGroups={scheduler.scheduleContactGroups || []}
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
