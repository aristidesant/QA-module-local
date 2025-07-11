import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import schedulerApi from "~/api/schedulerApi";
import { getClientAuthorizationHeader } from "~/client-session";
import { useToken } from "~/components/RouteProtecter/RouteProtecter";
import type { Scheduler } from "~/models/SchedulerModel";

interface GetCampaignActiveSchedulerParams {
  campaignId: string | number | undefined;
  enabled?: boolean;
}

type ContactGroupStatus = "active" | "inactive" | "paused";

interface UpdateContactGroupStatusParams {
  groupId: string | number;
  status: ContactGroupStatus;
}

interface ActivateScheduleParams {
  campaignId: string | number;
  scheduleId: string | number;
}

interface CreateScheduleParams {
  campaignId: string | number;
  scheduleData: Partial<Scheduler>;
}

interface UpdateScheduleParams {
  campaignId: string | number;
  scheduleId: string | number;
  scheduleData: Partial<Scheduler>;
}

interface DeleteScheduleParams {
  campaignId: string | number;
  scheduleId: string | number;
}

interface GetScheduleCapacityParams {
  campaignId: string | number;
  scheduleId: string | number;
  contactListSize: number;
}

interface DeactivateScheduleParams {
  campaignId: string | number;
  scheduleId: string | number;
}

/**
 * Hook to fetch schedules for a specific campaign
 * @param campaignId - The ID of the campaign to fetch schedules for
 * @returns Query result containing an array of Scheduler objects
 */
export function useCampaignSchedules(campaignId: string | number | undefined) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<Scheduler[], Error>({
    queryKey: ["campaignSchedules", campaignId],
    queryFn: async () => {
      if (!campaignId) {
        return [];
      }
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getCampaignSchedules(campaignId);
    },
    enabled: !!campaignId, // Only run the query if campaignId exists
  });
}

/**
 * Hook to fetch the active scheduler for a specific campaign
 * @param params - Object containing campaignId and optional enabled flag
 * @returns Query result containing a single Scheduler object or null if none active
 */
export function useCampaignActiveScheduler({
  campaignId,
  enabled = true,
}: GetCampaignActiveSchedulerParams) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<Scheduler | null, Error>({
    queryKey: ["campaignActiveScheduler", campaignId],
    queryFn: async () => {
      if (!campaignId) {
        return null;
      }
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      try {
        return await api.getCampaignActiveScheduler(campaignId);
      } catch (error: unknown) {
        // If no active scheduler exists, the API might return 404
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!campaignId && enabled,
  });
}

/**
 * Mutation hook to update a contact group's status
 * @returns Mutation object with methods to update contact group status
 */
export function useUpdateContactGroupStatus() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({ groupId, status }: UpdateContactGroupStatusParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateContactGroupStatus(groupId, status);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["campaignSchedules"] });
    },
  });
}

/**
 * Mutation hook to activate a schedule for a campaign
 * @returns Mutation object with methods to activate a schedule
 */
export function useActivateSchedule() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({ campaignId, scheduleId }: ActivateScheduleParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.activateSchedule(campaignId, scheduleId);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["campaignSchedules", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaignActiveScheduler", variables.campaignId],
      });
    },
  });
}

/**
 * Hook to fetch a specific schedule by ID
 * @param campaignId - The ID of the campaign
 * @param scheduleId - The ID of the schedule
 * @returns Query result containing a Scheduler object
 */
export function useScheduleById(
  campaignId: string | number | undefined,
  scheduleId: string | number | undefined
) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery<Scheduler, Error>({
    queryKey: ["schedule", campaignId, scheduleId],
    queryFn: async () => {
      if (!campaignId || !scheduleId) {
        throw new Error("Campaign ID and Schedule ID are required");
      }
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getScheduleById(campaignId, scheduleId);
    },
    enabled: !!campaignId && !!scheduleId,
  });
}

/**
 * Hook to fetch schedule capacity information
 * @param campaignId - The ID of the campaign
 * @param scheduleId - The ID of the schedule
 * @param contactListSize - The size of the contact list
 * @returns Query result containing schedule capacity data
 */
export function useScheduleCapacity(
  campaignId: string | number | undefined,
  scheduleId: string | number | undefined,
  contactListSize: number | undefined
) {
  const token = useToken();
  const header = getClientAuthorizationHeader();

  return useQuery({
    queryKey: ["scheduleCapacity", campaignId, scheduleId, contactListSize],
    queryFn: async () => {
      if (!campaignId || !scheduleId || contactListSize === undefined) {
        throw new Error(
          "Campaign ID, Schedule ID, and contact list size are required"
        );
      }
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.getScheduleCapacity(campaignId, scheduleId, contactListSize);
    },
    enabled: !!campaignId && !!scheduleId && contactListSize !== undefined,
  });
}

/**
 * Mutation hook to create a new schedule for a campaign
 * @returns Mutation object with methods to create a schedule
 */
export function useCreateSchedule() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({ campaignId, scheduleData }: CreateScheduleParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.createSchedule(campaignId, scheduleData);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["campaignSchedules", variables.campaignId],
      });
    },
  });
}

/**
 * Mutation hook to update an existing schedule
 * @returns Mutation object with methods to update a schedule
 */
export function useUpdateSchedule() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({
      campaignId,
      scheduleId,
      scheduleData,
    }: UpdateScheduleParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.updateSchedule(campaignId, scheduleId, scheduleData);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["campaignSchedules", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedule", variables.campaignId, variables.scheduleId],
      });
    },
  });
}

/**
 * Mutation hook to delete a schedule
 * @returns Mutation object with methods to delete a schedule
 */
export function useDeleteSchedule() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({ campaignId, scheduleId }: DeleteScheduleParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deleteSchedule(campaignId, scheduleId);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["campaignSchedules", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedule", variables.campaignId, variables.scheduleId],
      });
    },
  });
}

/**
 * Mutation hook to deactivate a schedule for a campaign
 * @returns Mutation object with methods to deactivate a schedule
 */
export function useDeactivateSchedule() {
  const token = useToken();
  const queryClient = useQueryClient();
  const header = getClientAuthorizationHeader();

  return useMutation({
    mutationFn: async ({
      campaignId,
      scheduleId,
    }: DeactivateScheduleParams) => {
      const api = schedulerApi({
        ...header,
        Authorization: `Bearer ${token?.token}`,
      });
      return api.deactivateSchedule(campaignId, scheduleId);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["campaignSchedules", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaignActiveScheduler", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedule", variables.campaignId, variables.scheduleId],
      });
    },
  });
}
