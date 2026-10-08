import type {
	CoachingSessionRecord,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import {
	agentCallsBetween,
	agentCallsInWindow,
} from '~/modules/qa/calls/agentMetrics';
import { IMPACT_THRESHOLD } from '~/modules/qa/lms/constants';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import {
	SCORECARD_DIMENSION_ORDER,
	SCORECARD_WINDOW_DAYS,
	buildWeeklyScorecard,
	scorecardTrend,
	tierFor,
	type PerformanceTier,
	type ScorecardDimension,
	type ScorecardTrend,
	type ScorecardTrendVerdict,
	type WeeklyScorecard,
} from './scorecard';

/** Same ±IMPACT_THRESHOLD band the scorecard trend uses, for any signed delta. */
export const verdictForDelta = (delta: number): ScorecardTrendVerdict =>
	delta >= IMPACT_THRESHOLD
		? 'IMPROVED'
		: delta <= -IMPACT_THRESHOLD
			? 'DECLINED'
			: 'SAME';

const dayOf = (iso: string) => iso.slice(0, 10);

const daysBetween = (from: string, to: string) =>
	Math.round(
		(new Date(`${to}T00:00:00Z`).getTime() -
			new Date(`${from}T00:00:00Z`).getTime()) /
			86_400_000
	);

/** A coach-led session that happened: AI messages are delivered, not held. */
export const isCoachLedCompleted = (s: CoachingSessionRecord) =>
	s.status === 'COMPLETED' && s.type !== 'AI_MESSAGE';

const involves = (s: CoachingSessionRecord, agentId: string) =>
	s.agentId === agentId || Boolean(s.agentIds?.includes(agentId));

/** The agent's most recent completed coach-led session, or null. */
export const lastCompletedSession = (
	sessions: CoachingSessionRecord[],
	agentId: string
): CoachingSessionRecord | null =>
	sessions
		.filter((s) => involves(s, agentId) && isCoachLedCompleted(s))
		.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

export interface PostCoachingAnchor {
	session: CoachingSessionRecord;
	/** 'YYYY-MM-DD' of the session. */
	day: string;
	/** Days from the session day to TODAY. */
	daysAgo: number;
}

export interface AspectComparison {
	dimension: ScorecardDimension;
	after: number | null;
	before: number | null;
	/** after − before; null when either window has no calls. */
	delta: number | null;
	verdict: ScorecardTrendVerdict | null;
}

export interface PostCoachingSummary {
	/** null → no completed coach-led session; the weekly scorecard is shown instead. */
	anchor: PostCoachingAnchor | null;
	/** Length in days of each window (after = anchor day → TODAY). */
	windowDays: number;
	/** Scorecard over the calls since the anchor (or the last 7 days). */
	after: WeeklyScorecard | null;
	/** Scorecard over the equal-length window right before the anchor. */
	before: WeeklyScorecard | null;
	trend: ScorecardTrend | null;
	tier: PerformanceTier | null;
	aspects: AspectComparison[];
	/** Completed on or after the anchor day, newest first. */
	materialsCompleted: LmsAssignment[];
	latestMaterial: LmsAssignment | null;
}

/**
 * "After" = calls from the last completed coach-led session to TODAY;
 * "before" = the equal-length window ending the day before it. Without a
 * completed session the weekly scorecard (7 vs previous 7 days) stands in.
 */
export const buildPostCoachingSummary = (
	agentId: string,
	sessions: CoachingSessionRecord[],
	assignments: LmsAssignment[]
): PostCoachingSummary => {
	const session = lastCompletedSession(sessions, agentId);

	let anchor: PostCoachingAnchor | null = null;
	let windowDays = SCORECARD_WINDOW_DAYS;
	let fromDay = addDays(TODAY, -(windowDays - 1));
	let after: WeeklyScorecard | null;
	let before: WeeklyScorecard | null;

	if (session) {
		const day = dayOf(session.date);
		const daysAgo = daysBetween(day, TODAY);
		windowDays = daysAgo + 1;
		fromDay = day;
		anchor = { session, day, daysAgo };
		after = buildWeeklyScorecard(agentCallsBetween(agentId, day, TODAY));
		before = buildWeeklyScorecard(
			agentCallsBetween(agentId, addDays(day, -windowDays), addDays(day, -1))
		);
	} else {
		after = buildWeeklyScorecard(agentCallsInWindow(agentId, windowDays));
		before = buildWeeklyScorecard(
			agentCallsInWindow(agentId, windowDays, windowDays)
		);
	}

	const aspects: AspectComparison[] = SCORECARD_DIMENSION_ORDER.map(
		(dimension) => {
			const a = after?.dimensions[dimension] ?? null;
			const b = before?.dimensions[dimension] ?? null;
			const delta = a !== null && b !== null ? a - b : null;
			return {
				dimension,
				after: a,
				before: b,
				delta,
				verdict: delta === null ? null : verdictForDelta(delta),
			};
		}
	);

	const materialsCompleted = assignments
		.filter(
			(x) =>
				x.agentId === agentId &&
				x.status === 'COMPLETED' &&
				x.completedAt !== null &&
				x.completedAt >= fromDay
		)
		.sort((x, y) => (y.completedAt ?? '').localeCompare(x.completedAt ?? ''));

	return {
		anchor,
		windowDays,
		after,
		before,
		trend: scorecardTrend(after, before),
		tier: after ? tierFor(after.score) : null,
		aspects,
		materialsCompleted,
		latestMaterial: materialsCompleted[0] ?? null,
	};
};

export interface TierTenure {
	/** The agent's group this week (same rule as the Agents tab); null without a scorecard. */
	tier: PerformanceTier | null;
	/** Consecutive weeks, counting this one, the agent has been in that group. */
	weeks: number;
	/** 'YYYY-MM-DD' first day of the oldest week of the streak. */
	since: string | null;
	/** True when the history ends before the group changed, so the real tenure may be longer. */
	atLeast: boolean;
	/** The group the agent was in right before this streak. */
	previousTier: PerformanceTier | null;
}

/** Weekly windows of history available for the streak (TEAM_CALLS holds 180 days). */
const TENURE_MAX_WEEKS = 25;

/**
 * How long the agent has been in the current performance group: steps back one
 * 7-day window at a time from TODAY, with the same weekly scorecard and tier
 * cut-offs as the Agents tab, until the group changes or the data runs out.
 */
export const buildTierTenure = (agentId: string): TierTenure => {
	const weekAt = (weeksBack: number) => {
		const to = addDays(TODAY, -7 * weeksBack);
		const from = addDays(to, -(SCORECARD_WINDOW_DAYS - 1));
		const scorecard = buildWeeklyScorecard(
			agentCallsBetween(agentId, from, to)
		);
		return { from, tier: scorecard ? tierFor(scorecard.score) : null };
	};

	const now = weekAt(0);
	if (!now.tier) {
		return {
			tier: null,
			weeks: 0,
			since: null,
			atLeast: false,
			previousTier: null,
		};
	}

	let weeks = 1;
	let since = now.from;
	for (let back = 1; back < TENURE_MAX_WEEKS; back++) {
		const week = weekAt(back);
		if (!week.tier)
			return {
				tier: now.tier,
				weeks,
				since,
				atLeast: true,
				previousTier: null,
			};
		if (week.tier !== now.tier) {
			return {
				tier: now.tier,
				weeks,
				since,
				atLeast: false,
				previousTier: week.tier,
			};
		}
		weeks += 1;
		since = week.from;
	}
	return { tier: now.tier, weeks, since, atLeast: true, previousTier: null };
};

export interface MaterialImpactRow {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	/** checkpoint30 − baseline, sign flipped for lower-is-better metrics; null while measuring. */
	delta: number | null;
	measured: boolean;
}

/** Assignments with an impact record, best delta first; still-measuring ones last. */
export const rankMaterialImpact = (
	assignments: LmsAssignment[],
	contentById: Record<string, LmsContent>
): MaterialImpactRow[] =>
	assignments
		.filter((a) => a.impact !== null)
		.map((a) => {
			const impact = a.impact!;
			const def = METRIC_BY_ID[impact.metricId];
			const measured =
				impact.verdict !== 'PENDING' && impact.checkpoint30 !== null;
			const raw = measured
				? (impact.checkpoint30 as number) - impact.baseline
				: null;
			const delta =
				raw === null
					? null
					: Math.round((def.higherIsBetter ? raw : -raw) * 10) / 10;
			return {
				assignment: a,
				content: contentById[a.contentId],
				delta,
				measured,
			};
		})
		.sort(
			(x, y) =>
				(y.delta ?? Number.NEGATIVE_INFINITY) -
				(x.delta ?? Number.NEGATIVE_INFINITY)
		);
