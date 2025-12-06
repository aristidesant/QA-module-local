import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
	useDuplicateAgent,
	useGetAllAgents,
	useAgentsWithCampaigns,
	useGetAgent,
	useGetAgentCampaigns,
	useUpdateAgent,
	useDeleteAgent,
} from '../agentQueries';
import agentApi from '~/api/agentApi';

vi.mock('~/api/agentApi', () => ({
	default: vi.fn(),
}));

const mockedAgentApi = agentApi as unknown as any;

const mockApi = {
	createAgent: vi.fn(),
	duplicateAgent: vi.fn(),
	findAllAgents: vi.fn(),
	findAgentsWithCampaigns: vi.fn(),
	findAgent: vi.fn(),
	getAgentCampaigns: vi.fn(),
	updateAgent: vi.fn(),
	deleteAgent: vi.fn(),
};

mockedAgentApi.mockReturnValue(mockApi);

const createWrapper = (client: QueryClient) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

describe('agentQueries', () => {
	let queryClient: QueryClient;
	let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
				mutations: {
					retry: false,
				},
			},
		});
		invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
		Object.values(mockApi).forEach((fn) => fn.mockReset());
	});

	afterEach(() => {
		queryClient.clear();
	});

	describe('useGetAllAgents', () => {
		it('should fetch all agents', async () => {
			const mockData = { agents: [], total: 0 };
			mockApi.findAllAgents.mockReturnValue(mockData);

			const { result } = renderHook(() => useGetAllAgents(), {
				wrapper: createWrapper(queryClient),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.findAllAgents).toHaveBeenCalledWith(undefined);
			expect(result.current.data).toEqual(mockData);
		});

		it('should pass params to API', async () => {
			const params = { limit: 10 };
			mockApi.findAllAgents.mockReturnValue({ agents: [], total: 0 });

			renderHook(() => useGetAllAgents(params), {
				wrapper: createWrapper(queryClient),
			});

			await waitFor(() => {
				expect(mockApi.findAllAgents).toHaveBeenCalledWith(params);
			});
		});
	});

	describe('useDuplicateAgent', () => {
		it('should duplicate an agent and invalidate queries', async () => {
			const agentId = '1';
			const data = { name: 'Duplicated Agent' };
			mockApi.duplicateAgent.mockResolvedValue({});

			const { result } = renderHook(() => useDuplicateAgent(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({ agentId, data });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.duplicateAgent).toHaveBeenCalledWith(agentId, data);
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['agents'],
			});
		});
	});

	describe('useAgentsWithCampaigns', () => {
		it('should fetch agents with campaigns when enabled', async () => {
			const params = {};
			const mockData = { agents: [] };
			const mockApi = mockedAgentApi();
			mockApi.findAgentsWithCampaigns.mockReturnValue(mockData);

			const { result } = renderHook(() => useAgentsWithCampaigns(params), {
				wrapper: createWrapper(queryClient),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.findAgentsWithCampaigns).toHaveBeenCalledWith(params);
			expect(result.current.data).toEqual(mockData);
		});

		it('should not fetch when disabled', () => {
			const mockApi = mockedAgentApi();

			renderHook(() => useAgentsWithCampaigns({}, false), {
				wrapper: createWrapper(queryClient),
			});

			expect(mockApi.findAgentsWithCampaigns).not.toHaveBeenCalled();
		});
	});

	describe('useGetAgent', () => {
		it('should fetch a single agent', async () => {
			const id = '1';
			const mockData = { id: '1', name: 'Agent 1' };
			const mockApi = mockedAgentApi();
			mockApi.findAgent.mockReturnValue(mockData);

			const { result } = renderHook(() => useGetAgent(id), {
				wrapper: createWrapper(queryClient),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.findAgent).toHaveBeenCalledWith(id);
			expect(result.current.data).toEqual(mockData);
		});

		it('should not fetch when id is empty', () => {
			const mockApi = mockedAgentApi();

			renderHook(() => useGetAgent(''), {
				wrapper: createWrapper(queryClient),
			});

			expect(mockApi.findAgent).not.toHaveBeenCalled();
		});
	});

	describe('useGetAgentCampaigns', () => {
		it('should fetch agent campaigns', async () => {
			const agentId = '1';
			const mockData = [{ id: '1', name: 'Campaign 1' }];
			const mockApi = mockedAgentApi();
			mockApi.getAgentCampaigns.mockReturnValue(mockData);

			const { result } = renderHook(() => useGetAgentCampaigns(agentId), {
				wrapper: createWrapper(queryClient),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.getAgentCampaigns).toHaveBeenCalledWith(agentId);
			expect(result.current.data).toEqual(mockData);
		});

		it('should not fetch when agentId is empty', () => {
			const mockApi = mockedAgentApi();

			renderHook(() => useGetAgentCampaigns(''), {
				wrapper: createWrapper(queryClient),
			});

			expect(mockApi.getAgentCampaigns).not.toHaveBeenCalled();
		});
	});

	describe('useUpdateAgent', () => {
		it('should update an agent and invalidate queries', async () => {
			const id = '1';
			const data = { name: 'Updated Agent' };
			const mockData = { id, ...data };
			mockApi.updateAgent.mockResolvedValue(mockData);

			const { result } = renderHook(() => useUpdateAgent(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate({ id, data });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.updateAgent).toHaveBeenCalledWith(id, data);
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['agents'],
			});
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['agent', id],
			});
		});
	});

	describe('useDeleteAgent', () => {
		it('should delete an agent and invalidate queries', async () => {
			const id = '1';
			mockApi.deleteAgent.mockResolvedValue({});

			const { result } = renderHook(() => useDeleteAgent(), {
				wrapper: createWrapper(queryClient),
			});

			result.current.mutate(id);

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(mockApi.deleteAgent).toHaveBeenCalledWith(id);
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['agents'],
			});
			expect(invalidateQueriesSpy).toHaveBeenCalledWith({
				queryKey: ['agent', id],
			});
		});
	});
});
