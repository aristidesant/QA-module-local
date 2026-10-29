import {
	aggregateMetric,
	distribution,
	periodKeyOf,
} from '~/modules/qa/analytics/helpers';
import type {
	CallSurvey,
	Granularity,
	TeamCallMetric,
} from '~/modules/qa/analytics/types';
import {
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_ORDER,
} from '~/modules/qa/sentimentCauses/constants';
import type {
	CauseTrendPoint,
	SentimentCauseFamily,
	SentimentCauseKey,
} from '~/modules/qa/sentimentCauses/types';
import type { ScoreBands } from '~/modules/qa/settings/types';
import { SURVEY_STRENGTHS, isStrengthKey } from './constants';
import {
	MAX_COMMENTS,
	MIN_AGENT_RESPONSES,
	type CommentCauseRow,
	type QaBandKey,
	type StrengthRow,
	type SurveyAgentPoint,
	type SurveyBandRow,
	type SurveyComment,
	type SurveyCommentary,
	type SurveySummary,
} from './types';

const BAND_KEYS: QaBandKey[] = ['low', 'mid', 'high'];
const TOP_CAUSES = 4;

const round1 = (value: number) => Math.round(value * 10) / 10;
const pct = (part: number, total: number) =>
	total ? round1((part / total) * 100) : 0;

/** NPS 0-6 or CSAT 1-2. */
const isDetractor = (survey: CallSurvey) =>
	survey.type === 'NPS' ? survey.score <= 6 : survey.score <= 2;

/** A detractor comment carries a root cause as its theme. */
type CauseComment = TeamCallMetric & {
	survey: CallSurvey & { theme: { key: SentimentCauseKey; highlight: string } };
};
const isCauseComment = (call: TeamCallMetric): call is CauseComment =>
	call.survey !== null &&
	isDetractor(call.survey) &&
	call.survey.theme !== null &&
	!isStrengthKey(call.survey.theme.key);

