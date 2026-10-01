import type { CallEmotion } from '~/modules/qa/analytics/types';
import type {
	BurnoutPattern,
	BusinessSignalKey,
	QaSettings,
	SentimentBandKey,
	SettingsAspect,
} from './types';

/** Patterns every install starts with. They behave like any other pattern but can't be deleted. */
export const DEFAULT_BURNOUT_PATTERNS: BurnoutPattern[] = [
	{
		id: 'AGENT_SENTIMENT_TREND',
		metricId: 'AGENT_SENTIMENT_SCORE',
		mode: 'DELTA',
		windowDays: 14,
		direction: 'BELOW',
		threshold: -0.3,
		nearBand: 0.15,
		builtIn: true,
		enabled: true,
	},
	{
		id: 'NEGATIVE_EMOTION_7D',
		metricId: 'NEGATIVE_EMOTION_CALL_SHARE',
		mode: 'VALUE',
		windowDays: 7,
		direction: 'ABOVE',
		threshold: 30,
		nearBand: 8,
		builtIn: true,
		enabled: true,
	},
	{
		id: 'QA_TREND_14D',
		metricId: 'QA_OVERALL_SCORE',
		mode: 'DELTA',
		windowDays: 14,
		direction: 'BELOW',
		threshold: -5,
		nearBand: 3,
		builtIn: true,
		enabled: true,
	},
	{
		id: 'AHT_VS_TEAM_30D',
		metricId: 'AHT_VS_TEAM',
		mode: 'VALUE',
		windowDays: 30,
		direction: 'ABOVE',
		threshold: 15,
		nearBand: 6,
		builtIn: true,
		enabled: true,
	},
	{
		id: 'NEGATIVE_EMOTION_STREAK',
		metricId: 'AGENT_NEGATIVE_EMOTION_SHARE',
		mode: 'STREAK',
		windowDays: 30,
		direction: 'ABOVE',
		threshold: 3,
		dayLevel: 50,
		nearBand: 1,
		builtIn: true,
		enabled: true,
	},
];

/** Label of each built-in pattern, in `qa.teamAnalytics` `burnout.drivers.*`. */
export const BUILT_IN_PATTERN_LABEL_KEY: Record<string, string> = {
	AGENT_SENTIMENT_TREND: 'agentSentimentTrend',
	NEGATIVE_EMOTION_7D: 'negativeEmotionShare',
	QA_TREND_14D: 'qaScoreTrend',
	AHT_VS_TEAM_30D: 'ahtVsTeam',
	NEGATIVE_EMOTION_STREAK: 'negativeEmotionStreak',
};

/** Same split the dashboards used before it was configurable: negative = Anger, Fear, Sadness, Disgust; positive = Joy, Trust, Anticipation. */
export const DEFAULT_EMOTIONS_BY_SENTIMENT: Record<SentimentBandKey, string[]> =
	{
		veryNegative: ['Anger', 'Disgust'],
		negative: ['Fear', 'Sadness'],
		neutral: ['Surprise'],
		positive: ['Trust', 'Anticipation'],
		veryPositive: ['Joy'],
	};

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
			scoreBands: { onTarget: 90, watch: 70 },
			categoryBands: {
				ecn: { onTarget: 90, watch: 70 },
				enc: { onTarget: 90, watch: 70 },
				ecc: { onTarget: 90, watch: 70 },
				ecuf: { onTarget: 90, watch: 70 },
			},
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
			emotionsBySentiment: DEFAULT_EMOTIONS_BY_SENTIMENT,
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
	Exclude<SettingsAspect, 'sentiment' | 'qa'>,
	{ key: string; labelKey: string }[]
> = {
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
