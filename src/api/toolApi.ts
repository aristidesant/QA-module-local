import axios from 'axios';
import type {
	ToolModel,
	AssignedToolModel,
	CreateToolDto,
	UpdateToolDto,
} from '~/models/ToolModel';
import { DEFAULT_API_URL } from './config';

/**
 * Tool API client
 * Note: Authorization handled by global Axios interceptor.
 */
const toolApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET all tools
		getAllTools: async () => {
			const response = await axios.get<ToolModel[]>(`${DEFAULT_API_URL}/tools`);
			return response.data;
		},

		// GET tool by ID
		getToolById: async (id: string | number) => {
			const response = await axios.get<ToolModel>(
				`${DEFAULT_API_URL}/tools/${id}`
			);
			return response.data;
		},

		// POST create tool
		createTool: async (data: CreateToolDto) => {
			const response = await axios.post<ToolModel>(
				`${DEFAULT_API_URL}/tools`,
				data
			);
			return response.data;
		},

		// PUT update tool
		updateTool: async (id: string | number, data: UpdateToolDto) => {
			const response = await axios.put<ToolModel>(
				`${DEFAULT_API_URL}/tools/${id}`,
				data
			);
			return response.data;
		},

		// DELETE tool
		deleteTool: async (id: string | number) => {
			const response = await axios.delete(`${DEFAULT_API_URL}/tools/${id}`);
			return response.data;
		},

		// POST create tool bulk
		createToolBulk: async (data: Partial<ToolModel>[]) => {
			const response = await axios.post<ToolModel[]>(
				`${DEFAULT_API_URL}/tools/bulk`,
				data
			);
			return response.data;
		},

		// GET tools by category
		getToolsByCategory: async (categoryId: string | number) => {
			const response = await axios.get<ToolModel[]>(
				`${DEFAULT_API_URL}/tools/categories/${categoryId}/tools`
			);
			return response.data;
		},

		// PATCH assign tools to agent
		assignToolsToAgent: async (agentId: string, toolIds: string[]) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agent-tools/${agentId}/tools/assign`,
				{ toolIds }
			);
			return response.data;
		},

		// PATCH unassign tools from agent
		unassignToolsFromAgent: async (agentId: string, toolIds: string[]) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agent-tools/${agentId}/tools/unassign`,
				{ toolIds }
			);
			return response.data;
		},

		// GET assigned tools for agent
		getAssignedTools: async (agentId: string) => {
			const response = await axios.get<AssignedToolModel[]>(
				`${DEFAULT_API_URL}/agent-tools/agents/${agentId}/assignments`
			);
			return response.data;
		},
	};
};

export default toolApi;
