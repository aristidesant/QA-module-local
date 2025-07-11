import { useCampaignsStore } from "~/stores/campaignsStore";
import { ActiveContactListView } from "./ActiveContactListView";
import { useSchedulerContactGroupsByCampaignAndStatus } from "~/queries/schedulerContactGroupQueries";

export const ActiveContactListContainer = () => {
  const { selectedCampaign } = useCampaignsStore();

  const { data: schedules, refetch: reloadCampaignSchedules } =
    useSchedulerContactGroupsByCampaignAndStatus(
      selectedCampaign?.id,
      "active"
    );

  return (
    <ActiveContactListView
      key={`contact-list-${selectedCampaign?.id}`}
      scheduleContactGroups={schedules || []}
      campaignId={selectedCampaign?.id}
      onUpdateComplete={reloadCampaignSchedules}
    />
  );
};
