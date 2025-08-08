import axios from "axios";
import type { Scheduler } from "~/models/SchedulerModel";
import { DEFAULT_API_URL } from "./config";

/**
 * Scheduler API client
 * Note: Authorization handled by global Axios interceptor.
 */
const schedulerApi = (_authHeader?: Record<string, string>) => {
  return {
    // GET all schedules for a campaign
    getCampaignSchedules: async (campaignId: string | number) => {
      const response = await axios.get<Scheduler[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules`
      );
      return response.data;
    },

    // POST create a predefined schedule for a campaign
    createPredefinedSchedule: async (
      campaignId: string | number,
      predefinedScheduleData: {
        name: string;
        description: string;
        campaignId: number;
      }
    ) => {
      const response = await axios.post<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/predefined`,
        predefinedScheduleData
      );
      return response.data;
    },

    // GET active scheduler for a campaign
    getCampaignActiveScheduler: async (campaignId: string | number) => {
      const response = await axios.get<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/active`
      );
      return response.data;
    },

    // PATCH update contact group status
    updateContactGroupStatus: async (
      groupId: string | number,
      status: "active" | "inactive" | "paused"
    ) => {
      const response = await axios.patch(
        `${DEFAULT_API_URL}/schedule-contact-groups/${groupId}/status`,
        { status }
      );
      return response.data;
    },

    // PATCH activate schedule for a campaign
    activateSchedule: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.patch(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/activate`,
        {}
      );
      return response.data;
    },

    // POST create a new schedule for a campaign
    createSchedule: async (
      campaignId: string | number,
      scheduleData: Partial<Scheduler>
    ) => {
      const response = await axios.post<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules`,
        scheduleData
      );
      return response.data;
    },

    // GET schedule by ID
    getScheduleById: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.get<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`
      );
      return response.data;
    },

    // PATCH update schedule
    updateSchedule: async (
      campaignId: string | number,
      scheduleId: string | number,
      scheduleData: Partial<Scheduler>
    ) => {
      const response = await axios.patch<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/with-day-configs`,
        scheduleData
      );
      return response.data;
    },

    // DELETE schedule
    deleteSchedule: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`
      );
      return response.data;
    },

    // GET schedule capacity
    getScheduleCapacity: async (
      campaignId: string | number,
      scheduleId: string | number,
      contactListSize: number
    ) => {
      const response = await axios.get(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/capacity`,
        {
          params: {
            contactListSize,
          },
        }
      );
      return response.data;
    },

    // PATCH deactivate schedule
    deactivateSchedule: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.patch(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/deactivate`,
        {}
      );
      return response.data;
    },
  };
};

export default schedulerApi;
