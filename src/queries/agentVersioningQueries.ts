import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agentVersioningApi from '~/api/agentVersioningApi';
import type AgentListObject from '~/models/AgentListObject';
import type {
	AgentBranchDetails,
	AgentBranchListResponse,
	AgentVersionCommitListResponse,
	AgentVersionQueryParams,
	AgentVersionSnapshot,
	EnableAgentVersioningResponse,
} from '~/models/AgentVersioningModel';

export const useGetAgentVersioningStatus = (agentId: string) => {
	return useQuery<AgentListObject>({
		queryKey: ['agent-versioning', agentId, 'status'],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.getAgentRecord(agentId);
		},
		enabled: Boolean(agentId),
	});
};

export const useEnableAgentVersioning = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (agentId: string) => {
			const api = agentVersioningApi();
			return api.enableVersioning(agentId);
		},
		onSuccess: (_data: EnableAgentVersioningResponse, agentId: string) => {
			queryClient.invalidateQueries({
				queryKey: ['agent-versioning', agentId],
			});
			queryClient.invalidateQueries({
				queryKey: ['agent', agentId],
			});
		},
	});
};

export const useGetAgentBranches = (
	agentId: string,
	includeArchived = false
) => {
	return useQuery<AgentBranchListResponse>({
		queryKey: ['agent-versioning', agentId, 'branches', includeArchived],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.listBranches(agentId, includeArchived);
		},
		enabled: Boolean(agentId),
	});
};

export const useGetAgentBranchDetails = (
	agentId: string,
	branchId?: string
) => {
	return useQuery<AgentBranchDetails>({
		queryKey: ['agent-versioning', agentId, 'branch', branchId],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.getBranchDetails(agentId, branchId as string);
		},
		enabled: Boolean(agentId && branchId),
	});
};

export const useGetAgentVersionSnapshot = (
	agentId: string,
	params: AgentVersionQueryParams,
	enabled = true
) => {
	return useQuery<AgentVersionSnapshot>({
		queryKey: ['agent-versioning', agentId, 'snapshot', params],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.getSnapshot(agentId, params);
		},
		enabled:
			enabled && Boolean(agentId && (params.branchId || params.versionId)),
	});
};

export const useGetAgentVersionCommits = (
	agentId: string,
	branchId?: string,
	enabled = true
) => {
	return useQuery<AgentVersionCommitListResponse>({
		queryKey: ['agent-versioning', agentId, 'version-commits', branchId],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.listVersionCommits(agentId, branchId);
		},
		enabled: enabled && Boolean(agentId),
	});
};

export const useRevertAgentVersion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			agentId,
			branchId,
			versionId,
		}: {
			agentId: string;
			branchId: string;
			versionId: string;
		}) => {
			const api = agentVersioningApi();
			const snapshot = await api.getSnapshot(agentId, { versionId });
			return api.updateSnapshotOnBranch(agentId, branchId, snapshot);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['agent-versioning', variables.agentId],
			});
			queryClient.invalidateQueries({
				queryKey: ['agent', variables.agentId],
			});
		},
	});
};
