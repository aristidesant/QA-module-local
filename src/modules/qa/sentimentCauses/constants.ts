import type {
	CustomCauseKey,
	SentimentCauseCatalogue,
	SentimentCauseFamily,
	SentimentCauseKey,
	SentimentCauseSettings,
} from './types';

/** Settings defaults: the 1.0 the call badge used before this was configurable, every cause on, default names. */
export const DEFAULT_SENTIMENT_CAUSE_SETTINGS: SentimentCauseSettings = {
	strongDrop: 1,
	disabled: [],
	names: {},
};

/** Catalogue defaults: the nine built-in causes with their translated guidance, none added. */
export const DEFAULT_SENTIMENT_CAUSE_CATALOGUE: SentimentCauseCatalogue = {
	descriptions: {},
	custom: [],
};

/** i18n namespace of every cause label; loaded by the analytics and call detail routes. */
export const SENTIMENT_CAUSES_NS = 'qa.sentimentCauses';
/** Segment key of calls without a drop. Label: `causes.none` in the namespace above. */
export const SENTIMENT_CAUSE_NONE_KEY = 'none';

/** Keys of causes added in Settings start with this; the nine built-in keys never do. */
export const CUSTOM_CAUSE_PREFIX = 'custom-';
export const isCustomCauseKey = (key: string): key is CustomCauseKey =>
	key.startsWith(CUSTOM_CAUSE_PREFIX);

export const SENTIMENT_CAUSE_FAMILY_ORDER: SentimentCauseFamily[] = [
	'BUSINESS',
	'AGENT',
];

export const SENTIMENT_CAUSES: Record<
	SentimentCauseKey,
	{ family: SentimentCauseFamily }
> = {
	WAIT_TIME: { family: 'BUSINESS' },
	PRICING_BILLING: { family: 'BUSINESS' },
	TECHNICAL_FAILURE: { family: 'BUSINESS' },
	PROCESS_POLICY: { family: 'BUSINESS' },
	BROKEN_PROMISE: { family: 'BUSINESS' },
	AGENT_TONE: { family: 'AGENT' },
	LACK_OF_EMPATHY: { family: 'AGENT' },
	INTERRUPTIONS: { family: 'AGENT' },
	WRONG_INFORMATION: { family: 'AGENT' },
};

/** Catalogue order: business causes first, then agent causes. */
export const SENTIMENT_CAUSE_ORDER: SentimentCauseKey[] = [
	'WAIT_TIME',
	'PRICING_BILLING',
	'TECHNICAL_FAILURE',
	'PROCESS_POLICY',
	'BROKEN_PROMISE',
	'AGENT_TONE',
	'LACK_OF_EMPATHY',
	'INTERRUPTIONS',
	'WRONG_INFORMATION',
];

export const SENTIMENT_CAUSE_KEYS_BY_FAMILY: Record<
	SentimentCauseFamily,
	SentimentCauseKey[]
> = {
	BUSINESS: SENTIMENT_CAUSE_ORDER.filter(
		(key) => SENTIMENT_CAUSES[key].family === 'BUSINESS'
	),
	AGENT: SENTIMENT_CAUSE_ORDER.filter(
		(key) => SENTIMENT_CAUSES[key].family === 'AGENT'
	),
};
