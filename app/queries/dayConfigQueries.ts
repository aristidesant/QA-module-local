import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayConfigApi from "~/api/dayConfigApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { DayConfig } from "~/models/SchedulerModel";

interface GetScheduleDayConfigsParams {
  campaignId: string | number | undefined;
  scheduleId: string | number | undefined;
  enabled?: boolean;
}

interface GetDayConfigByIdParams {
  campaignId: string | number | undefined;
  dayConfigId: string | number | undefined;
  enabled?: boolean;
}

interface BulkUpdateDayConfigsParams {
  campaignId: string | number;
  dayConfigs: DayConfig[];
}

/**
 * Hook to fetch all day configs for a schedule
 */
export function useScheduleDayConfigs({
  campaignId,
  scheduleId,
  enabled = true,
}: GetScheduleDayConfigsParams) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<DayConfig[], Error>({
    queryKey: ["scheduleDayConfigs", campaignId, scheduleId],
    queryFn: async () => {
      if (!campaignId || !scheduleId) {
        return [];
      }
      const api = dayConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getScheduleDayConfigs(campaignId, scheduleId);
    },
    enabled: !!campaignId && !!scheduleId && enabled,
  });
}

/**
 * Hook to fetch a single day config by ID
 */
export function useDayConfigById({
  campaignId,
  dayConfigId,
  enabled = true,
}: GetDayConfigByIdParams) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<DayConfig | null, Error>({
    queryKey: ["dayConfig", campaignId, dayConfigId],
    queryFn: async () => {
      if (!campaignId || !dayConfigId) {
        return null;
      }
      const api = dayConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getDayConfigById(campaignId, dayConfigId);
    },
    enabled: !!campaignId && !!dayConfigId && enabled,
  });
}

/**
 * Mutation hook for bulk updating day configs
 */
export function useBulkUpdateDayConfigs() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({
      campaignId,
      dayConfigs,
    }: BulkUpdateDayConfigsParams) => {
      const api = dayConfigApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.bulkUpdateDayConfigs(campaignId, dayConfigs);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["scheduleDayConfigs", variables.campaignId],
      });
    },
  });
}
