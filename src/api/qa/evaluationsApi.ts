import { getMockConversationByRef } from '~/api/qa/evaluationDetailMocks';
import type {
	CreateEvaluationAnswerPayload,
	CreateEvaluationPayload,
	Evaluation,
	EvaluationAnswer,
	EvaluationDetail,
	EvaluationDetailResponse,
	EvaluationGroup,
	EvaluationListQueryParams,
	PaginatedResponse,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export const UNSUPPORTED_EVALUATION_DETAIL_ERROR =
	'UNSUPPORTED_EVALUATION_DETAIL';

function isEvaluationDetailResponse(
	evaluation: Evaluation | EvaluationDetailResponse
): evaluation is EvaluationDetailResponse {
	return (
		'questions' in evaluation &&
		Array.isArray(evaluation.questions) &&
		'answers' in evaluation &&
		Array.isArray(evaluation.answers)
	);
}

export function normalizeEvaluationDetail(
	response: EvaluationDetailResponse
): EvaluationDetail {
	const { answers, questions, ...evaluation } = response;
	const answersByQuestionId = new Map(
		answers.map((answer) => [
			answer.evaluationQuestionId,
			{ ...answer, awardedScore: Number(answer.awardedScore) },
		])
	);
	const groupsByKey = new Map<string, EvaluationGroup>();

	for (const question of [...questions].sort(
		(first, second) =>
			first.groupSortOrder - second.groupSortOrder ||
			first.sortOrder - second.sortOrder
	)) {
		const groupKey = `${question.groupSortOrder}:${question.groupName}`;
		const group = groupsByKey.get(groupKey) ?? {
			name: question.groupName,
			sortOrder: question.groupSortOrder,
			questions: [],
		};

		group.questions.push({
			...question,
			weight: Number(question.weight),
			answer: answersByQuestionId.get(question.id) ?? null,
		});
		groupsByKey.set(groupKey, group);
	}

	return {
		...evaluation,
		groups: [...groupsByKey.values()],
		conversation: getMockConversationByRef(evaluation.interactionRef),
	};
}

export async function getEvaluations(params?: EvaluationListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Evaluation>>(
		'/evaluations',
		{ params }
	);

	return response.data;
}

export async function createEvaluation(payload: CreateEvaluationPayload) {
	const response = await qaHttpClient.post<Evaluation>('/evaluations', payload);

	return response.data;
}

export async function getEvaluationDetail(evaluationId: number) {
	const response = await qaHttpClient.get<
		Evaluation | EvaluationDetailResponse
	>(`/evaluations/${evaluationId}`);

	if (!isEvaluationDetailResponse(response.data)) {
		throw new Error(UNSUPPORTED_EVALUATION_DETAIL_ERROR);
	}

	return normalizeEvaluationDetail(response.data);
}

export async function saveEvaluationAnswer(
	evaluationId: number,
	payload: CreateEvaluationAnswerPayload
) {
	const response = await qaHttpClient.post<EvaluationAnswer>(
		`/evaluations/${evaluationId}/answers`,
		payload
	);

	return response.data;
}

export async function completeEvaluation(evaluationId: number) {
	const response = await qaHttpClient.post<Evaluation>(
		`/evaluations/${evaluationId}/complete`
	);

	return response.data;
}

export async function deleteEvaluation(evaluationId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/evaluations/${evaluationId}`
	);

	return response.data;
}
