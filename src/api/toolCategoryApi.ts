import axios from 'axios';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import type { ToolModel } from '~/models/ToolModel';
import { DEFAULT_API_URL } from './config';

/**
 * Tool Category API client
 * Note: Authorization handled by global Axios interceptor.
 */
const toolCategoryApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET all tool categories
		getAllToolCategories: async () => {
			const response = await axios.get<ToolCategoryModel[]>(
				`${DEFAULT_API_URL}/tool-categories`
			);
			return response.data;
		},

		// GET tool category by ID
		getToolCategoryById: async (id: string | number) => {
			const response = await axios.get<ToolCategoryModel>(
				`${DEFAULT_API_URL}/tool-categories/${id}`
			);
			return response.data;
		},

		// POST create tool category
		createToolCategory: async (data: Partial<ToolCategoryModel>) => {
			const response = await axios.post<ToolCategoryModel>(
				`${DEFAULT_API_URL}/tool-categories`,
				data
			);
			return response.data;
		},

		// PUT update tool category
		updateToolCategory: async (
			id: string | number,
			data: Partial<ToolCategoryModel>
		) => {
			const response = await axios.put<ToolCategoryModel>(
				`${DEFAULT_API_URL}/tool-categories/${id}`,
				data
			);
			return response.data;
		},

		// DELETE tool category
		deleteToolCategory: async (id: string | number) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/tool-categories/${id}`
			);
			return response.data;
		},

		// GET tools by category
		getToolsByCategory: async (id: string | number) => {
			const response = await axios.get<ToolModel[]>(
				`${DEFAULT_API_URL}/tool-categories/${id}/tools`
			);
			return response.data;
		},
	};
};

export default toolCategoryApi;
