import type {
	EvaluationDetail,
	EvaluationDetailResponse,
	EvaluationScoreSnapshot,
	EvaluatorType,
} from './evaluations';

export interface CreateEvaluationDisputeAnswerPayload {
	evaluationQuestionId: number;
	selectedLabel?: string;
	answerValue?: unknown;
}

export interface CreateEvaluationDisputePayload {
	reason: string;
	answers: CreateEvaluationDisputeAnswerPayload[];
}

export interface EvaluationDisputeSummary {
	id: number;
	sourceEvaluationId: number;
	resultingEvaluationId: number;
	sourceVersion?: number | null;
	sourceEvaluatorType?: EvaluatorType | null;
	sourceFormName?: string | null;
	sourceAgentName?: string | null;
	sourceEvaluatorAgentName?: string | null;
	sourceEvaluatorUserName?: string | null;
	sourceCampaignName?: string | null;
	sourceInteractionRef?: string | null;
	resultingEvaluatorType?: EvaluatorType | null;
	resultingFormName?: string | null;
	resultingAgentName?: string | null;
	resultingEvaluatorAgentName?: string | null;
	resultingEvaluatorUserName?: string | null;
	resultingCampaignName?: string | null;
	resultingInteractionRef?: string | null;
	disputedByUserId: number | null;
	disputedByUserName?: string | null;
	reason: string;
	before: EvaluationScoreSnapshot;
	after: EvaluationScoreSnapshot;
	scoreDelta: number;
	resultingVersion: number;
	createdAt: string;
}

export interface EvaluationDisputeDetailResponse extends EvaluationDisputeSummary {
	source: EvaluationDetailResponse;
	resulting: EvaluationDetailResponse;
}

export interface EvaluationDisputeDetail extends Omit<
	EvaluationDisputeDetailResponse,
	'source' | 'resulting'
> {
	source: EvaluationDetail;
	resulting: EvaluationDetail;
}

export interface EvaluationDisputeListQueryParams {
	supervisorIds?: number[];
	agentIds?: number[];
	campaignIds?: number[];
	createdAtFrom?: string;
	createdAtTo?: string;
	sortBy?: 'createdAt' | 'scoreDelta';
	orderBy?: 'ASC' | 'DESC';
	page?: number;
	limit?: number;
}
