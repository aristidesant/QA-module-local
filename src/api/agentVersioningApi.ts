import axios from 'axios';
import type AgentListObject from '~/models/AgentListObject';
import type {
	AgentBranchDetails,
	AgentBranchListResponse,
	AgentVersionCommitListResponse,
	AgentVersionQueryParams,
	AgentVersionSnapshot,
	EnableAgentVersioningResponse,
} from '~/models/AgentVersioningModel';
import { normalizeAgentVersionSnapshot } from '~/utils/agentVersioning';
import { DEFAULT_API_URL } from './config';

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

		listVersionCommits: async (agentId: string, branchId?: string) => {
			const response = await axios.get<AgentVersionCommitListResponse>(
				`${DEFAULT_API_URL}/agents/${agentId}/version-commits`,
				{ params: branchId ? { branchId } : undefined }
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
				normalizeAgentVersionSnapshot(snapshot),
				{
					params: { branchId },
				}
			);

			return response.data;
		},
	};
};

export default agentVersioningApi;
