import React from "react";
import { Stack, Text, Divider } from "@mantine/core";
import { DayScheduleCard } from "./DayScheduleCard";
import { WorkingHoursHeader } from "./WorkingHoursHeader";
import { WorkingHoursSummary } from "./WorkingHoursSummary";
import { SchedulerCard } from "./SchedulerCard";
import styles from "./ParametersSection.module.css";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { useCampaignSchedules } from "~/queries/schedulerQueries";
import type { Scheduler } from "~/models/SchedulerModel";

interface DaySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

interface ParametersSectionProps {
  workingHours: Record<string, DaySchedule>;
  onChange: (day: string, field: keyof DaySchedule, value: any) => void;
  onCopyToAll: (day: string) => void;
  onSchedulerUpdate?: (scheduler: Scheduler) => void;
}

export const ParametersSection: React.FC<ParametersSectionProps> = ({
  workingHours,
  onChange,
  onCopyToAll,
  onSchedulerUpdate,
}) => {
  const { selectedCampaign } = useCampaignsStore((state) => state);
  const { data: campaignSchedule, refetch: reloadCampaignSchedule } =
    useCampaignSchedules(selectedCampaign?.id);

  const handleSchedulerUpdate = (updatedScheduler: Scheduler) => {
    onSchedulerUpdate?.(updatedScheduler);
    reloadCampaignSchedule();
  };

  const handleSchedulerDelete = (schedulerId: number) => {
    reloadCampaignSchedule();
  };

  const handleSchedulerActivate = (schedulerId: number) => {
    reloadCampaignSchedule();
  };

  const handleSchedulerDeactivate = (schedulerId: number) => {
    reloadCampaignSchedule();
  };

  return (
    <Stack gap="md" className={styles.workingHoursContainer}>
      {/* Schedulers Section */}
      {campaignSchedule && campaignSchedule.length > 0 && (
        <>
          <Stack gap="sm">
            {campaignSchedule.map((scheduler) => (
              <SchedulerCard
                key={scheduler.id}
                scheduler={scheduler}
                campaignId={selectedCampaign?.id!}
                onUpdate={handleSchedulerUpdate}
                onDelete={handleSchedulerDelete}
                onActivate={handleSchedulerActivate}
                onDeactivate={handleSchedulerDeactivate}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default ParametersSection;
