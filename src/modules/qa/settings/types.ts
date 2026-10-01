import type {
	BurnoutDriverId,
	BurnoutDriverRule,
	CallEmotion,
} from '~/modules/qa/analytics/types';

export type SettingsAspect = 'qa' | 'compliance' | 'sentiment' | 'business';

/** score >= onTarget → good; >= watch → warning; otherwise critical. `onTarget` must exceed `watch`. */
export interface ScoreBands {
	onTarget: number;
	watch: number;
}

export type QaMetricKey = 'overall' | 'ecn' | 'enc' | 'ecc' | 'ecuf';
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
	bands: ScoreBands;
	overrides: Partial<Record<QaMetricKey, ScoreBands>>;
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

export interface SentimentThresholds {
	/** Upper bounds of the first four bands on the 1-5 scale, ascending. Above `positive` is "very positive". */
	cutPoints: SentimentCutPoints;
	/** A call whose sentiment is below this is an incident. */
	lowSentimentIncident: number;
	negativeEmotions: CallEmotion[];
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

export type BurnoutPatternId = BurnoutDriverId;

export interface BurnoutPattern extends Omit<BurnoutDriverRule, 'id'> {
	id: BurnoutPatternId;
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
