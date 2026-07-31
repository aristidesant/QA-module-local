import { normalizeEvaluationDetail } from '~/api/qa/evaluationsApi';
import type {
	CreateEvaluationDisputePayload,
	EvaluationDisputeDetail,
	EvaluationDisputeDetailResponse,
	EvaluationDisputeListQueryParams,
	EvaluationDisputeSummary,
	PaginatedResponse,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

function toDisputeListParams(params?: EvaluationDisputeListQueryParams) {
	return {
		supervisorIds: params?.supervisorIds,
		agentIds: params?.agentIds,
		campaignIds: params?.campaignIds,
		createdAtFrom: params?.createdAtFrom,
		createdAtTo: params?.createdAtTo,
		sortBy: params?.sortBy,
		orderBy: params?.orderBy,
		page: params?.page,
		limit: params?.limit,
	};
}

function normalizeDisputeSummary(
	dispute: EvaluationDisputeSummary
): EvaluationDisputeSummary {
	return {
		...dispute,
		before: {
			overallScore: Number(dispute.before.overallScore),
			overallScorePct: Number(dispute.before.overallScorePct),
			maxScore: Number(dispute.before.maxScore),
		},
		after: {
			overallScore: Number(dispute.after.overallScore),
			overallScorePct: Number(dispute.after.overallScorePct),
			maxScore: Number(dispute.after.maxScore),
		},
		scoreDelta: Number(dispute.scoreDelta),
	};
}

function normalizeDisputeDetail(
	dispute: EvaluationDisputeDetailResponse
): EvaluationDisputeDetail {
	return {
		...normalizeDisputeSummary(dispute),
		source: normalizeEvaluationDetail(dispute.source),
		resulting: normalizeEvaluationDetail(dispute.resulting),
	};
}

export async function createEvaluationDispute(
	evaluationId: number,
	payload: CreateEvaluationDisputePayload
) {
	const response = await qaHttpClient.post<EvaluationDisputeSummary>(
		`/evaluations/${evaluationId}/disputes`,
		payload
	);

	return normalizeDisputeSummary(response.data);
}

export async function getEvaluationDisputes(evaluationId: number) {
	const response = await qaHttpClient.get<EvaluationDisputeSummary[]>(
		`/evaluations/${evaluationId}/disputes`
	);

	return response.data.map(normalizeDisputeSummary);
}

export async function getDisputes(params?: EvaluationDisputeListQueryParams) {
	const response = await qaHttpClient.get<
		PaginatedResponse<EvaluationDisputeSummary>
	>('/disputes', {
		params: toDisputeListParams(params),
	});

	return {
		...response.data,
		data: response.data.data.map(normalizeDisputeSummary),
	};
}

export async function getDispute(disputeId: number) {
	const response = await qaHttpClient.get<EvaluationDisputeDetailResponse>(
		`/disputes/${disputeId}`
	);

	return normalizeDisputeDetail(response.data);
}
