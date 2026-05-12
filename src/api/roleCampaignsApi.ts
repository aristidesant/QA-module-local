import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type { Campaign } from '~/models/CampaignsModel';
import type { RoleModel } from '~/models/RoleModel';

export type ReplaceRoleCampaignsPayload = {
	campaignIds: number[];
};

const roleCampaignsApi = (_authHeader: Record<string, string> = {}) => {
	return {
		// GET role campaigns
		getRoleCampaigns: async (roleId: number) => {
			const response = await axios.get<Campaign[]>(
				`${DEFAULT_API_URL}/role-campaigns/roles/${roleId}/campaigns`
			);
			return response.data;
		},

		// GET roles assigned to a campaign
		getCampaignRoles: async (campaignId: number) => {
			const response = await axios.get<RoleModel[]>(
				`${DEFAULT_API_URL}/role-campaigns/campaigns/${campaignId}/roles`
			);
			return response.data;
		},

		// REPLACE role campaigns
		replaceRoleCampaigns: async (
			roleId: number,
			payload: ReplaceRoleCampaignsPayload
		) => {
			const response = await axios.put<Campaign[]>(
				`${DEFAULT_API_URL}/role-campaigns/roles/${roleId}/campaigns`,
				payload
			);
			return response.data;
		},
	};
};

export default roleCampaignsApi;
