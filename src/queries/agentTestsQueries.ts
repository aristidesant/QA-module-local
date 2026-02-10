import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agentTestsApi from '~/api/agentTestsApi';
import type {
	AgentTest,
	AgentTestListParams,
	AgentTestListResponse,
	CreateAgentTestDto,
	RunAgentTestsDto,
	RunAgentTestsResponse,
	UpdateAgentTestDto,
} from '~/models/AgentTestModel';

export const useAgentTests = (params: AgentTestListParams) => {
	return useQuery<AgentTestListResponse>({
		queryKey: ['agent-tests', params],
		queryFn: async () => {
			const api = agentTestsApi();
			return api.listAgentTests(params);
		},
	});
};

export const useAgentTest = (testId: string, enabled = true) => {
	return useQuery<AgentTest>({
		queryKey: ['agent-test', testId],
		queryFn: async () => {
			const api = agentTestsApi();
			return api.getAgentTestById(testId);
		},
		enabled: Boolean(testId) && enabled,
	});
};

export const useCreateAgentTest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateAgentTestDto) => {
			const api = agentTestsApi();
			return api.createAgentTest(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agent-tests'] });
		},
	});
};

export const useUpdateAgentTest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateAgentTestDto) => {
			const api = agentTestsApi();
			return api.updateAgentTest(data.id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['agent-tests'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['agent-test', data.id] });
			}
		},
	});
};

export const useDeleteAgentTest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (testId: string) => {
			const api = agentTestsApi();
			return api.deleteAgentTest(testId);
		},
		onSuccess: (_, testId) => {
			queryClient.invalidateQueries({ queryKey: ['agent-tests'] });
			queryClient.invalidateQueries({ queryKey: ['agent-test', testId] });
		},
	});
};

export const useRunAgentTests = () => {
	return useMutation<
		RunAgentTestsResponse,
		unknown,
		{ agentId: string; data: RunAgentTestsDto }
	>({
		mutationFn: async ({ agentId, data }) => {
			const api = agentTestsApi();
			return api.runAgentTests(agentId, data);
		},
	});
};

export const useTestRunStatus = (suiteId: string | null, enabled = true) => {
	return useQuery<RunAgentTestsResponse>({
		queryKey: ['agent-test-invocation-status', suiteId],
		queryFn: async () => {
			const api = agentTestsApi();
			return api.getTestRunStatus(suiteId!);
		},
		enabled: Boolean(suiteId) && enabled,
		refetchInterval: (query) => {
			const data = query.state.data;
			// Keep polling while suite is in progress (has pending test runs)
			if (data && data.status !== 'STARTED') {
				return false;
			}
			// Poll every 3 seconds while in progress or until first response
			return 3000;
		},
		retry: true,
		retryDelay: 1000,
	});
};
