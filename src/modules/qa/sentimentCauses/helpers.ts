import { distribution, periodKeyOf } from '~/modules/qa/analytics/helpers';
import type { Granularity, TeamCallMetric } from '~/modules/qa/analytics/types';
import {
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_ORDER,
} from './constants';
import type {
	CallSentimentCause,
	CauseRankingRow,
	CauseTrend,
	CauseTrendPoint,
	FamilyShareRow,
	SentimentCauseFamily,
	AnyCauseKey,
	SentimentCauseKey,
	SentimentCauseReview,
	SentimentCauseReviewStatus,
} from './types';

type CallWithCause = TeamCallMetric & { sentimentCause: CallSentimentCause };

const round1 = (v: number) => Math.round(v * 10) / 10;
const pct = (part: number, total: number) =>
	total ? round1((part / total) * 100) : 0;
const hasCause = (call: TeamCallMetric): call is CallWithCause =>
	call.sentimentCause !== null;

export const callsWithCause = (calls: TeamCallMetric[]): CallWithCause[] =>
	calls.filter(hasCause);

export const reviewStatusOf = (
	review: SentimentCauseReview | undefined
): SentimentCauseReviewStatus => review?.status ?? 'pending';

/** Primary cause after the reviewer's decision: a correction replaces the AI's pick. */
export const effectivePrimaryCause = (
	cause: CallSentimentCause | null,
	review: SentimentCauseReview | undefined
): AnyCauseKey | null => {
	if (!cause) return null;
	return review?.status === 'corrected' && review.correctedTo
		? review.correctedTo
		: cause.primary;
};

const countByCause = (calls: CallWithCause[]) => {
	const counts = new Map<SentimentCauseKey, number>();
	for (const call of calls) {
		const key = call.sentimentCause.primary;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return counts;
};

/** Every cause (zero rows included), by calls desc then catalogue order. Shares are over the calls with a drop. */
export function causeRanking(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[]
): CauseRankingRow[] {
	const current = callsWithCause(calls);
	const previous = callsWithCause(previousCalls);
	const hasPrevious = previousCalls.length > 0;
	const prevCounts = countByCause(previous);
	const rows = SENTIMENT_CAUSE_ORDER.map((key): CauseRankingRow => {
		const own = current.filter((c) => c.sentimentCause.primary === key);
		const previousCount = prevCounts.get(key) ?? 0;
		const share = pct(own.length, current.length);
		const previousShare = hasPrevious
			? pct(previousCount, previous.length)
			: null;
		return {
			key,
			family: SENTIMENT_CAUSES[key].family,
			calls: own.length,
			share,
			meanDrop: own.length
				? round1(
						own.reduce((s, c) => s + c.sentimentCause.sentimentDrop, 0) /
							own.length
					)
				: null,
			previousCalls: previousCount,
			previousShare,
			delta: previousShare === null ? null : round1(share - previousShare),
		};
	});
	return rows.sort(
		(a, b) =>
			b.calls - a.calls ||
			SENTIMENT_CAUSE_ORDER.indexOf(a.key) -
				SENTIMENT_CAUSE_ORDER.indexOf(b.key)
	);
}

/** Calls with a drop per period for the `topN` most frequent primary causes; quiet periods read 0. */
export function causeTrend(
	calls: TeamCallMetric[],
	granularity: Granularity,
	topN = 4
): CauseTrend {
	const withCause = callsWithCause(calls);
	const totals = countByCause(withCause);
	const topKeys = SENTIMENT_CAUSE_ORDER.filter((key) => totals.has(key))
		.sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0))
		.slice(0, topN);
	const top = new Set<SentimentCauseKey>(topKeys);
	const emptyRow = () =>
		Object.fromEntries(topKeys.map((key) => [key, 0])) as Record<
			string,
			number
		>;

	const buckets = new Map<string, Record<string, number>>();
	// Every call opens its period, so periods without a drop still appear as zeros.
	for (const call of calls) {
		const period = periodKeyOf(call.date, granularity);
		if (!buckets.has(period)) buckets.set(period, emptyRow());
	}
	for (const call of withCause) {
		const key = call.sentimentCause.primary;
		if (!top.has(key)) continue;
		const row = buckets.get(periodKeyOf(call.date, granularity));
		if (row) row[key] += 1;
	}
	const points: CauseTrendPoint[] = [...buckets.keys()]
		.sort()
		.map((period) => ({ period, ...buckets.get(period) }));
	return { points, topKeys };
}

/** Two rows, BUSINESS then AGENT: how many drops each family caused and its share. */
export const familyShare = (calls: TeamCallMetric[]): FamilyShareRow[] =>
	distribution(
		calls.map((c) =>
			c.sentimentCause
				? SENTIMENT_CAUSES[c.sentimentCause.primary].family
				: null
		),
		SENTIMENT_CAUSE_FAMILY_ORDER
	).map((row) => ({
		family: row.key as SentimentCauseFamily,
		count: row.count,
		share: row.share,
	}));
