import type { CallVoiceSignals } from '~/modules/qa/burnout/types';
import type { FormModality } from '~/modules/qa/forms/types';

// Extracted from burnout-risk-widget campaigns pages
// Unified types for the Campaigns feature

export interface Campaign {
	id: string;
	name: string;
	description: string;
	contactLists: number;
	status: 'pending' | 'active' | 'paused';
	callsScored: number;
	evaluationsCompleted: number;
	evaluationType: 'manual' | 'automatic' | 'mixed';
	createdAt: string;
	type: 'external' | 'cmx';
	/** Set for campaigns created in-app: sales, retention, ... (matches a form category). */
	campaignType?: string;
	/** Evaluation modality and the form the campaign is scored with. */
	modality?: FormModality;
	formId?: string;
}

export interface CampaignDetail {
	id: string;
	name: string;
	type:
		| 'sales'
		| 'localization'
		| 'retention'
		| 'activation'
		| 'accounts-receivable';
	responsibleContact: string;
	description: string;
	evaluatorModel?: string;
}

export interface ContactList {
	id: string;
	name: string;
	callCount: number;
	status: 'completed' | 'in-progress';
	startDate: string;
	endDate: string;
}

export interface Evaluation {
	id: string;
	name: string;
	status: 'active' | 'completed' | 'pending';
	type: 'manual' | 'automatic';
	finalScore: number;
	result: 'passed' | 'failed';
	evaluatedPercentage: number;
	agent: string;
	llmModel: string;
	contactListIds: string[];
	createdDate: string;
}

export interface EvaluationItem {
	id: string;
	name: string;
	errorType: 'critical-business' | 'critical-client' | 'critical-compliance';
	answerType: 'yes-no' | 'yes-no-na';
	description?: string;
	valuation?: number;
}

export interface Aspect {
	id: string;
	name: string;
	description: string;
	items: EvaluationItem[];
}

export interface QATest {
	id: string;
	name: string;
	qaType:
		| 'sales'
		| 'localization'
		| 'retention'
		| 'activation'
		| 'accounts-receivable';
	createdDate: string;
	evaluatedCampaigns: number;
	createdBy: string;
	description?: string;
	aspects?: Aspect[];
	status: 'ready' | 'draft';
}

export interface CallEvaluationResult {
	id: string;
	callId: string;
	filename: string;
	agentName: string;
	aiScore: number;
	finalScore: number;
	delta: number;
	overridden: boolean;
	mode: 'manual' | 'auto';
	evaluatorModel: string;
	evaluatedAt: string;
}

export interface UploadedFile {
	id: string;
	name: string;
	duration: string;
	format: string;
	agentName: string;
}

export interface SelectedQATest {
	id: string;
	name: string;
	qaType: string;
	status: string;
	createdDate: string;
	createdBy: string;
	description?: string;
}

export interface CampaignConfig {
	id: string;
	name: string;
	type: string;
	callDirection?: 'inbound' | 'outbound' | 'mixed';
	responsibleContact: string;
	description: string;
	uploadedFiles: UploadedFile[];
	selectedTests: SelectedQATest[];
	createdAt: string;
	source?: 'external' | 'cmx';
}

import type {
	Emotion,
	SentimentCategory,
} from '~/modules/qa/emotion-sentiment/types';

// ---------- Call detail: evaluation tabs ----------

export type CallEvaluationTab =
	| 'qa'
	| 'sentiment-emotion'
	| 'compliance'
	| 'business-insights';

/** Every tab of the call detail page. ESG is not a dispute type, so it is not part of `CallEvaluationTab`. */
export type CallDetailTab = CallEvaluationTab | 'esg';

export type Speaker = 'agent' | 'customer';

export interface TranscriptTurn {
	id: string;
	speaker: Speaker;
	timestamp: string; // m:ss
	text: string;
}

export interface Evidence {
	timestamp: string; // m:ss
	speaker: Speaker;
	quote: string;
}

// ---------- Call moments (QA findings anchored to the call) ----------

export type CallMomentSource = 'ai' | 'reviewer';
export type CallMomentStatus = 'pending' | 'confirmed' | 'dismissed';

