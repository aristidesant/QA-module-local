import axios from "axios";
import type SchedulerContactGroupModel from "~/models/SchedulerContactGroupModel";

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

// Define the type with Pick utility for the update payload
export type UpdateSchedulerContactGroupPayload = Partial<
  Pick<
    SchedulerContactGroupModel,
    "status" | "expirationDate" | "maxCallsPerContact" | "maxCallsPerList"
  >
>;

/**
 * Scheduler Contact Group API client
 * @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
 */
const schedulerContactGroupApi = (authHeader: Record<string, string>) => {
  return {
    // GET scheduler contact groups by campaign ID and schedule status
    getSchedulerContactGroupsByCampaignAndStatus: async (
      campaignId: string | number,
      scheduleStatus: string
    ): Promise<SchedulerContactGroupModel[]> => {
      const response = await axios.get<SchedulerContactGroupModel[]>(
        `${DEFAULT_API_URL}/schedule-contact-groups/by-campaign/${campaignId}/schedule-status/${scheduleStatus}`,
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    
    // PATCH update scheduler contact group
    updateSchedulerContactGroup: async (
      id: string | number,
      payload: UpdateSchedulerContactGroupPayload
    ) => {
      const response = await axios.patch(
        `${DEFAULT_API_URL}/schedule-contact-groups/${id}`,
        payload,
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

export default schedulerContactGroupApi;
