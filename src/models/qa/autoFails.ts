import type { ListQueryParams } from './shared';

export type AutoFailSeverity = 'SECTION_INVALIDATION' | 'EVALUATION_INVALIDATION';

export interface AutoFailListQueryParams extends ListQueryParams {
	formId?: number;
	questionId?: number;
	sortBy?: 'id' | 'formId' | 'severity' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface AutoFail {
	id: number;
	formId: number;
	questionId: number;
	severity: AutoFailSeverity;
	affectedSection?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface AutoFailMetric {
	evaluationId: number;
	campaignId?: number;
	count: number;
	failedQuestions?: number[];
	invalidatedSections?: string[];
	evaluationInvalidated?: boolean;
}

export interface AutoFailCountByEvaluation {
	evaluationId: number;
	autoFailCount: number;
	isCritical: boolean;
}

export interface AutoFailCountByCampaign {
	campaignId: number;
	campaignName: string;
	totalAutoFails: number;
	evaluationsAffected: number;
	averagePerEvaluation: number;
}

export interface CreateAutoFailPayload {
	formId: number;
	questionId: number;
	severity: AutoFailSeverity;
	affectedSection?: string;
}

export interface UpdateAutoFailPayload {
	severity?: AutoFailSeverity;
	affectedSection?: string | null;
}
