import { TODAY } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import {
	CONTEXT_SIGNAL_BY_KEY,
	CONTEXT_SIGNAL_KEYS,
	VOICE_SIGNAL_BY_KEY,
	VOICE_SIGNAL_KEYS,
} from './constants';
import {
	isNegativeEmotionIn,
	negativeEmotionsOf,
} from '~/modules/qa/settings/helpers';
import type {
	BurnoutFamily,
	BurnoutScore,
	BurnoutSignalKey,
	BurnoutSignalResult,
	BurnoutSignalStatus,
	BurnoutThresholds,
	CallVoiceSignals,
	ContextSignalConfig,
	ContextSignalKey,
	VoiceFamily,
	VoiceSignalKey,
} from './types';

const DAY_MS = 86_400_000;
const TREND_DAYS = 30;
/** A signal is NEAR once it is this share of the way to its deviation limit. */
const NEAR_RATIO = 0.5;
/** Share of the enabled weight that already counts as the maximum risk: no agent deteriorates on every signal. */
const SATURATION = 0.5;
/** Extra score factor an agent earns by keeping signals active for `persistenceDays`. */
const MAX_PERSISTENCE_BOOST = 0.5;
/** Families with an active signal that earn the convergence bonus. */
const CONVERGENCE_FAMILIES = 3;
const BASELINE_FIRST_DAYS = 28;
/** Rolling baseline: this many days back, leaving out the latest ones that may already show the change. */
const ROLLING_FROM_DAYS = 104;
const ROLLING_UNTIL_DAYS = 14;
const MAX_PERSISTENCE_LOOKBACK = 30;

const dayIndex = (iso: string) =>
	Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / DAY_MS);
const TODAY_INDEX = dayIndex(TODAY);

