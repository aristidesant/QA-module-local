import React from "react";
import { Stack, Text, Divider, LoadingOverlay } from "@mantine/core";
import { DayScheduleCard } from "./DayScheduleCard";
import { WorkingHoursHeader } from "./WorkingHoursHeader";
import { WorkingHoursSummary } from "./WorkingHoursSummary";
import { SchedulerCard } from "./SchedulerCard";
import styles from "./ParametersSection.module.css";
import { useCampaignsStore } from "~/stores/campaignsStore";
import { useCampaignSchedules } from "~/queries/schedulerQueries";
import type { Scheduler } from "~/models/SchedulerModel";
import AddScheduler from "./AddScheduler";

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
  const {
    data: campaignSchedule,
    refetch: reloadCampaignSchedule,
    isLoading: campaignScheduleLoading,
    isFetching: campaignScheduleFetching,
  } = useCampaignSchedules(selectedCampaign?.id);

  const handleReloading = () => {
    reloadCampaignSchedule();
  };

  return (
    <Stack gap="md">
      <LoadingOverlay
        visible={campaignScheduleLoading || campaignScheduleFetching}
      />
      {/* Schedulers Section */}
      {campaignSchedule && campaignSchedule.length > 0 && (
        <>
          <Stack gap="sm">
            {campaignSchedule.map((scheduler) => (
              <SchedulerCard
                scheduler={scheduler}
                campaignId={selectedCampaign?.id!}
                handleReload={handleReloading}
              />
            ))}
            <AddScheduler />
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default ParametersSection;
