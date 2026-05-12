import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import roleCampaignsApi, {
	type ReplaceRoleCampaignsPayload,
} from '~/api/roleCampaignsApi';
import type { Campaign } from '~/models/CampaignsModel';
import type { RoleModel } from '~/models/RoleModel';

// Get campaigns for a specific role
export const useGetRoleCampaigns = (roleId: number) => {
	return useQuery<Campaign[], unknown, Campaign[], ['role-campaigns', number]>({
		queryKey: ['role-campaigns', roleId],
		queryFn: async () => {
			const api = roleCampaignsApi();
			return api.getRoleCampaigns(roleId);
		},
		enabled: !!roleId,
	});
};

// Get roles assigned to a specific campaign
export const useGetCampaignRoles = (campaignId: number) => {
	return useQuery<
		RoleModel[],
		unknown,
		RoleModel[],
		['campaign-roles', number]
	>({
		queryKey: ['campaign-roles', campaignId],
		queryFn: async () => {
			const api = roleCampaignsApi();
			return api.getCampaignRoles(campaignId);
		},
		enabled: campaignId > 0,
	});
};

// Replace campaigns for a specific role
export const useReplaceRoleCampaigns = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			roleId,
			payload,
		}: {
			roleId: number;
			payload: ReplaceRoleCampaignsPayload;
		}) => {
			const api = roleCampaignsApi();
			return api.replaceRoleCampaigns(roleId, payload);
		},
		onSuccess: (_, { roleId }) => {
			// Invalidate queries to ensure fresh data
			queryClient.invalidateQueries({
				queryKey: ['role-campaigns', roleId],
			});
			// Since role campaigns affect what the user can see, we might invalidate my-campaigns too
			// if the current user has this role, but it's safe to just invalidate globally
			queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
		},
	});
};
