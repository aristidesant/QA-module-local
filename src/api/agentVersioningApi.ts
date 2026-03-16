import axios from 'axios';
import type AgentListObject from '~/models/AgentListObject';
import type {
	AgentBranchDetails,
	AgentBranchListResponse,
	AgentVersionQueryParams,
	AgentVersionSnapshot,
	AgentVersionUpdatePayload,
	EnableAgentVersioningResponse,
} from '~/models/AgentVersioningModel';
import { DEFAULT_API_URL } from './config';

const toVersionUpdatePayload = (
	snapshot: AgentVersionSnapshot
): AgentVersionUpdatePayload => {
	const {
		name,
		tags,
		phoneNumbers,
		platformSettings,
		privacy,
		overrides,
		callLimits,
		evaluation,
		dataCollection,
		workspaceOverrides,
		conversationConfig,
	} = snapshot;

	return {
		...(name ? { name } : {}),
		...(tags ? { tags } : {}),
		...(phoneNumbers ? { phoneNumbers } : {}),
		...(platformSettings ? { platformSettings } : {}),
		...(privacy ? { privacy } : {}),
		...(overrides ? { overrides } : {}),
		...(callLimits ? { callLimits } : {}),
		...(evaluation ? { evaluation } : {}),
		...(dataCollection ? { dataCollection } : {}),
		...(workspaceOverrides ? { workspaceOverrides } : {}),
		...(conversationConfig ? { conversationConfig } : {}),
	};
};

const agentVersioningApi = () => {
	return {
		getAgentRecord: async (agentId: string) => {
			const response = await axios.get<AgentListObject>(
				`${DEFAULT_API_URL}/agents/${agentId}`
			);

			return response.data;
		},

		enableVersioning: async (agentId: string) => {
			const response = await axios.post<EnableAgentVersioningResponse>(
				`${DEFAULT_API_URL}/agents/${agentId}/versioning`
			);

			return response.data;
		},

		listBranches: async (agentId: string, includeArchived = false) => {
			const response = await axios.get<AgentBranchListResponse>(
				`${DEFAULT_API_URL}/agents/${agentId}/branches`,
				{
					params: { includeArchived },
				}
			);

			return response.data;
		},

		getBranchDetails: async (agentId: string, branchId: string) => {
			const response = await axios.get<AgentBranchDetails>(
				`${DEFAULT_API_URL}/agents/${agentId}/branches/${branchId}`
			);

			return response.data;
		},

		getSnapshot: async (agentId: string, params: AgentVersionQueryParams) => {
			const response = await axios.get<AgentVersionSnapshot>(
				`${DEFAULT_API_URL}/agents/${agentId}`,
				{
					params,
				}
			);

			return response.data;
		},

		updateSnapshotOnBranch: async (
			agentId: string,
			branchId: string,
			snapshot: AgentVersionSnapshot
		) => {
			const response = await axios.patch<AgentVersionSnapshot>(
				`${DEFAULT_API_URL}/agents/${agentId}`,
				toVersionUpdatePayload(snapshot),
				{
					params: { branchId },
				}
			);

			return response.data;
		},
	};
};

export default agentVersioningApi;
