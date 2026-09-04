import type { Agent } from './agents';
import type { MockConversation } from './conversations';
import type { QuestionAnswerType, QuestionOption } from './forms';
import type { ListQueryParams } from './shared';

export type EvaluatorType = 'AI' | 'HUMAN';
export type EvaluationStatus = 'DRAFT' | 'COMPLETED';
export type AiEvaluationStatus =
	| 'PENDING'
	| 'PROCESSING'
	| 'COMPLETED'
	| 'FAILED';
export type AiEvaluationErrorType =
	| 'TIMEOUT'
	| 'PROVIDER_ERROR'
	| 'MALFORMED_RESPONSE'
	| 'VALIDATION_ERROR'
	| 'NOT_CONFIGURED'
	| 'UNKNOWN';

export interface EvaluationListQueryParams extends ListQueryParams {
	campaignId?: number;
	agentId?: number;
	status?: EvaluationStatus;
	formId?: number;
	evaluatorType?: EvaluatorType;
	evaluatorAgentId?: number;
	aiEvaluationStatus?: AiEvaluationStatus;
	interactionRef?: string;
	sortBy?:
		| 'id'
		| 'status'
		| 'formName'
		| 'evaluatorType'
		| 'agentId'
		| 'evaluatorAgentId'
		| 'aiEvaluationStatus'
		| 'overallScorePct'
		| 'evaluatedAt'
		| 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Evaluation {
	id: number;
	agentId: number;
	agent?: Agent | null;
	formId: number | null;
	formName: string;
	formCategory?: string | null;
	interactionId?: number | null;
	interactionRef?: string | null;
	campaignId?: number | null;
	evaluatorType: EvaluatorType;
	evaluatorUserId?: number | null;
	evaluatorAgentId?: number | null;
	evaluatorAgentName?: string | null;
	aiEvaluationStatus?: AiEvaluationStatus | null;
	aiEvaluationError?: string | null;
	aiEvaluationErrorType?: AiEvaluationErrorType | null;
	parentEvaluationId?: number | null;
	rootEvaluationId?: number | null;
	version: number;
	status: EvaluationStatus;
	maxScore?: number | null;
	overallScore?: number | null;
	overallScorePct?: number | null;
	evaluatedAt?: string | null;
	createdAt?: string;
	updatedAt?: string;

	// QA Aspect
	qaScore?: number | null;
	qaMethod?: 'STANDARD' | 'COPC' | null;
	qaDetails?: {
		errorCriticoBusiness?: number | null;
		errorCriticoNonBusiness?: number | null;
		errorCriticoCompliance?: number | null;
		errorCriticoEndUser?: number | null;
	} | null;

	// Sentiment & Emotion Aspect
	sentimentScore?: number | null;
	sentiment?: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive' | null;
	emotions?: string[] | null;
	forecastNps?: number | null;

	// Compliance Aspect
	complianceScore?: number | null;
	complianceCategories?: {
		security?: string[];
		regulatory?: string[];
		legal?: string[];
	} | null;

	// Business Insights Aspect
	businessInsights?: string[] | null;

	// Markers & Feedback
	markerIds?: number[] | null;

	// Alert Configuration
	triggeredByAlertConfiguration?: number | null;
}

export interface EvaluationAnswer {
	id: number;
	evaluationId: number;
	evaluationQuestionId: number;
	selectedLabel?: string | null;
	answerValue?: unknown | null;
	awardedScore: number;
}

export interface EvaluationQuestion {
	id: number;
	evaluationId: number;
	originalQuestionId?: number | null;
	groupName: string;
	groupSortOrder: number;
	text: string;
	description?: string | null;
	answerType: QuestionAnswerType;
	options?: QuestionOption[] | null;
	weight: number;
	sortOrder: number;
	answer?: EvaluationAnswer | null;
}

export interface EvaluationDetailResponse extends Evaluation {
	questions: Array<Omit<EvaluationQuestion, 'answer'>>;
	answers: EvaluationAnswer[];
}

export interface EvaluationGroup {
	name: string;
	sortOrder: number;
	questions: EvaluationQuestion[];
}

export interface EvaluationDetail extends Evaluation {
	groups: EvaluationGroup[];
	conversation?: MockConversation | null;
}

export interface CreateEvaluationPayload {
	formId: number;
	agentId: number;
	evaluatorType: EvaluatorType;
	evaluatorUserId?: number;
	interactionRef?: string;
	interactionId?: number;
	campaignId?: number;
}

export interface CreateEvaluationAnswerPayload {
	evaluationQuestionId: number;
	selectedLabel?: string;
	answerValue?: Record<string, unknown>;
}

export interface CreateAiEvaluationPayload {
	formId: number;
	agentId: number;
	evaluatorAgentId: number;
	campaignId?: number;
	interactionRef?: string;
}

export interface AiEvaluationResponse {
	jobId: string;
	evaluationId: number;
	status: AiEvaluationStatus;
}

export interface EvaluationSectionScore {
	name: string;
	score: number;
	maxScore: number;
	scorePct: number;
	answered: number;
	total: number;
}

export interface EvaluationScoreSnapshot {
	overallScore: number;
	overallScorePct: number;
	maxScore: number;
}
