import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayConfigApi from "~/api/dayConfigApi";
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
  return useQuery<DayConfig[], Error>({
    queryKey: ["scheduleDayConfigs", campaignId, scheduleId],
    queryFn: async () => {
      if (!campaignId || !scheduleId) {
        return [];
      }
      const api = dayConfigApi();
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
  return useQuery<DayConfig | null, Error>({
    queryKey: ["dayConfig", campaignId, dayConfigId],
    queryFn: async () => {
      if (!campaignId || !dayConfigId) {
        return null;
      }
      const api = dayConfigApi();
      return api.getDayConfigById(campaignId, dayConfigId);
    },
    enabled: !!campaignId && !!dayConfigId && enabled,
  });
}

/**
 * Mutation hook for bulk updating day configs
 */
export function useBulkUpdateDayConfigs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      dayConfigs,
    }: BulkUpdateDayConfigsParams) => {
      const api = dayConfigApi();
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
