import axios from 'axios';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Prompt Types API client
 * Note: Authorization handled by global Axios interceptor.
 */
const campaignPromptTypeApi = (_authHeader?: Record<string, string>) => {
	return {
		// CREATE campaign prompt type
		createCampaignPromptType: async (
			data: Partial<CampaignPromptTypeModel>
		) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaign-prompt-types`,
				data
			);
			return response.data;
		},

		// LIST campaign prompt types
		findAllCampaignPromptTypes: async (params?: Record<string, any>) => {
			const response = await axios.get<CampaignPromptTypeModel[]>(
				`${DEFAULT_API_URL}/campaign-prompt-types`,
				{ params }
			);
			return response.data;
		},

		// GET single campaign prompt type
		findCampaignPromptType: async (id: string | number) => {
			const response = await axios.get<CampaignPromptTypeModel>(
				`${DEFAULT_API_URL}/campaign-prompt-types/${id}`
			);
			return response.data;
		},

		// UPDATE campaign prompt type (PATCH)
		updateCampaignPromptType: async (
			id: string | number,
			data: Partial<CampaignPromptTypeModel>
		) => {
			const response = await axios.patch<CampaignPromptTypeModel>(
				`${DEFAULT_API_URL}/campaign-prompt-types/${id}`,
				data
			);
			return response.data;
		},

		// DELETE campaign prompt type
		deleteCampaignPromptType: async (id: string | number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/campaign-prompt-types/${id}`
			);
			return response.data;
		},

		// REASSIGN campaign prompt type
		reassignCampaignPromptType: async (data: {
			items: {
				campaignId: number;
				oldCampaignPromptTypeId: number;
				newCampaignPromptTypeId: number;
				newPrompt: string;
			}[];
		}) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaign-prompt-types/reassign`,
				data
			);
			return response.data;
		},

		// GET available campaign prompt types for a campaign
		getAvailableCampaignPromptTypes: async (campaignId: number) => {
			const response = await axios.get<CampaignPromptTypeModel[]>(
				`${DEFAULT_API_URL}/campaign-prompt-types/available/${campaignId}`
			);
			return response.data;
		},
	};
};

export default campaignPromptTypeApi;
