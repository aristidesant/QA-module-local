import type {
	CreateSupervisorPayload,
	PaginatedResponse,
	Supervisor,
	SupervisorListQueryParams,
	SupervisorTeam,
	SupervisorWithTeam,
	UpdateSupervisorPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getSupervisors(params?: SupervisorListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Supervisor>>(
		'/supervisors',
		{ params }
	);
	return response.data;
}

export async function getSupervisorDetail(supervisorId: number) {
	const response = await qaHttpClient.get<SupervisorWithTeam>(
		`/supervisors/${supervisorId}`
	);
	return response.data;
}

export async function getSupervisorTeam(supervisorId: number) {
	const response = await qaHttpClient.get<SupervisorTeam>(
		`/supervisors/${supervisorId}/team`
	);
	return response.data;
}

export async function createSupervisor(payload: CreateSupervisorPayload) {
	const response = await qaHttpClient.post<Supervisor>(
		'/supervisors',
		payload
	);
	return response.data;
}

export async function updateSupervisor(supervisorId: number, payload: UpdateSupervisorPayload) {
	const response = await qaHttpClient.patch<Supervisor>(
		`/supervisors/${supervisorId}`,
		payload
	);
	return response.data;
}

export async function deleteSupervisor(supervisorId: number) {
	const response = await qaHttpClient.delete<void>(
		`/supervisors/${supervisorId}`
	);
	return response.data;
}
