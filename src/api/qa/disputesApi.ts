import { normalizeEvaluationDetail } from '~/api/qa/evaluationsApi';
import type {
	CreateEvaluationDisputePayload,
	EvaluationDisputeDetail,
	EvaluationDisputeDetailResponse,
	EvaluationDisputeListQueryParams,
	EvaluationDisputeSummary,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';
import { getMockDisputes } from '~/api/qa/disputesMockData';

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
	// Use mock data for demo purposes
	const mockData = getMockDisputes(
		params?.page ? (params.page - 1) * (params.limit || 25) : 0,
		params?.limit || 25
	);

	return {
		...mockData,
		data: mockData.data.map(normalizeDisputeSummary),
	};
}

export async function getDispute(disputeId: number) {
	const response = await qaHttpClient.get<EvaluationDisputeDetailResponse>(
		`/disputes/${disputeId}`
	);

	return normalizeDisputeDetail(response.data);
}
