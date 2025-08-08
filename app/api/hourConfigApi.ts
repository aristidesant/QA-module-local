import axios from "axios";
import type { HourConfig } from "~/models/SchedulerModel";

const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || process.env.API_URL;
  }
  if (typeof process !== "undefined") {
    return process.env.API_URL;
  }
  return undefined;
};

const DEFAULT_API_URL = getDefaultApiUrl() as string;

/**
 * HourConfig API client
 * Note: Authorization handled by global Axios interceptor.
 */
const hourConfigApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all hour configs for a day config
    getDayConfigHourConfigs: async (
      campaignId: string | number,
      dayConfigId: string | number
    ) => {
      const response = await axios.get<HourConfig[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/day-configs/${dayConfigId}/hour-configs`
      );
      return response.data;
    },

    // PATCH bulk update hour configs
    bulkUpdateHourConfigs: async (
      campaignId: string | number,
      hourConfigs: Array<{ id: number; capacity: number; isActive: boolean }>
    ) => {
      const response = await axios.patch<HourConfig[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/hour-configs/bulk-update`,
        { hourConfigs }
      );
      return response.data;
    },
  };
};

export default hourConfigApi;
