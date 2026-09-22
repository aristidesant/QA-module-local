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

// ---------- Score bands (Performance Score cards + Call Evaluation Detail) ----------
// One 3-tier scale replaces the QA card's own 90/80 split, ComplianceCard's status colors,
// SentimentEmotionCard's 5-tier bands, and call-evaluation's separate 90/80/70/60 scale.

export type ScoreBand = 'good' | 'warning' | 'critical';

export const SCORE_BAND_COLOR: Record<ScoreBand, string> = {
	good: 'green',
	warning: 'yellow',
	critical: 'red',
};

/** `score` is 0-100. Callers on a different scale (e.g. sentiment 0-5) normalize first: `(value / 5) * 100`. */
export const getScoreBand = (score: number): ScoreBand =>
	score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical';

export const getScoreBandColor = (score: number): string =>
	SCORE_BAND_COLOR[getScoreBand(score)];
