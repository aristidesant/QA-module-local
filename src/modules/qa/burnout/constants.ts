import type { TriggerMetricId } from '~/models/qa';
import type {
	BurnoutThresholds,
	CallVoiceSignals,
	VoiceFamily,
	VoiceSignalDef,
	VoiceSignalKey,
} from './types';

export const VOICE_FAMILIES: VoiceFamily[] = [
	'acoustic',
	'tempo',
	'lexical',
	'cognitive',
];

/**
 * The signals the voice analysis reads from the agent's side of every call.
 * `worse` says which direction hurts: a flat voice is LOWER pitch variability, more pauses is HIGHER.
 */
export const VOICE_SIGNALS: VoiceSignalDef[] = [
	// ---- Acoustic
	{
		key: 'pitchVariability',
		family: 'acoustic',
		dimension: 'exhaustion',
		unit: 'st',
		worse: 'lower',
		decimals: 1,
		confidence: 'high',
		typical: 3.2,
		defaultWeight: 4,
		defaultThreshold: 1.8,
		defaultDeviationPct: 25,
	},
	{
		key: 'vocalEnergy',
		family: 'acoustic',
		dimension: 'exhaustion',
		unit: '/ 100',
		worse: 'lower',
		decimals: 0,
		confidence: 'high',
		typical: 62,
		defaultWeight: 4,
		defaultThreshold: 40,
		defaultDeviationPct: 20,
	},
	{
		key: 'breathiness',
		family: 'acoustic',
		dimension: 'exhaustion',
		unit: '%',
		worse: 'higher',
		decimals: 0,
		confidence: 'medium',
		typical: 14,
		defaultWeight: 2,
		defaultThreshold: 30,
		defaultDeviationPct: 40,
	},
	{
		key: 'sighs',
		family: 'acoustic',
		dimension: 'exhaustion',
		unit: '/ min',
		worse: 'higher',
		decimals: 1,
		confidence: 'medium',
		typical: 0.3,
		defaultWeight: 2,
		defaultThreshold: 1.2,
		defaultDeviationPct: 60,
	},
	// ---- Tempo
	{
		key: 'speechRate',
		family: 'tempo',
		dimension: 'exhaustion',
		unit: 'wpm',
		worse: 'lower',
		decimals: 0,
		confidence: 'high',
		typical: 150,
		defaultWeight: 3,
		defaultThreshold: 115,
		defaultDeviationPct: 15,
	},
	{
		key: 'longPauses',
		family: 'tempo',
		dimension: 'efficacy',
		unit: 'per call',
		worse: 'higher',
		decimals: 1,
		confidence: 'high',
		typical: 1,
		defaultWeight: 3,
		defaultThreshold: 4,
		defaultDeviationPct: 80,
	},
	{
		key: 'responseLatency',
		family: 'tempo',
		dimension: 'efficacy',
		unit: 's',
		worse: 'higher',
		decimals: 1,
		confidence: 'high',
		typical: 1.2,
		defaultWeight: 3,
		defaultThreshold: 3,
		defaultDeviationPct: 40,
	},
	{
		key: 'fillers',
		family: 'tempo',
		dimension: 'efficacy',
		unit: '/ min',
		worse: 'higher',
		decimals: 1,
		confidence: 'medium',
		typical: 2,
		defaultWeight: 2,
		defaultThreshold: 6,
		defaultDeviationPct: 60,
	},
	// ---- Lexical
	{
		key: 'negativeLanguage',
		family: 'lexical',
		dimension: 'cynicism',
		unit: '/ 100 words',
		worse: 'higher',
		decimals: 1,
		confidence: 'medium',
		typical: 1.2,
		defaultWeight: 3,
		defaultThreshold: 4,
		defaultDeviationPct: 80,
	},
	{
		key: 'apathyPhrases',
		family: 'lexical',
		dimension: 'cynicism',
		unit: 'per call',
		worse: 'higher',
		decimals: 1,
		confidence: 'medium',
		typical: 0.2,
		defaultWeight: 3,
		defaultThreshold: 1.5,
		defaultDeviationPct: 100,
	},
	{
		key: 'shortTurns',
		family: 'lexical',
		dimension: 'cynicism',
		unit: '%',
		worse: 'higher',
		decimals: 0,
		confidence: 'medium',
		typical: 22,
		defaultWeight: 2,
		defaultThreshold: 45,
		defaultDeviationPct: 35,
	},
	{
		key: 'empathyPhrases',
		family: 'lexical',
		dimension: 'cynicism',
		unit: 'per call',
		worse: 'lower',
		decimals: 1,
		confidence: 'medium',
		typical: 2.4,
		defaultWeight: 2,
		defaultThreshold: 0.8,
		defaultDeviationPct: 40,
	},
	// ---- Cognitive
	{
		key: 'repeatRequests',
		family: 'cognitive',
		dimension: 'efficacy',
		unit: 'per call',
		worse: 'higher',
		decimals: 1,
		confidence: 'high',
		typical: 0.3,
		defaultWeight: 4,
		defaultThreshold: 2,
		defaultDeviationPct: 100,
	},
	{
		key: 'selfCorrections',
		family: 'cognitive',
		dimension: 'efficacy',
		unit: 'per call',
		worse: 'higher',
		decimals: 1,
		confidence: 'medium',
		typical: 0.8,
		defaultWeight: 2,
		defaultThreshold: 3,
		defaultDeviationPct: 80,
	},
	{
		key: 'lostThread',
		family: 'cognitive',
		dimension: 'efficacy',
		unit: 'per call',
		worse: 'higher',
		decimals: 1,
		confidence: 'high',
		typical: 0.15,
		defaultWeight: 4,
		defaultThreshold: 1,
		defaultDeviationPct: 100,
	},
];

