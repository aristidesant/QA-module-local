import type { TriggerMetricId } from '~/models/qa';
import type {
	BurnoutFamily,
	BurnoutLexicon,
	BurnoutThresholds,
	CallVoiceSignals,
	ContextSignalDef,
	ContextSignalKey,
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

/** The four voice families, then the day-based context. */
export const BURNOUT_FAMILIES: BurnoutFamily[] = [...VOICE_FAMILIES, 'context'];

/** Days in a row with negative sentiment or emotion: they back the voice signals up with a second source. */
export const CONTEXT_SIGNALS: ContextSignalDef[] = [
	{
		key: 'lowSentimentDays',
		limitUnit: '/ 5',
		limitDecimals: 1,
		defaultWeight: 2,
		defaultMinDays: 4,
		defaultDayLimit: 3,
		defaultCustomerFloor: 2.5,
	},
	{
		key: 'negativeEmotionDays',
		limitUnit: '%',
		limitDecimals: 0,
		defaultWeight: 2,
		defaultMinDays: 4,
		defaultDayLimit: 35,
		defaultCustomerFloor: 2.5,
	},
];

export const CONTEXT_SIGNAL_BY_KEY = Object.fromEntries(
	CONTEXT_SIGNALS.map((s) => [s.key, s])
) as Record<ContextSignalKey, ContextSignalDef>;

export const CONTEXT_SIGNAL_KEYS: ContextSignalKey[] = CONTEXT_SIGNALS.map(
	(s) => s.key
);

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

/** The starting lists: a base to edit, written for contact-centre calls in Spanish and English. */
export const DEFAULT_LEXICON: BurnoutLexicon = {
	lists: {
		negativeLanguage: {
			es: [
				'qué fastidio',
				'estoy harto',
				'estoy harta',
				'qué pesadez',
				'no aguanto',
				'es ridículo',
				'qué porquería',
				'no es mi culpa',
				'no me pagan por esto',
				'otra vez lo mismo',
				'no funciona nada',
				'qué desastre',
				'estoy cansado de esto',
			],
			en: [
				'this is ridiculous',
				"i'm sick of this",
				'not my fault',
				'this is a mess',
				'what a pain',
				"i'm so tired of this",
				'here we go again',
				"i don't get paid for this",
				'this never works',
				'what a joke',
				"i can't stand this",
				'this is pointless',
			],
		},
		apathyPhrases: {
			es: [
				'lo que usted diga',
				'da igual',
				'no puedo hacer nada',
				'es lo que hay',
				'no depende de mí',
				'así son las cosas',
				'no sé qué decirle',
				'como quiera',
				'eso no me corresponde',
				'no es mi problema',
				'qué más da',
			],
			en: [
				'whatever you say',
				"it doesn't matter",
				'nothing i can do',
				'it is what it is',
				'not up to me',
				"that's just how it is",
				"i don't know what to tell you",
				'if you want',
				'not my problem',
				"what's the difference",
				'whatever works for you',
			],
		},
		empathyPhrases: {
			es: [
				'entiendo su molestia',
				'lamento la situación',
				'comprendo',
				'gracias por su paciencia',
				'entiendo cómo se siente',
				'con gusto le ayudo',
				'lamento los inconvenientes',
				'me hago cargo',
				'tiene toda la razón',
				'voy a ayudarle con esto',
			],
			en: [
				'i understand your frustration',
				"i'm sorry for the inconvenience",
				'i can see why',
				'thank you for your patience',
				'i understand how you feel',
				'happy to help',
				'i apologize for the trouble',
				"you're absolutely right",
				'let me take care of this',
				'i hear you',
			],
		},
	},
	shortReplies: {
		maxWords: 4,
		exceptions: {
			es: [
				'sí',
				'no',
				'gracias',
				'claro',
				'de acuerdo',
				'perfecto',
				'buenos días',
				'buenas tardes',
				'esta llamada puede ser grabada',
			],
			en: [
				'yes',
				'no',
				'thank you',
				'sure',
				'okay',
				'perfect',
				'good morning',
				'good afternoon',
				'this call may be recorded',
			],
		},
	},
};

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
	context: Object.fromEntries(
		CONTEXT_SIGNALS.map((s) => [
			s.key,
			{
				enabled: true,
				weight: s.defaultWeight,
				minDays: s.defaultMinDays,
				dayLimit: s.defaultDayLimit,
				customerFloor: s.defaultCustomerFloor,
			},
		])
	) as BurnoutThresholds['context'],
	lexicon: DEFAULT_LEXICON,
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
