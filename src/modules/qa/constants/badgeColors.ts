import type {
	AgentType,
	AiEvaluationStatus,
	CampaignStatus,
	ConversationMediaType,
	EvaluationStatus,
	EvaluatorType,
	HealthStatus,
	LlmProvider,
	LlmProviderHealthStatus,
	TranscriptionStatus,
} from '~/models/qa';

/**
 * Single source of truth for badge color mappings (Mantine color names).
 * Chart palettes (theme-token shades like 'newtechGreen.6') are a different
 * concern and stay colocated with their charts (see DashboardPage.constants).
 */

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
	ACTIVE: 'green',
	INACTIVE: 'gray',
};

export const EVALUATION_STATUS_COLORS: Record<EvaluationStatus, string> = {
	COMPLETED: 'green',
	DRAFT: 'yellow',
};

export const AI_EVALUATION_STATUS_COLORS: Record<AiEvaluationStatus, string> = {
	PENDING: 'gray',
	PROCESSING: 'blue',
	COMPLETED: 'green',
	FAILED: 'red',
};

export const TRANSCRIPTION_STATUS_COLORS: Record<TranscriptionStatus, string> =
	{
		PENDING: 'gray',
		PROCESSING: 'blue',
		COMPLETED: 'green',
		FAILED: 'red',
	};

export const PROVIDER_COLORS: Record<LlmProvider, string> = {
	OPENAI: 'teal',
	GEMINI: 'blue',
	BEDROCK: 'orange',
};

export const PROVIDER_HEALTH_STATUS_COLORS: Record<
	LlmProviderHealthStatus,
	string
> = {
	ok: 'green',
	error: 'red',
	disabled: 'gray',
};

export const OVERALL_HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
	ok: 'green',
	degraded: 'yellow',
	error: 'red',
};

export const AGENT_TYPE_COLORS: Record<AgentType, string> = {
	AI_BOT: 'violet',
	HUMAN: 'blue',
};

export const EVALUATOR_TYPE_COLORS: Record<EvaluatorType, string> = {
	AI: 'violet',
	HUMAN: 'blue',
};

export function getCampaignStatusColor(status: CampaignStatus) {
	return CAMPAIGN_STATUS_COLORS[status];
}

export function getActiveStatusColor(isActive: boolean) {
	return isActive ? 'green' : 'gray';
}

export function getMediaTypeColor(mediaType?: ConversationMediaType | null) {
	return mediaType === 'AUDIO' ? 'blue' : 'gray';
}
