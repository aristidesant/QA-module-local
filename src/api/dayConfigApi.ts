import axios from "axios";
import type { DayConfig } from "~/models/SchedulerModel";
import { DEFAULT_API_URL } from "./config";

/**
 * DayConfig API client
 * Note: Authorization handled by global Axios interceptor.
 */
const dayConfigApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all day configs for a schedule
    getScheduleDayConfigs: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.get<DayConfig[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/day-configs`
      );
      return response.data;
    },

    // GET a single day config by ID
    getDayConfigById: async (
      campaignId: string | number,
      dayConfigId: string | number
    ) => {
      const response = await axios.get<DayConfig>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/day-configs/${dayConfigId}`
      );
      return response.data;
    },

    // PATCH bulk update day configs
    bulkUpdateDayConfigs: async (
      campaignId: string | number,
      dayConfigs: DayConfig[]
    ) => {
      const response = await axios.patch<DayConfig[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/day-configs/bulk-update`,
        dayConfigs
      );
      return response.data;
    },
  };
};

export default dayConfigApi;
