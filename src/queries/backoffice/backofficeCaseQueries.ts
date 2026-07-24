import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import backofficeCasesApi, {
	type BackofficeCaseListParams,
} from '~/api/backoffice/backofficeCasesApi';
import type {
	BackofficeCase,
	BackofficeCaseHistory,
	BackofficeCaseListResponse,
	BackofficeSupervisorDashboard,
	BackofficeSupervisorDashboardParams,
	DistributeBackofficeCasesResponse,
} from '~/models/backoffice/BackofficeCaseModel';
import { useSessionStore } from '~/stores/sessionStore';

const getActiveClientId = () => {
	const { user, targetClient } = useSessionStore.getState();
	return targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;
};

const useActiveClientId = () => {
	const { user, targetClient } = useSessionStore();
	return targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;
};

export interface BackofficeAgentOption {
	id: number;
	username: string;
	firstName: string | null;
	lastName: string | null;
}

export function useBackofficeCases(params: BackofficeCaseListParams) {
	const activeClientId = useActiveClientId();

	return useQuery<BackofficeCaseListResponse>({
		queryKey: ['backoffice-cases', activeClientId, params],
		queryFn: async () => backofficeCasesApi().listCases(params),
		placeholderData: keepPreviousData,
		enabled: Boolean(activeClientId),
	});
}

export function useBackofficeCase(id: number | undefined) {
	const activeClientId = useActiveClientId();

	return useQuery<BackofficeCase>({
		queryKey: ['backoffice-case', activeClientId, id],
		queryFn: async () => backofficeCasesApi().getCase(id!),
		enabled: Boolean(activeClientId && id),
	});
}

export function useBackofficeCaseHistory(id: number | undefined) {
	const activeClientId = useActiveClientId();

	return useQuery<BackofficeCaseHistory[]>({
		queryKey: ['backoffice-case-history', activeClientId, id],
		queryFn: async () => backofficeCasesApi().getCaseHistory(id!),
		enabled: Boolean(activeClientId && id),
	});
}

export function useBackofficeSupervisorDashboard(
	params: BackofficeSupervisorDashboardParams,
	enabled = true
) {
	const activeClientId = useActiveClientId();

	return useQuery<BackofficeSupervisorDashboard>({
		queryKey: ['backoffice-supervisor-dashboard', activeClientId, params],
		queryFn: () => backofficeCasesApi().getSupervisorDashboard(params),
		placeholderData: keepPreviousData,
		enabled: Boolean(activeClientId && enabled),
	});
}

export function useUpdateBackofficeAssignment() {
	const queryClient = useQueryClient();

	return useMutation<
		BackofficeCase,
		Error,
		{ id: number; assignedUserId: number | null }
	>({
		mutationFn: ({ id, assignedUserId }) =>
			backofficeCasesApi().updateAssignment(id, assignedUserId),
		onSuccess: (data, variables) => {
			queryClient.setQueryData(
				['backoffice-case', getActiveClientId(), variables.id],
				data
			);
			queryClient.invalidateQueries({ queryKey: ['backoffice-cases'] });
			queryClient.invalidateQueries({
				queryKey: ['backoffice-supervisor-dashboard'],
			});
			queryClient.invalidateQueries({
				queryKey: [
					'backoffice-case-history',
					getActiveClientId(),
					variables.id,
				],
			});
		},
	});
}

export function useMarkBackofficeCaseManaged() {
	const queryClient = useQueryClient();

	return useMutation<BackofficeCase, Error, number>({
		mutationFn: (id) => backofficeCasesApi().markAsManaged(id),
		onSuccess: (data, id) => {
			queryClient.setQueryData(
				['backoffice-case', getActiveClientId(), id],
				data
			);
			queryClient.invalidateQueries({ queryKey: ['backoffice-cases'] });
			queryClient.invalidateQueries({
				queryKey: ['backoffice-supervisor-dashboard'],
			});
			queryClient.invalidateQueries({
				queryKey: ['backoffice-case-history', getActiveClientId(), id],
			});
		},
	});
}

export function useDistributeBackofficeCases() {
	const queryClient = useQueryClient();

	return useMutation<
		DistributeBackofficeCasesResponse,
		Error,
		number[] | undefined
	>({
		mutationFn: (caseIds) => backofficeCasesApi().distributeCases(caseIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['backoffice-cases'] });
			queryClient.invalidateQueries({
				queryKey: ['backoffice-supervisor-dashboard'],
			});
			queryClient.invalidateQueries({ queryKey: ['backoffice-case'] });
			queryClient.invalidateQueries({ queryKey: ['backoffice-case-history'] });
		},
	});
}

export function useEligibleBackofficeAgents(enabled = true) {
	const activeClientId = useActiveClientId();

	return useQuery<BackofficeAgentOption[]>({
		queryKey: ['backoffice-eligible-agents', activeClientId],
		queryFn: async () => {
			const agents = await backofficeCasesApi().getEligibleAgents();
			return agents.map((agent) => ({
				id: agent.id,
				username: agent.username,
				firstName: agent.firstName,
				lastName: agent.lastName,
			}));
		},
		enabled: Boolean(activeClientId && enabled),
	});
}
