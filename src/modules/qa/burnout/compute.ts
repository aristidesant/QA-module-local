import { TODAY } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { useSettingsStore } from '~/stores/qa/settingsStore';
import { VOICE_SIGNAL_BY_KEY, VOICE_SIGNAL_KEYS } from './constants';
import type {
	BurnoutScore,
	BurnoutSignalResult,
	BurnoutSignalStatus,
	BurnoutThresholds,
	CallVoiceSignals,
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

const activeFamiliesOf = (signals: { family: VoiceFamily; status: string }[]) =>
	Array.from(
		new Set(signals.filter((s) => s.status === 'ACTIVE').map((s) => s.family))
	);

const scoreOf = (
	signals: Omit<BurnoutSignalResult, 'trend'>[],
	settings: BurnoutThresholds,
	persistenceDays: number
) => {
	let total = 0;
	let reached = 0;
	for (const s of signals) {
		const weight = settings.signals[s.key].weight;
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

const cache = new WeakMap<BurnoutThresholds, Map<string, BurnoutScore>>();

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
	const cached = perAgent.get(agentId);
	if (cached) return cached;

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

	const now = evaluateAt(calls, baselines, settings, 0);
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

	const signals: BurnoutSignalResult[] = now.map((s) => ({
		...s,
		trend: trendOf(calls, s.key),
	}));
	const primary =
		[...signals]
			.filter((s) => s.status === 'ACTIVE')
			.sort((a, b) => (b.deviationPct ?? 0) - (a.deviationPct ?? 0))[0] ?? null;

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
	perAgent.set(agentId, result);
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
	return computeBurnoutScore(agentId, settings).signals.map((s) => ({
		...s,
		...classify(s.key, voice[s.key], s.baseline, settings),
		value: voice[s.key],
		calls: 1,
		trend: [],
	}));
}
