import type { ScoreBand } from '~/modules/qa/constants/badgeColors';
import type { CallEmotion } from '~/modules/qa/analytics/types';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type {
	BurnoutSettings,
	ScoreBands,
	SentimentCutPoints,
	SettingsAspect,
	ThresholdSettings,
} from './types';

/** Band of a 0-100 score against one set of bands. */
export const bandFor = (score: number, bands: ScoreBands): ScoreBand =>
	score >= bands.onTarget
		? 'good'
		: score >= bands.watch
			? 'warning'
			: 'critical';

type BandedAspect = Exclude<SettingsAspect, 'sentiment'>;

/** The metric's own bands when it overrides its aspect, otherwise the aspect's. */
export const bandsFor = (
	thresholds: ThresholdSettings,
	aspect: BandedAspect,
	metricKey?: string
): ScoreBands => {
	const section = thresholds[aspect];
	const overrides = section.overrides as Record<string, ScoreBands | undefined>;
	return (metricKey && overrides[metricKey]) || section.bands;
};

export type ComplianceStatus = 'compliant' | 'warning' | 'violation';

export const complianceStatusFor = (
	score: number,
	bands: ScoreBands
): ComplianceStatus => {
	const band = bandFor(score, bands);
	return band === 'good'
		? 'compliant'
		: band === 'warning'
			? 'warning'
			: 'violation';
};

/** Index 0-4 of the sentiment band a 1-5 score falls in (very negative … very positive). */
export const sentimentBandIndex = (
	score: number,
	cutPoints: SentimentCutPoints
): number => {
	const bounds = [
		cutPoints.veryNegative,
		cutPoints.negative,
		cutPoints.neutral,
		cutPoints.positive,
	];
	const index = bounds.findIndex((max) => score < max);
	return index === -1 ? bounds.length : index;
};

export const isNegativeEmotionIn = (
	emotion: CallEmotion,
	negativeEmotions: CallEmotion[]
) => negativeEmotions.includes(emotion);

export const burnoutLevelFor = (
	breachedCount: number,
	level: BurnoutSettings['level']
): BurnoutRiskLevel =>
	breachedCount >= level.highAt
		? BurnoutRiskLevel.HIGH
		: breachedCount >= level.mediumAt
			? BurnoutRiskLevel.MEDIUM
			: BurnoutRiskLevel.LOW;

/** Validation messages are i18n keys under `qa.settings`; null means valid. */
export const validateBands = (bands: ScoreBands): string | null => {
	if (bands.onTarget <= bands.watch) return 'validation.bandsOrder';
	if (bands.watch < 0 || bands.onTarget > 100) return 'validation.bandsRange';
	return null;
};

export const validateCutPoints = (c: SentimentCutPoints): string | null => {
	if (
		!(
			c.veryNegative < c.negative &&
			c.negative < c.neutral &&
			c.neutral < c.positive
		)
	)
		return 'validation.cutPointsOrder';
	if (c.veryNegative < 1 || c.positive > 5) return 'validation.cutPointsRange';
	return null;
};

export const validateLevelRule = (
	level: BurnoutSettings['level'],
	enabledCount: number
): string | null => {
	if (level.highAt <= level.mediumAt) return 'validation.levelOrder';
	if (level.highAt > enabledCount) return 'validation.levelAboveEnabled';
	return null;
};
