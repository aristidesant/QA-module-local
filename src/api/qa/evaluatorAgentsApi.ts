import type {
	CreateEvaluatorAgentPayload,
	EvaluatorAgent,
	EvaluatorAgentListQueryParams,
	PaginatedResponse,
	UpdateEvaluatorAgentPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

function toEvaluatorAgentListParams(params?: EvaluatorAgentListQueryParams) {
	return {
		pagination: params?.pagination,
		limit: params?.limit,
		offset: params?.offset,
		provider: params?.provider,
		isActive: params?.isActive,
		q: params?.q?.trim() || undefined,
		sortBy: params?.sortBy,
		orderBy: params?.orderBy,
	};
}

export async function getEvaluatorAgents(
	params?: EvaluatorAgentListQueryParams
) {
	const response = await qaHttpClient.get<PaginatedResponse<EvaluatorAgent>>(
		'/evaluator-agents',
		{
			params: toEvaluatorAgentListParams(params),
		}
	);

	return response.data;
}

export async function getEvaluatorAgent(evaluatorAgentId: number) {
	const response = await qaHttpClient.get<EvaluatorAgent>(
		`/evaluator-agents/${evaluatorAgentId}`
	);

	return response.data;
}

export async function createEvaluatorAgent(
	payload: CreateEvaluatorAgentPayload
) {
	const response = await qaHttpClient.post<EvaluatorAgent>(
		'/evaluator-agents',
		payload
	);

	return response.data;
}

export async function updateEvaluatorAgent(
	evaluatorAgentId: number,
	payload: UpdateEvaluatorAgentPayload
) {
	const response = await qaHttpClient.patch<EvaluatorAgent>(
		`/evaluator-agents/${evaluatorAgentId}`,
		payload
	);

	return response.data;
}

export async function deleteEvaluatorAgent(evaluatorAgentId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/evaluator-agents/${evaluatorAgentId}`
	);

	return response.data;
}
