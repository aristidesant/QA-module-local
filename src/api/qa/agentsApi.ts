import type {
	Agent,
	AgentListQueryParams,
	CreateAgentPayload,
	PaginatedResponse,
	UpdateAgentPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

function toAgentListParams(params?: AgentListQueryParams) {
	return {
		pagination: params?.pagination,
		limit: params?.limit,
		offset: params?.offset,
		agentType: params?.agentType,
		team: params?.team?.trim() || undefined,
		q: params?.q?.trim() || undefined,
		sortBy: params?.sortBy,
		orderBy: params?.orderBy,
	};
}

export async function getAgents(params?: AgentListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Agent>>('/agents', {
		params: toAgentListParams(params),
	});

	return response.data;
}

export async function getAgent(agentId: number) {
	const response = await qaHttpClient.get<Agent>(`/agents/${agentId}`);

	return response.data;
}

export async function createAgent(payload: CreateAgentPayload) {
	const response = await qaHttpClient.post<Agent>('/agents', payload);

	return response.data;
}

export async function updateAgent(
	agentId: number,
	payload: UpdateAgentPayload
) {
	const response = await qaHttpClient.patch<Agent>(
		`/agents/${agentId}`,
		payload
	);

	return response.data;
}

export async function deleteAgent(agentId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/agents/${agentId}`
	);

	return response.data;
}

export async function createAgentUser(agentId: number) {
	const response = await qaHttpClient.post<{ message: string }>(
		`/agents/${agentId}/create-user`
	);

	return response.data;
}