const median = (values: number[]): number | null => {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

interface AgentCall {
	call: TeamCallMetric;
	/** Days before today. */
	age: number;
}

const callsOf = (agentId: string): AgentCall[] =>
	TEAM_CALLS.filter((c) => c.agentId === agentId).map((call) => ({
		call,
		age: TODAY_INDEX - dayIndex(call.date),
	}));

/** The calls that set what "normal" is for this agent, or none when there are too few. */
const baselineCalls = (
	calls: AgentCall[],
	settings: BurnoutThresholds
): AgentCall[] => {
	const { method, minCalls } = settings.baseline;
	if (method === 'FIRST_WEEKS' && calls.length > 0) {
		const oldest = Math.max(...calls.map((c) => c.age));
		const first = calls.filter((c) => c.age > oldest - BASELINE_FIRST_DAYS);
		if (first.length >= minCalls) return first;
	}
	const rolling = calls.filter(
		(c) => c.age >= ROLLING_UNTIL_DAYS && c.age < ROLLING_FROM_DAYS
	);
	return rolling.length >= minCalls ? rolling : [];
};

/** One value of a signal against the agent's baseline: how far it drifted, whether it passed its limit, and the status. */
const classify = (
	key: VoiceSignalKey,
	value: number,
	baseline: number | null,
	settings: BurnoutThresholds
) => {
	const def = VOICE_SIGNAL_BY_KEY[key];
	const config = settings.signals[key];
	const lowerIsWorse = def.worse === 'lower';
	const deviationPct =
		baseline && baseline > 0
			? Math.round(
					((lowerIsWorse ? baseline - value : value - baseline) / baseline) *
						100 *
						10
				) / 10
			: null;
	const beyondThreshold = lowerIsWorse
		? value < config.threshold
		: value > config.threshold;
	const status: BurnoutSignalStatus =
		beyondThreshold ||
		(deviationPct !== null && deviationPct >= config.deviationPct)
			? 'ACTIVE'
			: deviationPct !== null &&
				  deviationPct >= config.deviationPct * NEAR_RATIO
				? 'NEAR'
				: 'OK';
	return { deviationPct, beyondThreshold, status };
};

/** One signal over a window of calls, against the agent's baseline. */
const evaluateSignal = (
	key: VoiceSignalKey,
	windowCalls: AgentCall[],
	baseline: number | null,
	settings: BurnoutThresholds
): Omit<BurnoutSignalResult, 'trend'> => {
	const def = VOICE_SIGNAL_BY_KEY[key];
	if (windowCalls.length < settings.minCallsInWindow) {
		return {
			key,
			family: def.family,
			status: 'NO_DATA',
			value: null,
			baseline,
			deviationPct: null,
			beyondThreshold: false,
			calls: windowCalls.length,
		};
	}
	const value = median(windowCalls.map((c) => c.call.voice[key])) as number;
	const { deviationPct, beyondThreshold, status } = classify(
		key,
		value,
		baseline,
		settings
	);
	return {
		key,
		family: def.family,
		status,
		value: Math.round(value * 100) / 100,
		baseline: baseline === null ? null : Math.round(baseline * 100) / 100,
		deviationPct,
		beyondThreshold,
		calls: windowCalls.length,
	};
};

/** Every enabled signal for the window that ends `end` days before today. */
const evaluateAt = (
	calls: AgentCall[],
	baselines: Record<VoiceSignalKey, number | null>,
	settings: BurnoutThresholds,
	end: number
) => {
	const windowCalls = calls.filter(
		(c) => c.age >= end && c.age < end + settings.windowDays
	);
	return VOICE_SIGNAL_KEYS.filter((k) => settings.signals[k].enabled).map(
		(key) => evaluateSignal(key, windowCalls, baselines[key], settings)
	);
};

/** Daily medians of the last 30 days, oldest first. */
const trendOf = (calls: AgentCall[], key: VoiceSignalKey) =>
	Array.from({ length: TREND_DAYS }, (_, i) => {
		const age = TREND_DAYS - 1 - i;
		const median_ = median(
			calls.filter((c) => c.age === age).map((c) => c.call.voice[key])
		);
		return median_ === null ? null : Math.round(median_ * 100) / 100;
	});

/** Voice families with an active signal. The day-based context backs them up but is not a family of its own. */
const activeFamiliesOf = (
	signals: { family: BurnoutFamily; status: string }[]
): VoiceFamily[] =>
	Array.from(
		new Set(
			signals
				.filter((s) => s.status === 'ACTIVE' && s.family !== 'context')
				.map((s) => s.family as VoiceFamily)
		)
	);

/** How much a signal counts is fixed by the system, not configured. */
const weightOf = (key: BurnoutSignalKey) =>
	key in CONTEXT_SIGNAL_BY_KEY
		? CONTEXT_SIGNAL_BY_KEY[key as ContextSignalKey].weight
		: VOICE_SIGNAL_BY_KEY[key as VoiceSignalKey].weight;

// ---------- context: days in a row with negative sentiment or emotion ----------
/** A day with fewer calls than this says too little about the agent's mood. */
const MIN_CALLS_PER_DAY = 3;
const CONTEXT_LOOKBACK_DAYS = 60;

interface DayStats {
	/** Days before today. */
	age: number;
	agentSentiment: number;
	/** % of the day's calls whose agent emotion is negative. */
	negativeShare: number;
	customerSentiment: number;
}

const mean = (values: number[]) =>
	values.reduce((sum, v) => sum + v, 0) / values.length;

/** One entry per working day with enough calls, newest first. */
const dayStatsOf = (
	calls: AgentCall[],
	negativeEmotions: string[]
): DayStats[] => {
	const byAge = new Map<number, AgentCall[]>();
	for (const c of calls)
		if (c.age >= 0 && c.age < CONTEXT_LOOKBACK_DAYS)
			byAge.set(c.age, [...(byAge.get(c.age) ?? []), c]);
	return [...byAge.entries()]
		.filter(([, day]) => day.length >= MIN_CALLS_PER_DAY)
		.sort(([a], [b]) => a - b)
		.map(([age, day]) => ({
			age,
			agentSentiment: mean(day.map((c) => c.call.agentSentiment)),
			negativeShare:
				(100 *
					day.filter((c) =>
						isNegativeEmotionIn(c.call.agentEmotion, negativeEmotions)
					).length) /
				day.length,
			customerSentiment: mean(day.map((c) => c.call.customerSentiment)),
		}));
};

/**
 * Working days in a row, up to the latest one, on which the agent stayed negative. Days without
 * calls are not days; days when customers were hostile are left out without breaking the streak.
 */
const streakOf = (
	days: DayStats[],
	key: ContextSignalKey,
	config: ContextSignalConfig
) => {
	let streak = 0;
	for (const day of days) {
		if (day.customerSentiment < config.customerFloor) continue;
		const qualifies =
			key === 'lowSentimentDays'
				? day.agentSentiment < config.dayLimit
				: day.negativeShare > config.dayLimit;
		if (!qualifies) break;
		streak += 1;
	}
	return streak;
};

const evaluateContext = (
	calls: AgentCall[],
	settings: BurnoutThresholds,
	negativeEmotions: string[]
): BurnoutSignalResult[] => {
	const days = dayStatsOf(calls, negativeEmotions);
	return CONTEXT_SIGNAL_KEYS.filter((k) => settings.context[k].enabled).map(
		(key) => {
			const config = settings.context[key];
			const streak = streakOf(days, key, config);
			const status: BurnoutSignalStatus =
				days.length === 0
					? 'NO_DATA'
					: streak >= config.minDays
						? 'ACTIVE'
						: streak >= Math.max(2, Math.ceil(config.minDays / 2))
							? 'NEAR'
							: 'OK';
			return {
				key,
				family: 'context',
				status,
				value: days.length === 0 ? null : streak,
				baseline: null,
				deviationPct: null,
				beyondThreshold: status === 'ACTIVE',
				calls: days.length,
				// The daily value behind each day, oldest first.
				trend: Array.from({ length: TREND_DAYS }, (_, i) => {
					const day = days.find((d) => d.age === TREND_DAYS - 1 - i);
					if (!day) return null;
					const value =
						key === 'lowSentimentDays' ? day.agentSentiment : day.negativeShare;
					return Math.round(value * 10) / 10;
				}),
				streak: {
					days: streak,
					minDays: config.minDays,
					dayLimit: config.dayLimit,
				},
			};
		}
	);
};

const scoreOf = (
	signals: Omit<BurnoutSignalResult, 'trend'>[],
	settings: BurnoutThresholds,
	persistenceDays: number
) => {
	let total = 0;
	let reached = 0;
	for (const s of signals) {
		const weight = weightOf(s.key);
		total += weight;
		if (s.status === 'ACTIVE') reached += weight;
		else if (s.status === 'NEAR') reached += weight * NEAR_RATIO;
	}
	const base = total ? Math.min(1, reached / total / SATURATION) * 100 : 0;
	const persistence =
		1 +
		MAX_PERSISTENCE_BOOST *
			Math.min(1, persistenceDays / settings.persistenceDays);
	const bonus =
		activeFamiliesOf(signals).length >= CONVERGENCE_FAMILIES
			? settings.convergenceBonus
			: 0;
	return Math.max(0, Math.min(100, Math.round(base * persistence + bonus)));
};

const cache = new WeakMap<
	BurnoutThresholds,
	Map<string, { emotions: string[]; result: BurnoutScore }>
>();

/**
 * Burnout score of one agent from the voice signals of their calls: each signal is read over the
 * configured window and compared with the agent's own baseline and with an absolute limit; the
 * active ones add their weight, sustained days raise it and signals in several families add a bonus.
 */
export function computeBurnoutScore(
	agentId: string,
	settings: BurnoutThresholds = useSettingsStore.getState().thresholds.burnout
): BurnoutScore {
	let perAgent = cache.get(settings);
	if (!perAgent) {
		perAgent = new Map();
		cache.set(settings, perAgent);
	}
	const emotions = negativeEmotionsOf(
		useSettingsStore.getState().thresholds.sentiment
	);
	const cached = perAgent.get(agentId);
	if (cached && cached.emotions === emotions) return cached.result;

	const calls = callsOf(agentId);
	const baselineSet = baselineCalls(calls, settings);
	const baselines = Object.fromEntries(
		VOICE_SIGNAL_KEYS.map((key) => [
			key,
			baselineSet.length
				? median(baselineSet.map((c) => c.call.voice[key]))
				: null,
		])
	) as Record<VoiceSignalKey, number | null>;

	const voiceNow = evaluateAt(calls, baselines, settings, 0);
	const now = [...voiceNow, ...evaluateContext(calls, settings, emotions)];
	const activeCount = now.filter((s) => s.status === 'ACTIVE').length;
	const nearCount = now.filter((s) => s.status === 'NEAR').length;

	// Days in a row, ending today, on which enough signals were active.
	let persistenceDays = 0;
	for (let end = 0; end < MAX_PERSISTENCE_LOOKBACK; end++) {
		const active = evaluateAt(calls, baselines, settings, end).filter(
			(s) => s.status === 'ACTIVE'
		).length;
		if (active < Math.max(1, settings.minActiveSignals)) break;
		persistenceDays += 1;
	}

	const score = scoreOf(now, settings, persistenceDays);
	const level =
		activeCount < settings.minActiveSignals
			? 'low'
			: score >= settings.levelCuts.high
				? 'high'
				: score >= settings.levelCuts.medium
					? 'medium'
					: 'low';

	const signals: BurnoutSignalResult[] = now.map((s) =>
		'trend' in s
			? (s as BurnoutSignalResult)
			: { ...s, trend: trendOf(calls, s.key as VoiceSignalKey) }
	);
	// The voice signal that drifts most; a streak leads only when no voice signal is active.
	const active = signals.filter((s) => s.status === 'ACTIVE');
	const primary =
		[...active]
			.filter((s) => s.family !== 'context')
			.sort((a, b) => (b.deviationPct ?? 0) - (a.deviationPct ?? 0))[0] ??
		[...active].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0] ??
		null;

	const result: BurnoutScore = {
		// A low level never reads like a medium one, even when the score alone would.
		score:
			level === 'low' ? Math.min(score, settings.levelCuts.medium - 1) : score,
		level,
		activeCount,
		nearCount,
		activeFamilies: activeFamiliesOf(now),
		persistenceDays,
		signals,
		primary,
	};
	perAgent.set(agentId, { emotions, result });
	return result;
}

/**
 * The signals of ONE call against the agent's own baseline, with the same limits and deviations
 * as the score. `calls` is 1 and there is no trend: this is what the call detail shows.
 */
export function evaluateCallVoice(
	agentId: string,
	voice: CallVoiceSignals,
	settings: BurnoutThresholds = useSettingsStore.getState().thresholds.burnout
): BurnoutSignalResult[] {
	return computeBurnoutScore(agentId, settings).signals.flatMap((s) => {
		if (s.family === 'context') return [];
		const key = s.key as VoiceSignalKey;
		return [
			{
				...s,
				...classify(key, voice[key], s.baseline, settings),
				value: voice[key],
				calls: 1,
				trend: [],
			},
		];
	});
}
