export type ElevenLabsLlmStatus = 'ACTIVE' | 'INACTIVE';

export interface ElevenLabsLlmDeprecationInfo {
	llm: string;
	isDeprecated: boolean;
	isInWarningPeriod: boolean;
	isInFallbackPeriod: boolean;
	fallbackPercentage: number;
	providerDeprecationDate: string | null;
	replacementModel: string | null;
	deprecationConfig: Record<string, unknown> | null;
}

export interface ElevenLabsLlm {
	id: number;
	llm: string;
	status: ElevenLabsLlmStatus;
	isManuallyDisabled: boolean;
	isCheckpoint: boolean;
	maxTokensLimit: number | null;
	maxContextLimit: number | null;
	supportsImageInput: boolean;
	supportsDocumentInput: boolean;
	supportsParallelToolCalls: boolean;
	availableReasoningEfforts: string[] | null;
	deprecationInfo: ElevenLabsLlmDeprecationInfo | null;
	regionalProcessingSurcharge: {
		multiplier: number;
	} | null;
	lastSeenAt: string | null;
	lastSyncedAt: string | null;
}

export interface ElevenLabsLlmFilters {
	status?: ElevenLabsLlmStatus;
	search?: string;
}

export interface ElevenLabsLlmStatusUpdate {
	status: ElevenLabsLlmStatus;
}

export interface ElevenLabsLlmSyncResponse {
	synchronizedAt: string;
	providerModelCount: number;
	insertedCount: number;
	updatedCount: number;
	activatedCount: number;
	deactivatedCount: number;
	preservedManualDisableCount: number;
	unchangedCount: number;
	defaultDeprecationConfig: {
		warningStartDays: number;
		fallbackStartDays: number;
		fallbackCompleteDays: number;
		fallbackStartPercentage: number;
		fallbackCompletePercentage: number;
	};
}
