import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAgentBehaviors,
	getAgentBehaviorById,
	createAgentBehavior,
	updateAgentBehavior,
	cloneAgentBehavior,
	deleteAgentBehavior,
	checkDeleteAgentBehavior,
	getCampaignsForBehavior,
	replaceAgentBehavior,
	replaceAgentBehaviorWithBackup,
	checkRestoreFromBackup,
	restoreAgentBehaviorFromBackup,
	getReplaceJob,
	processReplaceJob,
	processPendingReplaceJobs,
	cleanupContinuity,
	type GetAgentBehaviorsParams,
} from '~/api/agentBehaviorsApi';
import type {
	AgentBehaviorCloneRequest,
	AgentBehaviorContinuityCleanupRequest,
	AgentBehaviorUpdateRequest,
} from '~/models/AgentBehavior';

export const agentBehaviorsKeys = {
	all: ['agentBehaviors'] as const,
	lists: () => [...agentBehaviorsKeys.all, 'list'] as const,
	list: (filters: GetAgentBehaviorsParams) =>
		[...agentBehaviorsKeys.lists(), { filters }] as const,
	details: () => [...agentBehaviorsKeys.all, 'detail'] as const,
	detail: (id: string) => [...agentBehaviorsKeys.details(), id] as const,
	campaigns: (id: string) =>
		[...agentBehaviorsKeys.detail(id), 'campaigns'] as const,
	restoreCheck: (id: string) =>
		[...agentBehaviorsKeys.detail(id), 'restore-from-backup-check'] as const,
	jobs: () => [...agentBehaviorsKeys.all, 'jobs'] as const,
	job: (id: string) => [...agentBehaviorsKeys.jobs(), id] as const,
};

export const useAgentBehaviors = (params?: GetAgentBehaviorsParams) => {
	return useQuery({
		queryKey: agentBehaviorsKeys.list(params || {}),
		queryFn: () => getAgentBehaviors(params),
	});
};

export const useGetAgentBehavior = (
	id: string,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: agentBehaviorsKeys.detail(id),
		queryFn: () => getAgentBehaviorById(id),
		enabled: options?.enabled ?? !!id,
	});
};

export const useCreateAgentBehavior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAgentBehavior,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.lists(),
			});
		},
	});
};

export const useUpdateAgentBehavior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: AgentBehaviorUpdateRequest;
		}) => updateAgentBehavior(id, data),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.detail(variables.id),
			});
		},
	});
};

export const useCloneAgentBehavior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: AgentBehaviorCloneRequest;
		}) => cloneAgentBehavior(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.lists(),
			});
		},
	});
};

export const useDeleteAgentBehavior = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAgentBehavior,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.lists(),
			});
		},
	});
};

export const useCheckDeleteAgentBehavior = (
	id: string,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: [...agentBehaviorsKeys.detail(id), 'delete-check'],
		queryFn: () => checkDeleteAgentBehavior(id),
		enabled: options?.enabled,
		retry: false, // Don't retry since failure is expected (e.g. 409) or we just want immediate feedback
	});
};

export const useCampaignsForBehavior = (
	configId: string,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: agentBehaviorsKeys.campaigns(configId),
		queryFn: () => getCampaignsForBehavior(configId),
		enabled: options?.enabled,
	});
};

export const useReplaceAgentBehavior = () => {
	return useMutation({
		mutationFn: replaceAgentBehavior,
	});
};

export const useReplaceAgentBehaviorWithBackup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: replaceAgentBehaviorWithBackup,
		onSuccess: (data) => {
			void queryClient.setQueryData(agentBehaviorsKeys.job(data.jobId), data);
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.jobs(),
			});
		},
	});
};

export const useRestoreFromBackupCheck = (
	id: string,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: agentBehaviorsKeys.restoreCheck(id),
		queryFn: () => checkRestoreFromBackup(id),
		enabled: options?.enabled && !!id,
		retry: false,
	});
};

export const useRestoreAgentBehaviorFromBackup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: restoreAgentBehaviorFromBackup,
		onSuccess: (data, id) => {
			void queryClient.setQueryData(agentBehaviorsKeys.job(data.jobId), data);
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.restoreCheck(id),
			});
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.jobs(),
			});
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.lists(),
			});
		},
	});
};

export const useReplaceJob = (
	jobId: string,
	options?: {
		enabled?: boolean;
		refetchInterval?: number | ((data: any) => number | false);
	}
) => {
	return useQuery({
		queryKey: agentBehaviorsKeys.job(jobId),
		queryFn: () => getReplaceJob(jobId),
		enabled: options?.enabled && !!jobId,
		refetchInterval: options?.refetchInterval,
	});
};

export const useProcessReplaceJob = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: processReplaceJob,
		onSuccess: (data) => {
			void queryClient.setQueryData(agentBehaviorsKeys.job(data.jobId), data);
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.jobs(),
			});
		},
	});
};

export const useProcessPendingReplaceJobs = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: processPendingReplaceJobs,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.jobs(),
			});
		},
	});
};

export const useCleanupContinuity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			jobId,
			data,
		}: {
			jobId: string;
			data: AgentBehaviorContinuityCleanupRequest;
		}) => cleanupContinuity(jobId, data),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: agentBehaviorsKeys.job(variables.jobId),
			});
		},
	});
};
