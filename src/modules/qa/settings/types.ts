import type { BurnoutDriverRule } from '~/modules/qa/analytics/types';

export type SettingsAspect = 'qa' | 'compliance' | 'sentiment' | 'business';

/** score >= onTarget → good; >= watch → warning; otherwise critical. `onTarget` must exceed `watch`. */
export interface ScoreBands {
	onTarget: number;
	watch: number;
}

/** The COPC categories; the standard QA score has its own `scoreBands`. */
export type QaMetricKey = 'ecn' | 'enc' | 'ecc' | 'ecuf';
export type ComplianceMetricKey =
	| 'overall'
	| 'Security'
	| 'Regulatory'
	| 'Legal';
export type BusinessMetricKey = 'conversionRate';
export type BusinessSignalKey =
	| 'earlyObjection'
	| 'unhandledObjection'
	| 'competitorPlusCost'
	| 'mistargetedOffer';

export interface QaThresholds {
	/** Bands of the standard QA score (0-100 average). */
	scoreBands: ScoreBands;
	/** Each COPC category (ECN, ENC, ECC, ECUF) is measured on its own, so it has its own bands. */
	categoryBands: Record<QaMetricKey, ScoreBands>;
	/** A call whose QA score is below this is an incident. */
	lowScoreIncident: number;
}

export interface ComplianceThresholds {
	bands: ScoreBands;
	overrides: Partial<Record<ComplianceMetricKey, ScoreBands>>;
	/** An area passes on a call when its score is at or above this. */
	areaTargetPerCall: number;
}

export interface SentimentCutPoints {
	veryNegative: number;
	negative: number;
	neutral: number;
	positive: number;
}

export type SentimentBandKey =
	| 'veryNegative'
	| 'negative'
	| 'neutral'
	| 'positive'
	| 'veryPositive';

export interface SentimentThresholds {
	/** Upper bounds of the first four bands on the 1-5 scale, ascending. Above `positive` is "very positive". */
	cutPoints: SentimentCutPoints;
	/** A call whose sentiment is below this is an incident. */
	lowSentimentIncident: number;
	/** Which emotions belong to each sentiment type. Very negative + Negative are the "negative" emotions. */
	emotionsBySentiment: Record<SentimentBandKey, string[]>;
}

export interface BusinessThresholds {
	/** Conversion rate bands. */
	bands: ScoreBands;
	overrides: Partial<Record<BusinessMetricKey, ScoreBands>>;
	/** A signal's share of calls at or above this is flagged. */
	signalAlertShare: Record<BusinessSignalKey, number>;
}

export interface ThresholdSettings {
	qa: QaThresholds;
	compliance: ComplianceThresholds;
	sentiment: SentimentThresholds;
	business: BusinessThresholds;
}

/** A burnout rule plus how Settings presents it. Built-ins can be switched off but not removed. */
export interface BurnoutPattern extends BurnoutDriverRule {
	/** Name of a pattern the QA Manager created; built-ins are named from i18n. */
	name?: string;
	builtIn: boolean;
	enabled: boolean;
}

export interface BurnoutSettings {
	patterns: BurnoutPattern[];
	/** Risk level by number of breached, enabled patterns. `highAt` must exceed `mediumAt`. */
	level: { mediumAt: number; highAt: number };
}

export interface QaSettings {
	thresholds: ThresholdSettings;
	burnout: BurnoutSettings;
}
