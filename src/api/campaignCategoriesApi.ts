import axios from 'axios';
import type {
	CampaignCategory,
	CampaignCategoryResponse,
	CampaignCategoryApiParams,
	CreateCampaignCategoryRequest,
	UpdateCampaignCategoryRequest,
} from '../models/CampaignCategoryModel';
import { DEFAULT_API_URL } from './config';

/**
 * Campaign Categories API client
 */
const campaignCategoriesApi = (_authHeader: Record<string, string> = {}) => {
	return {
		/**
		 * Create a new campaign category
		 */
		createCampaignCategory: async (
			data: CreateCampaignCategoryRequest
		): Promise<CampaignCategory> => {
			const response = await axios.post<CampaignCategory>(
				`${DEFAULT_API_URL}/campaign-categories`,
				data
			);
			return response.data;
		},

		/**
		 * Get all campaign categories
		 */
		getCampaignCategories: async (
			params?: CampaignCategoryApiParams
		): Promise<CampaignCategoryResponse> => {
			const response = await axios.get<CampaignCategoryResponse>(
				`${DEFAULT_API_URL}/campaign-categories`,
				{ params }
			);
			return response.data;
		},

		/**
		 * Get campaign category by ID
		 */
		getCampaignCategoryById: async (id: number): Promise<CampaignCategory> => {
			const response = await axios.get<CampaignCategory>(
				`${DEFAULT_API_URL}/campaign-categories/${id}`
			);
			return response.data;
		},

		/**
		 * Update campaign category
		 */
		updateCampaignCategory: async (
			id: number,
			data: UpdateCampaignCategoryRequest
		): Promise<CampaignCategory> => {
			const response = await axios.patch<CampaignCategory>(
				`${DEFAULT_API_URL}/campaign-categories/${id}`,
				data
			);
			return response.data;
		},

		/**
		 * Delete campaign category
		 */
		deleteCampaignCategory: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/campaign-categories/${id}`);
		},

		/**
		 * Get active campaign categories
		 */
		getActiveCampaignCategories: async (): Promise<CampaignCategory[]> => {
			const response = await axios.get<CampaignCategory[]>(
				`${DEFAULT_API_URL}/campaign-categories/active`
			);
			return response.data;
		},
	};
};

export default campaignCategoriesApi;
