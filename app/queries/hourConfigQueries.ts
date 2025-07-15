import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import hourConfigApi from "~/api/hourConfigApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { HourConfig } from "~/models/SchedulerModel";

interface GetDayConfigHourConfigsParams {
  campaignId: string | number | undefined;
  dayConfigId: string | number | undefined;
  enabled?: boolean;
}

interface BulkUpdateHourConfigsParams {
  campaignId: string | number;
  hourConfigs: Array<{ id: number; capacity: number; isActive: boolean }>;
}

/**
 * Hook to fetch all hour configs for a day config
 */
export function useDayConfigHourConfigs({
  campaignId,
  dayConfigId,
  enabled = true,
}: GetDayConfigHourConfigsParams) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<HourConfig[], Error>({
    queryKey: ["dayConfigHourConfigs", campaignId, dayConfigId],
    queryFn: async () => {
      if (!campaignId || !dayConfigId) {
        return [];
      }
      const api = hourConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getDayConfigHourConfigs(campaignId, dayConfigId);
    },
    enabled: !!campaignId && !!dayConfigId && enabled,
  });
}

/**
 * Mutation hook for bulk updating hour configs
 */
export function useBulkUpdateHourConfigs() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({
      campaignId,
      hourConfigs,
    }: BulkUpdateHourConfigsParams) => {
      const api = hourConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.bulkUpdateHourConfigs(campaignId, hourConfigs);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["dayConfigHourConfigs", variables.campaignId],
      });
    },
  });
}
