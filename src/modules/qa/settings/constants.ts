import type {
	BurnoutDriverRule,
	CallEmotion,
} from '~/modules/qa/analytics/types';
import type {
	BurnoutPattern,
	BusinessSignalKey,
	QaSettings,
	SettingsAspect,
} from './types';

/** The five trailing-window drivers plus the negative-emotion streak, as seeded in Settings. */
export const DEFAULT_BURNOUT_RULES: BurnoutDriverRule[] = [
	{
		id: 'AGENT_SENTIMENT_TREND',
		metricId: 'AGENT_SENTIMENT_SCORE',
		conditionLabelKey: 'burnout.driverConditions.declinePts',
		threshold: -0.3,
		nearBand: 0.15,
		direction: 'BELOW',
		evaluate: 'DELTA',
	},
	{
		id: 'NEGATIVE_EMOTION_7D',
		metricId: 'NEGATIVE_EMOTION_CALL_SHARE',
		conditionLabelKey: 'burnout.driverConditions.aboveShare',
		threshold: 30,
		nearBand: 8,
		direction: 'ABOVE',
		evaluate: 'VALUE',
	},
	{
		id: 'QA_TREND_14D',
		metricId: 'QA_OVERALL_SCORE',
		conditionLabelKey: 'burnout.driverConditions.declinePct',
		threshold: -5,
		nearBand: 3,
		direction: 'BELOW',
		evaluate: 'DELTA',
	},
	{
		id: 'AFTER_HOURS_30D',
		metricId: 'AFTER_HOURS_SHARE',
		conditionLabelKey: 'burnout.driverConditions.afterHours',
		threshold: 10,
		nearBand: 4,
		direction: 'ABOVE',
		evaluate: 'VALUE',
	},
	{
		id: 'AHT_VS_TEAM_30D',
		metricId: 'AHT_VS_TEAM',
		conditionLabelKey: 'burnout.driverConditions.aboveTeam',
		threshold: 15,
		nearBand: 6,
		direction: 'ABOVE',
		evaluate: 'VALUE',
	},
	{
		id: 'NEGATIVE_EMOTION_STREAK',
		metricId: 'NEGATIVE_EMOTION_CALL_SHARE',
		conditionLabelKey: 'burnout.driverConditions.streakDays',
		threshold: 3,
		nearBand: 1,
		direction: 'ABOVE',
		evaluate: 'VALUE',
	},
];

export const DEFAULT_BURNOUT_PATTERNS: BurnoutPattern[] =
	DEFAULT_BURNOUT_RULES.map((rule) => ({ ...rule, enabled: true }));

export const DEFAULT_NEGATIVE_EMOTIONS: CallEmotion[] = [
	'Anger',
	'Fear',
	'Sadness',
	'Disgust',
];

/** Every emotion a call can carry, in the order the picker lists them. */
export const ALL_CALL_EMOTIONS: CallEmotion[] = [
	'Joy',
	'Trust',
	'Anticipation',
	'Surprise',
	'Anger',
	'Fear',
	'Sadness',
	'Disgust',
];

export const BUSINESS_SIGNAL_KEYS: BusinessSignalKey[] = [
	'earlyObjection',
	'unhandledObjection',
	'competitorPlusCost',
	'mistargetedOffer',
];

/** Values the dashboards used before Settings existed; every consumer defaults to these. */
export const DEFAULT_SETTINGS: QaSettings = {
	thresholds: {
		qa: {
			bands: { onTarget: 90, watch: 70 },
			overrides: {},
			lowScoreIncident: 70,
		},
		compliance: {
			bands: { onTarget: 90, watch: 80 },
			overrides: {},
			areaTargetPerCall: 85,
		},
		sentiment: {
			cutPoints: {
				veryNegative: 1.5,
				negative: 2.5,
				neutral: 3.5,
				positive: 4.5,
			},
			lowSentimentIncident: 2.5,
			negativeEmotions: DEFAULT_NEGATIVE_EMOTIONS,
		},
		business: {
			bands: { onTarget: 30, watch: 20 },
			overrides: {},
			signalAlertShare: {
				earlyObjection: 25,
				unhandledObjection: 20,
				competitorPlusCost: 20,
				mistargetedOffer: 15,
			},
		},
	},
	burnout: {
		patterns: DEFAULT_BURNOUT_PATTERNS,
		level: { mediumAt: 1, highAt: 2 },
	},
};

/** Metrics that can override their aspect's bands, in display order. `labelKey` lives in `qa.settings`. */
export const OVERRIDE_METRICS: Record<
	Exclude<SettingsAspect, 'sentiment'>,
	{ key: string; labelKey: string }[]
> = {
	qa: [
		{ key: 'overall', labelKey: 'metrics.qa.overall' },
		{ key: 'ecn', labelKey: 'metrics.qa.ecn' },
		{ key: 'enc', labelKey: 'metrics.qa.enc' },
		{ key: 'ecc', labelKey: 'metrics.qa.ecc' },
		{ key: 'ecuf', labelKey: 'metrics.qa.ecuf' },
	],
	compliance: [
		{ key: 'overall', labelKey: 'metrics.compliance.overall' },
		{ key: 'Security', labelKey: 'metrics.compliance.security' },
		{ key: 'Regulatory', labelKey: 'metrics.compliance.regulatory' },
		{ key: 'Legal', labelKey: 'metrics.compliance.legal' },
	],
	business: [
		{ key: 'conversionRate', labelKey: 'metrics.business.conversionRate' },
	],
};
