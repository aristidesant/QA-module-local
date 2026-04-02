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
	GetBranchDetailsParams,
	ListVersionCommitsParams,
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
	branchId?: string,
	params?: GetBranchDetailsParams
) => {
	return useQuery<AgentBranchDetails>({
		queryKey: ['agent-versioning', agentId, 'branch', branchId, params],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.getBranchDetails(agentId, branchId as string, params);
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
	params?: ListVersionCommitsParams,
	enabled = true
) => {
	return useQuery<AgentVersionCommitListResponse>({
		queryKey: ['agent-versioning', agentId, 'version-commits', params],
		queryFn: async () => {
			const api = agentVersioningApi();
			return api.listVersionCommits(agentId, params);
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
			versionDescription,
		}: {
			agentId: string;
			branchId: string;
			versionId: string;
			versionDescription?: string;
		}) => {
			const api = agentVersioningApi();
			const snapshot = await api.getSnapshot(agentId, { versionId });
			return api.updateSnapshotOnBranch(
				agentId,
				branchId,
				snapshot,
				versionDescription
			);
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

export const useDeleteVersionCommits = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			agentId,
			ids,
		}: {
			agentId: string;
			ids: number[];
		}) => {
			const api = agentVersioningApi();
			return api.deleteVersionCommits(agentId, ids);
		},
		onSuccess: (_data, variables) => {
			// Invalidate branch queries so server-filtered versions refresh
			queryClient.invalidateQueries({
				queryKey: ['agent-versioning', variables.agentId, 'branch'],
			});
			queryClient.invalidateQueries({
				queryKey: ['agent-versioning', variables.agentId, 'version-commits'],
			});
		},
	});
};

export const useSyncAgentVersionCommits = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (agentId: string) => {
			const api = agentVersioningApi();
			return api.syncVersionCommits(agentId);
		},
		onSuccess: (_data, agentId) => {
			queryClient.invalidateQueries({
				queryKey: ['agent-versioning', agentId],
			});
		},
	});
};
