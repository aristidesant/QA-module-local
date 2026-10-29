import { DEFAULT_SETTINGS } from '~/modules/qa/settings/constants';
import { negativeEmotionsOf } from '~/modules/qa/settings/helpers';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { SENTIMENT_CAUSES, SENTIMENT_CAUSE_ORDER } from './constants';
import type { CallSentimentCause, SentimentCauseKey } from './types';

/** Same LCG as analytics/mockData and burnout/mockVoice. */
export function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}

/** FNV-1a over the call id, folded into the LCG modulus: neighbouring ids land far apart. */
export const hashId = (id: string): number => {
	let h = 0x811c9dc5;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h % 233280;
};

export function pickWeighted<T>(
	items: { key: T; weight: number }[],
	rand: () => number
): T {
	const total = items.reduce((s, i) => s + i.weight, 0);
	let r = rand() * total;
	for (const item of items) {
		r -= item.weight;
		if (r <= 0) return item.key;
	}
	return items[items.length - 1].key;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const MIN_DROP = 0.4;
const MAX_DROP = 2.6;

/**
 * Generation is a one-time pass at module init, so it keys off the defaults
 * (the settings store starts from them). Runtime code reads `call.sentimentCause`.
 */
const SENTIMENT = DEFAULT_SETTINGS.thresholds.sentiment;
const NEGATIVE_EMOTIONS: string[] = negativeEmotionsOf(SENTIMENT);
const isNegative = (emotion: string) => NEGATIVE_EMOTIONS.includes(emotion);

/** Base mix before the call's own signals tilt it: business causes lead, as in most contact centres. */
const BASE_WEIGHT: Record<SentimentCauseKey, number> = {
	WAIT_TIME: 14,
	PRICING_BILLING: 18,
	TECHNICAL_FAILURE: 14,
	PROCESS_POLICY: 12,
	BROKEN_PROMISE: 10,
	AGENT_TONE: 9,
	LACK_OF_EMPATHY: 9,
	INTERRUPTIONS: 6,
	WRONG_INFORMATION: 8,
};

/** A call gets a cause when sentiment visibly dropped: low score, negative emotion, or a dip that recovered. */
export const hasSentimentDrop = (call: TeamCallMetric): boolean =>
	call.customerSentiment < SENTIMENT.lowSentimentIncident ||
	isNegative(call.predominantEmotion) ||
	call.sentimentRecovered;

export function causeWeights(
	call: TeamCallMetric
): { key: SentimentCauseKey; weight: number }[] {
	const agentSide =
		call.agentSentiment < 3 ||
		isNegative(call.agentEmotion) ||
		call.signals.unhandledObjection;
	const waited = call.holdTimeSeconds > 120 || call.transferred;
	const price =
		call.signals.competitorPlusCost ||
		call.nonConversionReason === 'priceTooHigh';
	const misinformed = call.qaScores.ecc > 0;
	return SENTIMENT_CAUSE_ORDER.map((key) => {
		let weight = BASE_WEIGHT[key];
		if (agentSide && SENTIMENT_CAUSES[key].family === 'AGENT') weight *= 3;
		if (waited && key === 'WAIT_TIME') weight *= 4;
		if (price && key === 'PRICING_BILLING') weight *= 4;
		if (misinformed && key === 'WRONG_INFORMATION') weight *= 4;
		return { key, weight };
	});
}

function causeOf(call: TeamCallMetric): CallSentimentCause {
	const rand = seeded(hashId(call.id));
	rand(); // the LCG's first output is linear in the seed
	const weights = causeWeights(call);
	const primary = pickWeighted(weights, rand);

	const r = rand();
	const secondaryCount = r < 0.45 ? 0 : r < 0.85 ? 1 : 2;
	const secondary: SentimentCauseKey[] = [];
	let pool = weights.filter((w) => w.key !== primary);
	for (let i = 0; i < secondaryCount; i++) {
		const key = pickWeighted(pool, rand);
		secondary.push(key);
		pool = pool.filter((w) => w.key !== key);
	}

	// The start of the call never reads above 5; a call already near 5 keeps the floor.
	const room = Math.max(MIN_DROP, round1(5 - call.customerSentiment));
	const sentimentDrop = round1(
		Math.min(MIN_DROP + rand() * (MAX_DROP - MIN_DROP), room)
	);
	return { primary, secondary, sentimentDrop, evidence: null };
}

/**
 * Gives every call with a sentiment drop its root cause, and null to the rest.
 * Keyed by call id rather than by one shared stream, so the result does not depend on
 * array order or on the other passes; a pass of its own, so no existing number changes.
 * Run it AFTER every mutation of sentiment/emotion fields (the SENTIMENT_DIP incident).
 */
export function applySentimentCauses(
	calls: TeamCallMetric[]
): TeamCallMetric[] {
	for (const call of calls) {
		call.sentimentCause = hasSentimentDrop(call) ? causeOf(call) : null;
	}
	return calls;
}