/** A QA finding pinned to the transcript turn where it happens. */
export interface CallMoment {
	id: string;
	callId: string;
	/** QA item the moment supports; null when the reviewer flagged a moment with no item. */
	itemId: string | null;
	/** Display name: the QA item name, or a generic label for reviewer-flagged moments. */
	itemName: string;
	errorType: QAErrorTypeCode;
	turnId: string;
	/** m:ss, same format as `TranscriptTurn.timestamp`. */
	timestamp: string;
	seconds: number;
	speaker: Speaker;
	quote: string;
	source: CallMomentSource;
	status: CallMomentStatus;
	/** Dismiss reason or reviewer note. */
	note: string;
}

// ---------- Timeline anchors (any tab) ----------

/** Tabs whose findings are pinned to the transcript and the player. */
export type AnchorTab = 'qa' | 'sentiment-emotion' | 'compliance';

/** Moments carry their review status; the other tabs only say whether the anchor needs attention. */
export type AnchorStatus = CallMomentStatus | 'neutral' | 'alert';

/** Anything pinned to a transcript turn and to the player timeline, whichever tab it belongs to. */
export interface TimelineAnchor {
	id: string;
	tab: AnchorTab;
	turnId: string;
	/** m:ss, same format as `TranscriptTurn.timestamp`. */
	timestamp: string;
	seconds: number;
	speaker: Speaker;
	/** Short tag shown on the transcript turn. */
	tag: string;
	/** Full description for tooltips and lists. */
	label: string;
	quote: string;
	/** The exact words inside the turn to underline. */
	highlight?: string;
	status: AnchorStatus;
	/** Compliance item the anchor belongs to, so the panel can find it. */
	refKey?: string;
}

// ---------- QA (COPC error types) ----------

export type QAErrorTypeCode = 'ECN' | 'ENC' | 'ECC' | 'ECUF';
export type QAItemAnswer = 'yes' | 'no' | 'na';
export type QAStatus = 'good' | 'warning' | 'critical';

export interface QAErrorTypeScore {
	code: QAErrorTypeCode;
	score: number;
	errorsFound: number;
	itemsEvaluated: number;
	status: QAStatus;
}

export interface QAItemResult {
	id: string;
	name: string;
	errorType: QAErrorTypeCode;
	answer: QAItemAnswer;
	valuation: number;
	awarded: number;
	evidence?: Evidence;
}

export interface QAAspectResult {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	items: QAItemResult[];
}

export interface CallQAEvaluation {
	overallScore: number;
	passed: boolean;
	passThreshold: number;
	autoFailCount: number;
	qaFormName: string;
	errorTypes: QAErrorTypeScore[];
	aspects: QAAspectResult[];
}

// ---------- Sentiment & Emotion ----------

export interface EmotionShare {
	emotion: Emotion;
	percentage: number;
}

export interface SpeakerSentiment {
	overallCategory: SentimentCategory;
	overallScore: number;
	dominantEmotion: Emotion;
	categories: Record<SentimentCategory, number>;
	emotions: EmotionShare[];
}

export interface SentimentRecovery {
	startCategory: SentimentCategory;
	startScore: number;
	lowestCategory: SentimentCategory;
	lowestScore: number;
	lowestAt: string;
	endCategory: SentimentCategory;
	endScore: number;
	recovered: boolean;
	recoveryTimeSeconds: number;
	improvementDelta: number;
}

export interface EmpathyIndicator {
	timestamp: string;
	phrase: string;
	context: string;
}

export interface AgentTone {
	polite: number;
	professional: number;
	empathetic: number;
	consistency: number;
}

export interface SpeechPatterns {
	talkTimeRatio: { agent: number; customer: number };
	silenceCount: number;
	totalSilenceSeconds: number;
	longestSilenceSeconds: number;
	avgResponseLatencySeconds: number;
	interruptions: { byAgent: number; byCustomer: number };
	agentWordsPerMinute: number;
}

export type BurnoutLevel = 'low' | 'medium' | 'high';

export interface BurnoutSignal {
	key: string;
	/** The variable measured on this call, e.g. "Longest silence". */
	label: string;
	/** Whether the measured value crossed the limit that flags it. */
	detected: boolean;
	/** What was measured on this call. */
	value: number;
	/** Unit shown after the value: "s", "wpm", "times", "%" or "/ 100". */
	unit: string;
	/** The condition that flags the variable, e.g. "above 5 s". */
	rule: string;
}

