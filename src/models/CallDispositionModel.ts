export interface CallDispositionModel {
	// Core identifiers
	id: number;
	clientId?: number; // API includes clientId
	conversationId: number;

	// Optional relational identifiers (present in other contexts/endpoints)
	contactId?: number;
	agentId?: string;
	campaignId?: number;

	// Disposition details
	dispositionName: string;
	dispositionDescription: string;
	contactOutcome?: string;
	callStatus?: string; // e.g., "NEUTRAL" (keep string to allow backend variants)

	// Scheduling/flags
	requiresReschedule?: boolean;
	/** Seconds to reschedule, e.g., 1800 = 30 minutes */
	rescheduleTime?: number;
	isInvalidatesNumber?: boolean;
	isFinal?: boolean;
	isVoiceMail?: boolean;
	isAbandoned: boolean;

	// Notes/metadata
	notes?: string | null;
	aiMetadata?: Record<string, unknown>;

	// Timestamps
	createdAt: string; // ISO string
	updatedAt?: string; // ISO string
	deletedAt?: string | null; // ISO string or null when not deleted

	// Allow additional backend-provided fields without losing type safety
	[key: string]: unknown;
}

export interface CallDispositionFilters {
	conversationId?: string;
	dispositionName?: string;
	dispositionDescription?: string;
	notes?: string;
	campaignId?: number;
	agentId?: string;
	isAbandoned?: boolean;
}
