export type SentimentCauseFamily = 'BUSINESS' | 'AGENT';

export type SentimentCauseKey =
	| 'WAIT_TIME'
	| 'PRICING_BILLING'
	| 'TECHNICAL_FAILURE'
	| 'PROCESS_POLICY'
	| 'BROKEN_PROMISE'
	| 'AGENT_TONE'
	| 'LACK_OF_EMPATHY'
	| 'INTERRUPTIONS'
	| 'WRONG_INFORMATION';

/** Segment and filter key: a cause, or 'none' for calls whose sentiment never dropped. */
export type SentimentCauseSegmentKey = SentimentCauseKey | 'none';

export type SentimentCauseReviewStatus = 'pending' | 'confirmed' | 'corrected';

/** Key of a cause the QA Manager added in Settings. The AI never assigns these; a reviewer picks them when correcting a call. */
export type CustomCauseKey = `custom-${string}`;

/** A built-in cause or one added in Settings. Only the call review deals with the second kind. */
export type AnyCauseKey = SentimentCauseKey | CustomCauseKey;

/** A cause added in Settings. It cannot be deleted, only switched off, so reviewed calls never point at nothing. */
export interface CustomSentimentCause {
	key: CustomCauseKey;
	name: string;
	family: SentimentCauseFamily;
	/** What the AI looks for in a call to assign this cause. Required: without it the model has only a name to go on. */
	description: string;
}

/** What the QA Manager tunes in Settings for their operation; the catalogue itself lives in Global configuration. */
export interface SentimentCauseSettings {
	/** A drop of at least this many points reads as strong (red badge on the call). */
	strongDrop: number;
	/** Causes switched off: no longer offered when correcting a call or in the filters. */
	disabled: AnyCauseKey[];
	/** Replacement display names; a missing or blank entry falls back to the default (translated for built-ins, `custom.name` for added ones). */
	names: Partial<Record<AnyCauseKey, string>>;
}

/** The catalogue the super admin manages in Global configuration: shared by every client and versioned with the sentiment analyzer. */
export interface SentimentCauseCatalogue {
	/** Replacement AI guidance for the built-in causes; a missing or blank entry falls back to the translated default. */
	descriptions: Partial<Record<SentimentCauseKey, string>>;
	/** Causes added on top of the built-in nine, offered only when a reviewer corrects a call. */
	custom: CustomSentimentCause[];
}

/** The transcript turn the analysis points at. Null on analytics calls, which have no transcript. */
export interface SentimentCauseEvidence {
	/** m:ss, same format as `TranscriptTurn.timestamp`. */
	timestamp: string;
	speaker: 'agent' | 'customer';
	quote: string;
}

/** Why the customer's sentiment dropped on one call, as read by the AI. */
export interface CallSentimentCause {
	primary: SentimentCauseKey;
	/** 0-2 contributing causes, never repeating `primary`. Aggregations ignore them. */
	secondary: SentimentCauseKey[];
	/** How far the customer's sentiment fell from the call's start, 1-5 scale, one decimal. */
	sentimentDrop: number;
	evidence: SentimentCauseEvidence | null;
}

/** What a supervisor or QA Manager decided about the AI-detected primary cause of one call. */
export interface SentimentCauseReview {
	status: SentimentCauseReviewStatus;
	/** The replacement cause; present only when `status` is 'corrected'. */
	correctedTo?: AnyCauseKey;
	/** ISO datetime. */
	reviewedAt: string;
}

// ---------- Aggregations (Team Analytics) ----------

export interface CauseRankingRow {
	key: SentimentCauseKey;
	family: SentimentCauseFamily;
	/** Calls whose primary cause is this one. */
	calls: number;
	/** % of the calls with a drop, one decimal. */
	share: number;
	/** Mean `sentimentDrop` of those calls; null when there are none. */
	meanDrop: number | null;
	previousCalls: number;
	/** Null when no previous period was given. */
	previousShare: number | null;
	/** share − previousShare, in points; null without a previous period. */
	delta: number | null;
}

/** One period; one column per cause key in `CauseTrend.topKeys` (0 when none). */
export interface CauseTrendPoint {
	period: string;
	[causeKey: string]: number | string;
}

export interface CauseTrend {
	points: CauseTrendPoint[];
	/** Most frequent primary causes, biggest first. */
	topKeys: SentimentCauseKey[];
}

export interface FamilyShareRow {
	family: SentimentCauseFamily;
	count: number;
	share: number;
}
