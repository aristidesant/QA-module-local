import axios from "axios";
import type { Scheduler } from "~/models/SchedulerModel";

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
 * Scheduler API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const schedulerApi = (authHeader: Record<string, string>) => {
  return {
    // GET all schedules for a campaign
    getCampaignSchedules: async (campaignId: string | number) => {
      const response = await axios.get<Scheduler[]>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules`,
        {
          headers: authHeader,
        }
      );
      return response.data;
    },

    // GET active scheduler for a campaign
    getCampaignActiveScheduler: async (campaignId: string | number) => {
      const response = await axios.get<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/active`,
        {
          headers: authHeader,
        }
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
        { status },
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
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
        {},
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
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
        scheduleData,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // GET schedule by ID
    getScheduleById: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.get<Scheduler>(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`,
        {
          headers: authHeader,
        }
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
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`,
        scheduleData,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },

    // DELETE schedule
    deleteSchedule: async (
      campaignId: string | number,
      scheduleId: string | number
    ) => {
      const response = await axios.delete(
        `${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`,
        {
          headers: authHeader,
        }
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
          headers: authHeader,
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
        {},
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  };
};

export default schedulerApi;