export const VOICE_SIGNAL_BY_KEY = Object.fromEntries(
	VOICE_SIGNALS.map((s) => [s.key, s])
) as Record<VoiceSignalKey, VoiceSignalDef>;

export const VOICE_SIGNAL_KEYS: VoiceSignalKey[] = VOICE_SIGNALS.map(
	(s) => s.key
);

/** A call of an agent in good shape; also the placeholder for calls that are not analysed (AI agents). */
export const TYPICAL_VOICE = Object.fromEntries(
	VOICE_SIGNALS.map((s) => [s.key, s.typical])
) as CallVoiceSignals;

export const DEFAULT_BURNOUT_SETTINGS: BurnoutThresholds = {
	signals: Object.fromEntries(
		VOICE_SIGNALS.map((s) => [
			s.key,
			{
				enabled: true,
				weight: s.defaultWeight,
				threshold: s.defaultThreshold,
				deviationPct: s.defaultDeviationPct,
			},
		])
	) as BurnoutThresholds['signals'],
	windowDays: 14,
	baseline: { method: 'FIRST_WEEKS', minCalls: 40 },
	minCallsInWindow: 15,
	levelCuts: { medium: 40, high: 70 },
	minActiveSignals: 2,
	persistenceDays: 7,
	convergenceBonus: 10,
};

/** The rule-metric id of every voice signal, so Triggers rules can read them. */
export const VOICE_METRIC_ID = {
	pitchVariability: 'VOICE_PITCH_VARIABILITY',
	vocalEnergy: 'VOICE_VOCAL_ENERGY',
	breathiness: 'VOICE_BREATHINESS',
	sighs: 'VOICE_SIGHS',
	speechRate: 'VOICE_SPEECH_RATE',
	longPauses: 'VOICE_LONG_PAUSES',
	responseLatency: 'VOICE_RESPONSE_LATENCY',
	fillers: 'VOICE_FILLERS',
	negativeLanguage: 'VOICE_NEGATIVE_LANGUAGE',
	apathyPhrases: 'VOICE_APATHY_PHRASES',
	shortTurns: 'VOICE_SHORT_TURNS',
	empathyPhrases: 'VOICE_EMPATHY_PHRASES',
	repeatRequests: 'VOICE_REPEAT_REQUESTS',
	selfCorrections: 'VOICE_SELF_CORRECTIONS',
	lostThread: 'VOICE_LOST_THREAD',
} as const satisfies Record<VoiceSignalKey, TriggerMetricId>;

export const VOICE_KEY_BY_METRIC: Partial<
	Record<TriggerMetricId, VoiceSignalKey>
> = Object.fromEntries(
	Object.entries(VOICE_METRIC_ID).map(([key, id]) => [id, key])
);
