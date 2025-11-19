import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';
import type { CampaignPromptGenerateRequest } from '~/models/CampaignPromptGenerateModel';
import type { CampaignPromptGenerateResponse } from '~/models/CampaignPromptGenerateResponse';

const campaignPromptsApi = () => {
	return {
		// CREATE campaign prompt
		createCampaignPrompt: async (data: CampaignPromptModel) => {
			const response = await axios.post<CampaignPromptModel>(
				`${DEFAULT_API_URL}/campaign-prompts`,
				data
			);
			return response.data;
		},

		// CREATE campaign prompts batch
		createCampaignPromptsBatch: async (data: {
			prompts: CampaignPromptModel[];
		}) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaign-prompts/batch`,
				data
			);
			return response.data;
		},

		// LIST campaign prompts
		getCampaignPrompts: async (
			params?: { campaignId?: number; typeId?: number } & Record<string, any>
		) => {
			const response = await axios.get<CampaignPromptModel[]>(
				`${DEFAULT_API_URL}/campaign-prompts`,
				{ params }
			);
			return response.data;
		},

		// GET campaign prompt by id
		getCampaignPrompt: async (id: number) => {
			const response = await axios.get<CampaignPromptModel>(
				`${DEFAULT_API_URL}/campaign-prompts/${id}`
			);
			return response.data;
		},

		// UPDATE campaign prompt
		updateCampaignPrompt: async (
			id: number,
			data: Partial<CampaignPromptModel>
		) => {
			const response = await axios.patch<CampaignPromptModel>(
				`${DEFAULT_API_URL}/campaign-prompts/${id}`,
				data
			);
			return response.data;
		},

		// DELETE campaign prompt
		deleteCampaignPrompt: async (id: number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/campaign-prompts/${id}`
			);
			return response.data;
		},

		// GENERATE campaign prompt with AI
		generateCampaignPrompt: async (data: CampaignPromptGenerateRequest) => {
			const response = await axios.post<CampaignPromptGenerateResponse>(
				`${DEFAULT_API_URL}/campaign-prompts/generate`,
				data
			);
			return response.data;
		},
	};
};

export default campaignPromptsApi;
