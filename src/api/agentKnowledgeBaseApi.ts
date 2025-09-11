import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import {
	AgentKnowledgeBase,
	AgentKnowledgeBaseQueryParams,
} from '~/models/AgentKnowledgeBase';

/**
 * Generic Agent Knowledge Base API client
 * Note: Authorization handled by global Axios interceptor.
 */
const agentKnowledgeBaseApi = (_authHeader?: Record<string, string>) => {
	return {
		// FIND ALL knowledge bases
		findAllKnowledgeBases: async (params?: AgentKnowledgeBaseQueryParams) => {
			const response = await axios.get<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases`,
				{
					params,
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE knowledge base
		findAgentKnowledgeBase: async (agentId: string) => {
			const response = await axios.get<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/agent/${agentId}`
			);
			return response.data;
		},
		// FIND knowledge base status
		findAgentKnowledgeBaseStatus: async (agentId: string) => {
			const response = await axios.get<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/agent/${agentId}/status`
			);
			return response.data;
		},

		findAllAgentAssignedToKnowledgeBase: async (knowledgeBaseId: number) => {
			const response = await axios.get<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/knowledge-base/${knowledgeBaseId}`
			);
			return response.data;
		},

		assignKnowledgeBase: async (body: AgentKnowledgeBaseQueryParams) => {
			const response = await axios.post<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/assign`,
				body
			);
			return response.data;
		},

		unassignKnowledgeBase: async (
			body: Partial<AgentKnowledgeBaseQueryParams>
		) => {
			const response = await axios.post<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/unassign`,
				body
			);
			return response.data;
		},

		updateKnowledgeBaseStatus: async (
			agentId: number,
			knowledgeBaseId: number
		) => {
			const response = await axios.patch<AgentKnowledgeBase[]>(
				`${DEFAULT_API_URL}/agent-knowledge-bases/agent/${agentId}/knowledge-base/${knowledgeBaseId}/status`
			);
			return response.data;
		},
	};
};

export default agentKnowledgeBaseApi;
