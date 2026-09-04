import type { ListQueryParams } from './shared';

export interface CallMarkerListQueryParams extends ListQueryParams {
	clientId?: number;
	evaluationId?: number;
	conversationId?: number;
	violationType?: string;
	sortBy?: 'id' | 'startTimestamp' | 'violationType' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface CallMarker {
	id: number;
	clientId: number;
	evaluationId: number;
	conversationId: number;

	// Location in transcript
	startTimestamp: number;
	endTimestamp?: number | null;

	transcriptSegmentId?: string | null;
	markedText?: string | null;

	// Violation information
	violationType: string;
	description: string;
	evaluatorComment?: string | null;
	suggestedImprovement?: string | null;

	createdByUserId: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CallMarkerDetail extends CallMarker {
	createdByUserName?: string | null;
	createdByUserEmail?: string | null;
}

export interface CreateCallMarkerPayload {
	evaluationId: number;
	conversationId: number;
	startTimestamp: number;
	endTimestamp?: number;
	transcriptSegmentId?: string;
	markedText?: string;
	violationType: string;
	description: string;
	evaluatorComment?: string;
	suggestedImprovement?: string;
}

export interface UpdateCallMarkerPayload {
	violationType?: string;
	description?: string;
	evaluatorComment?: string;
	suggestedImprovement?: string;
}

// Common violation types
export const VIOLATION_TYPES = {
	POLICY_VIOLATION: 'POLICY_VIOLATION',
	COMPLIANCE_BREACH: 'COMPLIANCE_BREACH',
	POOR_CALL_HANDLING: 'POOR_CALL_HANDLING',
	CUSTOMER_DISSATISFACTION: 'CUSTOMER_DISSATISFACTION',
	MISSED_OPPORTUNITY: 'MISSED_OPPORTUNITY',
	INCORRECT_INFORMATION: 'INCORRECT_INFORMATION',
	PROTOCOL_VIOLATION: 'PROTOCOL_VIOLATION',
	TONE_ISSUE: 'TONE_ISSUE',
} as const;
