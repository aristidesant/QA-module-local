import axios from 'axios';
import type {
	CampaignObjective,
	CreateCampaignObjectiveRequest,
	UpdateCampaignObjectiveRequest,
} from '../models/CampaignObjectiveModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Objectives API client
 */
const campaignObjectivesApi = (_authHeader: Record<string, string> = {}) => {
	return {
		/**
		 * Create a new campaign objective
		 */
		createCampaignObjective: async (
			data: CreateCampaignObjectiveRequest
		): Promise<CampaignObjective> => {
			const response = await axios.post<CampaignObjective>(
				`${DEFAULT_API_URL}/campaign-objectives`,
				data
			);
			return response.data;
		},

		/**
		 * Get all campaign objectives
		 */
		getCampaignObjectives: async (): Promise<CampaignObjective[]> => {
			const response = await axios.get<CampaignObjective[]>(
				`${DEFAULT_API_URL}/campaign-objectives`
			);
			return response.data;
		},

		/**
		 * Get campaign objective by ID
		 */
		getCampaignObjectiveById: async (
			id: number
		): Promise<CampaignObjective> => {
			const response = await axios.get<CampaignObjective>(
				`${DEFAULT_API_URL}/campaign-objectives/${id}`
			);
			return response.data;
		},

		/**
		 * Update campaign objective
		 */
		updateCampaignObjective: async (
			id: number,
			data: UpdateCampaignObjectiveRequest
		): Promise<CampaignObjective> => {
			const response = await axios.patch<CampaignObjective>(
				`${DEFAULT_API_URL}/campaign-objectives/${id}`,
				data
			);
			return response.data;
		},

		/**
		 * Delete campaign objective
		 */
		deleteCampaignObjective: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/campaign-objectives/${id}`);
		},

		/**
		 * Get active campaign objectives
		 */
		getActiveCampaignObjectives: async (): Promise<CampaignObjective[]> => {
			const response = await axios.get<CampaignObjective[]>(
				`${DEFAULT_API_URL}/campaign-objectives/active`
			);
			return response.data;
		},

		/**
		 * Get objectives by category ID
		 */
		getObjectivesByCategory: async (
			categoryId: number
		): Promise<CampaignObjective[]> => {
			const response = await axios.get<CampaignObjective[]>(
				`${DEFAULT_API_URL}/campaign-objectives/category/${categoryId}`
			);
			return response.data;
		},

		/**
		 * Get active objectives by category ID
		 */
		getActiveObjectivesByCategory: async (
			categoryId: number
		): Promise<CampaignObjective[]> => {
			const response = await axios.get<CampaignObjective[]>(
				`${DEFAULT_API_URL}/campaign-objectives/category/${categoryId}/active`
			);
			return response.data;
		},
	};
};

export default campaignObjectivesApi;
