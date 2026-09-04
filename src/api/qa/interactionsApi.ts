import type {
	CreateInteractionPayload,
	Interaction,
	InteractionListQueryParams,
	InteractionSummary,
	PaginatedResponse,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getInteractions(params?: InteractionListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Interaction>>(
		'/interactions',
		{ params }
	);
	return response.data;
}

export async function getAgentInteractionSummary(agentId: number) {
	const response = await qaHttpClient.get<InteractionSummary>(
		`/interactions/summary/${agentId}`
	);
	return response.data;
}

export async function createInteraction(payload: CreateInteractionPayload) {
	const response = await qaHttpClient.post<Interaction>('/interactions', payload);
	return response.data;
}
