import { BodyCreateAgentV1ConvaiAgentsCreatePost } from "@elevenlabs/elevenlabs-js/api/resources/conversationalAi";
import axios from "axios";
import type AgentListObject from "~/models/AgentListObject";
import { DEFAULT_API_URL } from "./config";

export interface FindAllAgentsResponse {
	data: AgentListObject[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
const agentApi = (_authHeader: Record<string, string> = {}) => {
	return {
		// CREATE agent
		createAgent: async (agent: BodyCreateAgentV1ConvaiAgentsCreatePost) => {
			const response = await axios.post(`${DEFAULT_API_URL}/agents`, agent);
			return response.data;
		},

		// FIND ALL agents
		findAllAgents: async (
			params?: {
				agentName?: string;
				agentId?: string;
				page?: number;
				limit?: number;
			},
			extraHeaders?: Record<string, string>
		) => {
			const response = await axios.get<FindAllAgentsResponse>(
				`${DEFAULT_API_URL}/agents`,
				{
					params,
					...(extraHeaders ? { headers: extraHeaders } : {}),
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE agent
		findAgent: async (agentId: string) => {
			const response = await axios.get<AgentListObject>(
				`${DEFAULT_API_URL}/agents/${agentId}`
			);
			return response.data;
		},

		// UPDATE agent (PATCH)
		updateAgent: async (agentId: string, data: Partial<AgentListObject>) => {
			// Convert camelCase to snake_case for API
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agents/${agentId}`,
				data
			);
			// Convert response back to camelCase
			return response.data;
		},

		// DELETE agent
		deleteAgent: async (agentId: string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/agents/${agentId}`
			);
			return response.data;
		},

		// GET agent campaigns
		getAgentCampaigns: async (agentId: string) => {
			const response = await axios.get<any>(
				`${DEFAULT_API_URL}/agents/${agentId}/campaign`
			);

			// Handle different response structures
			// If the response has a 'campaign' property, wrap it in an array
			if (response.data?.campaign) {
				return [response.data.campaign];
			}

			// If the response is already an array, return it
			if (Array.isArray(response.data)) {
				return response.data;
			}

			// If the response is a single campaign object, wrap it in an array
			if (response.data?.id && response.data?.name) {
				return [response.data];
			}

			// Default to empty array
			return [];
		},
	};
};

export default agentApi;
