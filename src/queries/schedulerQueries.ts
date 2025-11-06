import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import schedulerApi from '~/api/schedulerApi';
import contactGroupApi from '~/api/contactGroupApi';

// Get all schedules for a campaign
export const useCampaignSchedules = (
	campaignId: string | number | undefined
) => {
	return useQuery({
		queryKey: ['campaignSchedules', campaignId],
		queryFn: async () => {
			const api = schedulerApi();
			return api.getCampaignSchedules(campaignId!);
		},
		enabled: !!campaignId,
	});
};

// Get active schedule for a campaign
export const useCampaignActiveSchedule = (
	campaignId: string | number | undefined
) => {
	return useQuery({
		queryKey: ['campaignActiveSchedule', campaignId],
		queryFn: async () => {
			const api = schedulerApi();
			return api.getCampaignActiveScheduler(campaignId!);
		},
		enabled: !!campaignId,
	});
};

// Get contact groups by campaign and status
export const useSchedulerContactGroupsByCampaignAndStatus = (
	campaignId: string | number | undefined,
	status: string
) => {
	return useQuery({
		queryKey: ['schedulerContactGroups', campaignId, status],
		queryFn: async () => {
			const api = contactGroupApi();
			const response = await api.findAllContactGroups({ campaignId, status });
			return response.data; // Return the data array
		},
		enabled: !!campaignId,
	});
};

// Update contact group status
export const useUpdateContactGroupStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			groupId,
			status,
		}: {
			groupId: string | number;
			status: 'active' | 'inactive' | 'paused';
		}) => {
			const api = schedulerApi();
			return api.updateContactGroupStatus(groupId, status);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['schedulerContactGroups'] });
		},
	});
};

// Create predefined schedule
export const useCreatePredefinedSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			predefinedScheduleData,
		}: {
			campaignId: string | number;
			predefinedScheduleData: {
				name: string;
				description: string;
				campaignId: number;
				humanEquivalent?: number;
			};
		}) => {
			const api = schedulerApi();
			return api.createPredefinedSchedule(campaignId, predefinedScheduleData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
		},
	});
};

// Update schedule
export const useUpdateSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			scheduleId,
			scheduleData,
		}: {
			campaignId: string | number;
			scheduleId: string | number;
			scheduleData: any;
		}) => {
			const api = schedulerApi();
			return api.updateSchedule(campaignId, scheduleId, scheduleData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
		},
	});
};

// Activate schedule
export const useActivateSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			scheduleId,
		}: {
			campaignId: string | number;
			scheduleId: string | number;
		}) => {
			const api = schedulerApi();
			return api.activateSchedule(campaignId, scheduleId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
		},
	});
};

// Deactivate schedule
export const useDeactivateSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			scheduleId,
		}: {
			campaignId: string | number;
			scheduleId: string | number;
		}) => {
			const api = schedulerApi();
			return api.deactivateSchedule(campaignId, scheduleId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
		},
	});
};

// Delete schedule
export const useDeleteSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			campaignId,
			scheduleId,
		}: {
			campaignId: string | number;
			scheduleId: string | number;
		}) => {
			const api = schedulerApi();
			return api.deleteSchedule(campaignId, scheduleId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaignSchedules'] });
		},
	});
};
