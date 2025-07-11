import { createFormContext } from "@mantine/form";
import type { Scheduler } from "~/models/SchedulerModel";

// Create the form context
export const [
  SchedulerFormProvider,
  useSchedulerFormContext,
  useSchedulerForm,
] = createFormContext<Partial<Scheduler>>();

// Create a hook for initializing the scheduler form
export const useSchedulerFormInit = (scheduler: Scheduler) => {
  // Initialize form with scheduler data
  const form = useSchedulerForm({
    initialValues: {
      id: scheduler.id,
      name: scheduler.name || "",
      description: scheduler.description || "",
      campaignId:
        typeof scheduler.campaignId === "string"
          ? parseInt(scheduler.campaignId, 10)
          : scheduler.campaignId,
      status: scheduler.status || "",
      callsPerHour: scheduler.callsPerHour || 40,
      estimatedCompletionDays: scheduler.estimatedCompletionDays || 4,
      dayConfigs: scheduler.dayConfigs || [],
      scheduleContactGroups: scheduler.scheduleContactGroups || [],
    },
  });

  return form;
};
