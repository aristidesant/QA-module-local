import axios from 'axios';
import type SchedulerContactGroupModel from '~/models/SchedulerContactGroupModel';
import { DEFAULT_API_URL } from './config';

// Define the type with Pick utility for the update payload
export type UpdateSchedulerContactGroupPayload = Partial<
	Pick<
		SchedulerContactGroupModel,
		'status' | 'expirationDate' | 'maxCallsPerContact' | 'maxCallsPerList'
	>
> & {
	/** Contact group name **/
	name?: string;
	/** Contact group description **/
	description?: string;
};

/**
 * Scheduler Contact Group API client
 * Note: Authorization handled by global Axios interceptor.
 */
const schedulerContactGroupApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET scheduler contact groups by campaign ID and schedule status
		getSchedulerContactGroupsByCampaignAndStatus: async (
			campaignId: string | number,
			scheduleStatus: string
		): Promise<SchedulerContactGroupModel[]> => {
			const response = await axios.get<SchedulerContactGroupModel[]>(
				`${DEFAULT_API_URL}/schedule-contact-groups/by-campaign/${campaignId}/schedule-status/${scheduleStatus}`
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
				payload
			);
			return response.data;
		},

		// DELETE scheduler contact group
		deleteSchedulerContactGroup: async (id: string | number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/schedule-contact-groups/${id}`
			);
			return response.data;
		},
	};
};

export default schedulerContactGroupApi;
