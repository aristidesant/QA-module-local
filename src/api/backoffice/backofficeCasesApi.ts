import axios from 'axios';
import { useSessionStore } from '~/stores/sessionStore';
import { DEFAULT_API_URL } from '../config';
import type {
	BackofficeCase,
	BackofficeCaseHistory,
	BackofficeCaseListResponse,
	BackofficeCaseStatus,
	BackofficeUser,
	BackofficeSupervisorDashboard,
	BackofficeSupervisorDashboardParams,
	DistributeBackofficeCasesResponse,
} from '~/models/backoffice/BackofficeCaseModel';

export interface BackofficeCaseListParams {
	status?: BackofficeCaseStatus;
	campaignId?: number;
	contactGroupId?: number;
	assignedUserId?: number;
	limit?: number;
	offset?: number;
}

const getClientHeaders = (): Record<string, string> => {
	const { user, targetClient } = useSessionStore.getState();
	const clientId = targetClient?.id ?? user?.clientId ?? user?.client?.id;

	return clientId ? { 'x-client-id': String(clientId) } : {};
};

const backofficeCasesApi = () => ({
	listCases: async (
		params?: BackofficeCaseListParams
	): Promise<BackofficeCaseListResponse> => {
		const response = await axios.get<BackofficeCaseListResponse>(
			`${DEFAULT_API_URL}/backoffice/cases`,
			{ params, headers: getClientHeaders() }
		);
		return response.data;
	},

	getCase: async (id: number): Promise<BackofficeCase> => {
		const response = await axios.get<BackofficeCase>(
			`${DEFAULT_API_URL}/backoffice/cases/${id}`,
			{ headers: getClientHeaders() }
		);
		return response.data;
	},

	getCaseHistory: async (id: number): Promise<BackofficeCaseHistory[]> => {
		const response = await axios.get<BackofficeCaseHistory[]>(
			`${DEFAULT_API_URL}/backoffice/cases/${id}/history`,
			{ headers: getClientHeaders() }
		);
		return response.data;
	},

	getSupervisorDashboard: async (
		params: BackofficeSupervisorDashboardParams
	): Promise<BackofficeSupervisorDashboard> => {
		const response = await axios.get<BackofficeSupervisorDashboard>(
			`${DEFAULT_API_URL}/backoffice/supervisor/dashboard`,
			{ params, headers: getClientHeaders() }
		);
		return response.data;
	},

	getEligibleAgents: async (): Promise<BackofficeUser[]> => {
		const response = await axios.get<BackofficeUser[]>(
			`${DEFAULT_API_URL}/backoffice/agents`,
			{ headers: getClientHeaders() }
		);
		return response.data;
	},

	updateAssignment: async (
		id: number,
		assignedUserId: number | null
	): Promise<BackofficeCase> => {
		const response = await axios.patch<BackofficeCase>(
			`${DEFAULT_API_URL}/backoffice/cases/${id}/assignment`,
			{ assignedUserId },
			{ headers: getClientHeaders() }
		);
		return response.data;
	},

	markAsManaged: async (id: number): Promise<BackofficeCase> => {
		const response = await axios.patch<BackofficeCase>(
			`${DEFAULT_API_URL}/backoffice/cases/${id}/status`,
			{ status: 'MANAGED' },
			{ headers: getClientHeaders() }
		);
		return response.data;
	},

	distributeCases: async (
		caseIds?: number[]
	): Promise<DistributeBackofficeCasesResponse> => {
		const response = await axios.post<DistributeBackofficeCasesResponse>(
			`${DEFAULT_API_URL}/backoffice/cases/distribute`,
			caseIds?.length ? { caseIds } : {},
			{ headers: getClientHeaders() }
		);
		return response.data;
	},
});

export default backofficeCasesApi;