const countBy = <T, K extends string>(
	items: T[],
	keyOf: (item: T) => K | null
) => {
	const counts = new Map<K, number>();
	for (const item of items) {
		const key = keyOf(item);
		if (key !== null) counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return counts;
};

/** The comments as structured insight: causes behind detractor comments, their trend, and what promoters praise. */
function commentaryOf(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	granularity: Granularity
): SurveyCommentary {
	const current = calls.filter(isCauseComment);
	const previous = previousCalls.filter(isCauseComment);
	const hasPrevious = previousCalls.length > 0;
	const causeOf = (call: CauseComment) => call.survey.theme.key;
	const counts = countBy(current, causeOf);
	const previousCounts = countBy(previous, causeOf);

	const causes: CommentCauseRow[] = SENTIMENT_CAUSE_ORDER.map((key) => {
		const comments = counts.get(key) ?? 0;
		const previousComments = previousCounts.get(key) ?? 0;
		const share = pct(comments, current.length);
		const previousShare = hasPrevious
			? pct(previousComments, previous.length)
			: null;
		return {
			key,
			family: SENTIMENT_CAUSES[key].family,
			comments,
			share,
			previousComments,
			previousShare,
			delta: previousShare === null ? null : round1(share - previousShare),
		};
	}).sort(
		(a, b) =>
			b.comments - a.comments ||
			SENTIMENT_CAUSE_ORDER.indexOf(a.key) -
				SENTIMENT_CAUSE_ORDER.indexOf(b.key)
	);

	const families = distribution(
		current.map((call) => SENTIMENT_CAUSES[causeOf(call)].family),
		SENTIMENT_CAUSE_FAMILY_ORDER
	).map((row) => ({
		family: row.key as SentimentCauseFamily,
		count: row.count,
		share: row.share,
	}));

	const strengthCounts = countBy(calls, (call) => {
		const key = call.survey?.theme?.key;
		return key && isStrengthKey(key) ? key : null;
	});
	const strengthTotal = [...strengthCounts.values()].reduce(
		(sum, n) => sum + n,
		0
	);
	const strengths: StrengthRow[] = SURVEY_STRENGTHS.map((key) => ({
		key,
		comments: strengthCounts.get(key) ?? 0,
		share: pct(strengthCounts.get(key) ?? 0, strengthTotal),
	})).sort(
		(a, b) =>
			b.comments - a.comments ||
			SURVEY_STRENGTHS.indexOf(a.key) - SURVEY_STRENGTHS.indexOf(b.key)
	);

	// Same shape as the sentiment-cause trend: every call opens its period, so quiet periods read 0.
	const topKeys = SENTIMENT_CAUSE_ORDER.filter((key) => counts.has(key))
		.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
		.slice(0, TOP_CAUSES);
	const buckets = new Map<string, Record<string, number>>();
	const emptyRow = () =>
		Object.fromEntries(topKeys.map((key) => [key, 0])) as Record<
			string,
			number
		>;
	for (const call of calls) {
		const period = periodKeyOf(call.date, granularity);
		if (!buckets.has(period)) buckets.set(period, emptyRow());
	}
	for (const call of current) {
		const row = buckets.get(periodKeyOf(call.date, granularity));
		const key = causeOf(call);
		if (row && topKeys.includes(key)) row[key] += 1;
	}
	const points: CauseTrendPoint[] = [...buckets.keys()]
		.sort()
		.map((period) => ({ period, ...buckets.get(period) }));

	return {
		causes,
		families,
		strengths,
		trend: { points, topKeys },
		detractorComments: current.length,
		detractorResponses: calls.filter(
			(call) => call.survey !== null && isDetractor(call.survey)
		).length,
	};
}

/** The views of the survey data that tie it to QA and to what customers say: NPS by QA band, the per-agent scatter, the latest comments and the commentary. */
export function aggregateSurveys(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[],
	qaBands: ScoreBands,
	granularity: Granularity
): SurveySummary {
	const npsCalls = calls.filter((call) => call.survey?.type === 'NPS');

	const bandOf = (qa: number): QaBandKey =>
		qa >= qaBands.onTarget ? 'high' : qa >= qaBands.watch ? 'mid' : 'low';
	const bands: SurveyBandRow[] = BAND_KEYS.map((key) => {
		const inBand = npsCalls.filter((call) => bandOf(call.qaScore) === key);
		return {
			key,
			responses: inBand.length,
			nps: aggregateMetric(inBand, 'SURVEY_NPS'),
		};
	});

	const callsByAgent = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		const list = callsByAgent.get(call.agentId) ?? [];
		list.push(call);
		callsByAgent.set(call.agentId, list);
	}
	const byAgent: SurveyAgentPoint[] = [];
	for (const [agentId, agentCalls] of callsByAgent) {
		const responses = agentCalls.filter((c) => c.survey?.type === 'NPS');
		if (responses.length < MIN_AGENT_RESPONSES) continue;
		const nps = aggregateMetric(responses, 'SURVEY_NPS');
		const qa = aggregateMetric(agentCalls, 'QA_OVERALL_SCORE');
		if (nps === null || qa === null) continue;
		byAgent.push({
			agentId,
			agentName: agentCalls[0].agentName,
			qa,
			nps,
			responses: responses.length,
		});
	}

	const comments: SurveyComment[] = calls
		.filter((call) => call.survey?.verbatim)
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, MAX_COMMENTS)
		.map((call) => {
			const survey = call.survey!;
			return {
				id: call.id,
				date: call.date,
				agentName: call.agentName,
				type: survey.type,
				score: survey.score,
				verbatim: survey.verbatim ?? '',
				detractor: isDetractor(survey),
				theme: survey.theme?.key ?? null,
				highlight: survey.theme?.highlight ?? null,
			};
		});

	return {
		bands,
		byAgent,
		comments,
		commentary: commentaryOf(calls, previousCalls, granularity),
	};
}