/** Burnout indicators read from the agent's voice and behaviour on this one call. */
export interface AgentBurnoutRisk {
	level: BurnoutLevel;
	/** 0-100, the higher the riskier. */
	score: number;
	signals: BurnoutSignal[];
	recommendation: string;
}

export type SentimentAnchorKind =
	| 'emotion'
	| 'negativeLanguage'
	| 'hostileTone'
	| 'empathy';

/** Where the voice and text analysis found an emotion, negative wording or a hostile tone. */
export interface SentimentAnchor {
	kind: SentimentAnchorKind;
	/** m:ss of the transcript turn it happens in. */
	timestamp: string;
	speaker: Speaker;
	/** What was detected, e.g. "Frustration" or "Hostile tone". */
	label: string;
	/** How the analysis read it, e.g. "Raised voice, clipped delivery". */
	note?: string;
	/** The exact words inside the turn that carry it. */
	highlight?: string;
	emotion?: Emotion;
}

export interface CallSentimentEvaluation {
	agent: SpeakerSentiment;
	customer: SpeakerSentiment;
	recovery: SentimentRecovery;
	empathyIndicators: EmpathyIndicator[];
	/** Emotions, negative wording and hostile tone, pinned to the transcript. */
	anchors: SentimentAnchor[];
	tone: AgentTone;
	speech: SpeechPatterns;
	burnout: AgentBurnoutRisk;
}

// ---------- Compliance ----------

export type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';
export type ComplianceItemStatus = 'compliant' | 'warning' | 'violation';

export interface ComplianceItemResult {
	key: string;
	label: string;
	status: ComplianceItemStatus;
	score: number;
	note?: string;
	evidence?: Evidence;
}

export interface ComplianceAreaResult {
	key: ComplianceAreaKey;
	score: number;
	items: ComplianceItemResult[];
}

export interface CallComplianceEvaluation {
	overallScore: number;
	status: ComplianceItemStatus;
	violationCount: number;
	warningCount: number;
	areas: ComplianceAreaResult[];
}

// ---------- ESG ----------

export type EsgPillarKey = 'environmental' | 'social' | 'governance';

export interface EsgPillarResult {
	key: EsgPillarKey;
	score: number;
	items: ComplianceItemResult[];
}

/** Same shape and status scale as compliance, grouped by ESG pillar instead of compliance area. */
export interface CallEsgEvaluation {
	overallScore: number;
	status: ComplianceItemStatus;
	violationCount: number;
	warningCount: number;
	pillars: EsgPillarResult[];
}

// ---------- Business Insights ----------

export type BusinessSignalType =
	| 'EARLY_OBJECTION'
	| 'UNHANDLED_OBJECTION'
	| 'COMPETITOR_PLUS_COST'
	| 'MISTARGETED_OFFER'
	| 'BEST_TIME_FRAME';

export type NonConversionReasonKey =
	| 'priceTooHigh'
	| 'noNeed'
	| 'distrustQuality'
	| 'thirdPartyDecision'
	| 'installationRequirements'
	| 'other';

export interface BusinessSignalResult {
	type: BusinessSignalType;
	detected: boolean;
	evidence?: Evidence;
	note?: string;
}

export interface BusinessOutcome {
	converted: boolean;
	offerPresented: string;
	nonConversionReason?: NonConversionReasonKey;
	competitorMentioned?: string;
	bestTimeFrame?: string;
	followUpRecommended: boolean;
}

export interface CallBusinessEvaluation {
	signals: BusinessSignalResult[];
	outcome: BusinessOutcome;
}

// ---------- Aggregate ----------

export interface CallEvaluationDetail {
	callId: string;
	fileName: string;
	agentName: string;
	/** Roster id of the agent, used to pre-fill coaching flows. */
	agentId: string;
	/** What the voice analysis read from the agent's side of this call. */
	agentVoice: CallVoiceSignals;
	customerName: string;
	customerId: string;
	date: string;
	durationSeconds: number;
	direction: 'inbound' | 'outbound';
	transcript: TranscriptTurn[];
	qa: CallQAEvaluation;
	sentiment: CallSentimentEvaluation;
	compliance: CallComplianceEvaluation;
	business: CallBusinessEvaluation;
	esg: CallEsgEvaluation;
}
