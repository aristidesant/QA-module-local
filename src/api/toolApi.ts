import axios from 'axios';
import type {
	ToolModel,
	AssignedToolModel,
	CreateToolDto,
	UpdateToolDto,
	DependentAgentsResponse,
} from '~/models/ToolModel';
import { DEFAULT_API_URL } from './config';

const toolApi = (_authHeader?: Record<string, string>) => {
	return {
		getAllTools: async () => {
			const response = await axios.get<ToolModel[]>(`${DEFAULT_API_URL}/tools`);
			return response.data;
		},

		getToolById: async (id: string | number) => {
			const response = await axios.get<ToolModel>(
				`${DEFAULT_API_URL}/tools/${id}`
			);
			return response.data;
		},

		createTool: async (data: CreateToolDto) => {
			const response = await axios.post<ToolModel>(
				`${DEFAULT_API_URL}/tools`,
				data
			);
			return response.data;
		},

		updateTool: async (id: string | number, data: UpdateToolDto) => {
			const response = await axios.put<ToolModel>(
				`${DEFAULT_API_URL}/tools/${id}`,
				data
			);
			return response.data;
		},

		deleteTool: async (id: string | number, force?: boolean) => {
			const params = force ? { force: 'true' } : undefined;
			const response = await axios.delete(`${DEFAULT_API_URL}/tools/${id}`, {
				params,
			});
			return response.data;
		},

		getDependentAgents: async (id: string | number) => {
			const response = await axios.get<DependentAgentsResponse>(
				`${DEFAULT_API_URL}/tools/${id}/dependent-agents`
			);
			return response.data;
		},

		createToolBulk: async (data: Partial<ToolModel>[]) => {
			const response = await axios.post<ToolModel[]>(
				`${DEFAULT_API_URL}/tools/bulk`,
				data
			);
			return response.data;
		},

		getToolsByCategory: async (categoryId: string | number) => {
			const response = await axios.get<ToolModel[]>(
				`${DEFAULT_API_URL}/tools/categories/${categoryId}/tools`
			);
			return response.data;
		},

		assignToolsToAgent: async (agentId: string, toolIds: string[]) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agent-tools/${agentId}/tools/assign`,
				{ toolIds }
			);
			return response.data;
		},

		unassignToolsFromAgent: async (agentId: string, toolIds: string[]) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agent-tools/${agentId}/tools/unassign`,
				{ toolIds }
			);
			return response.data;
		},

		getAssignedTools: async (agentId: string) => {
			const response = await axios.get<AssignedToolModel[]>(
				`${DEFAULT_API_URL}/agent-tools/agents/${agentId}/assignments`
			);
			return response.data;
		},
	};
};

export default toolApi;
