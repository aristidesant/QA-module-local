export type ConfigStatus = 'ACTIVE' | 'INACTIVE';

export type CallAnalysisLanguage = 'AUTO' | 'es' | 'en';
export type CallAnalysisKind = 'QA' | 'COMPLIANCE' | 'SENTIMENT' | 'BUSINESS';

export interface CallAnalysisConfig {
	language: CallAnalysisLanguage;
	diarization: boolean;
	redactPii: boolean;
	piiFields: string[];
	analyses: CallAnalysisKind[];
	minDurationSeconds: number;
	audioRetentionDays: number;
	updatedAt: string;
}

export type EvaluationFormat = 'STANDARD' | 'COPC';

export interface EvaluationConfig {
	version: number;
	format: EvaluationFormat;
	defaultFormId: string | null;
	primaryEvaluatorId: string | null;
	fallbackEvaluatorId: string | null;
	updatedAt: string;
}

export interface EvaluationVersion {
	version: number;
	savedAt: string;
	savedBy: string;
	summary: string;
}

export interface EvaluatorOption {
	id: string;
	name: string;
	code: string;
}

export type RuleScope = 'CLIENT' | 'CAMPAIGN_TYPE' | 'CAMPAIGN';
export type RuleAgentType = 'ALL' | 'HUMAN' | 'AI';

export interface ContextRule {
	id: string;
	topic: string;
	scope: RuleScope;
	target: string;
	agentType: RuleAgentType;
	context: string;
	status: ConfigStatus;
	updatedAt: string;
}

export interface ProtocolDocument {
	id: string;
	name: string;
	lineOfBusiness: string;
	version: number;
	uploadedAt: string;
}

export interface CampaignTypeEntry {
	code: string;
	name: string;
	description: string | null;
	status: ConfigStatus;
	locked?: boolean;
	updatedAt: string;
}

/** A mock campaign the context-rule scopes can point at. */
export interface CampaignRef {
	id: string;
	name: string;
	campaignType: string;
}

export type NamingToken =
	| 'source-campaign-id'
	| 'date-time'
	| 'source-agent-id'
	| 'dialed-number'
	| 'direction'
	| 'customer-name'
	| 'customer-id';

export type NamingSeparator = '_' | '-' | '.';
export type DateTimeFormat =
	| 'YYYYMMDD-HHmmss'
	| 'YYYYMMDDHHmmss'
	| 'YYYY-MM-DD_HH-mm-ss';

export interface NamingConvention {
	separator: NamingSeparator;
	tokens: NamingToken[];
	dateTimeFormat: DateTimeFormat;
	sampleFilename: string;
	updatedAt: string;
}

export interface ParsedField {
	token: NamingToken;
	raw: string | null;
	transformed: string | null;
	ok: boolean;
}

export type ScaleType =
	| 'QA'
	| 'COMPLIANCE'
	| 'SENTIMENT'
	| 'BUSINESS'
	| 'COACHING';

/** Bands are sorted ascending by `min`; the last one is open-ended. */
export interface ScaleBand {
	label: string;
	min: number;
}

export interface ScoreScale {
	id: string;
	name: string;
	type: ScaleType;
	bands: ScaleBand[];
	updatedAt: string;
}

export type SentimentLevel =
	| 'VERY_POSITIVE'
	| 'POSITIVE'
	| 'NEUTRAL'
	| 'NEGATIVE'
	| 'VERY_NEGATIVE';

export interface EmotionEntry {
	label: string;
	description: string;
	level: SentimentLevel;
}

export interface SentimentAnalyzerConfig {
	version: number;
	systemPrompt: string;
	classificationInstructions: string;
	emotions: EmotionEntry[];
	updatedAt: string;
}

export type GlobalConfigTab =
	| 'callAnalysis'
	| 'evaluation'
	| 'contextRules'
	| 'campaignTypes'
	| 'namingConvention'
	| 'scoreScales'
	| 'sentiment';
