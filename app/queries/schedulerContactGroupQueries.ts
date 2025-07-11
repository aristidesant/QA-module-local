import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import schedulerContactGroupApi from "~/api/schedulerContactGroupApi";
import type { UpdateSchedulerContactGroupPayload } from "~/api/schedulerContactGroupApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";

interface UpdateSchedulerContactGroupParams {
  id: string | number;
  payload: UpdateSchedulerContactGroupPayload;
}

/**
 * Mutation hook to update a scheduler contact group
 * @returns Mutation object with methods to update scheduler contact group
 */
/**
 * Query hook to get scheduler contact groups by campaign ID and schedule status
 * @param campaignId - The campaign ID
 * @param scheduleStatus - The schedule status
 * @returns Query object with scheduler contact groups data
 */
export function useSchedulerContactGroupsByCampaignAndStatus(
  campaignId: string | number | undefined,
  scheduleStatus: string | undefined,
  options = {}
) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery({
    queryKey: ["schedulerContactGroups", campaignId, scheduleStatus],
    queryFn: async () => {
      if (!campaignId || !scheduleStatus) return null;
      
      const api = schedulerContactGroupApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getSchedulerContactGroupsByCampaignAndStatus(campaignId, scheduleStatus);
    },
    enabled: !!campaignId && !!scheduleStatus && !!token?.token,
    ...options,
  });
}

export function useUpdateSchedulerContactGroup() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateSchedulerContactGroupParams) => {
      const api = schedulerContactGroupApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateSchedulerContactGroup(id, payload);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["campaignSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["campaignActiveScheduler"] });
      queryClient.invalidateQueries({ queryKey: ["schedulerContactGroups"] });
    },
  });
}
