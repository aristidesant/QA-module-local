import type { Evaluation, EvaluationDisputeSummary } from '~/models/qa';
import type { DashboardTimeRange } from '~/stores/qaDashboardFilterStore';
import {
	TOP_AGENTS_COUNT,
	TOP_AGENTS_MIN_EVALUATIONS,
} from './DashboardPage.constants';
import type {
	AgentScoreBar,
	AiStatusSegment,
	DashboardKpis,
	TrendBucket,
} from './DashboardPage.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const TREND_DAYS: Record<Exclude<DashboardTimeRange, 'TODAY'>, number> = {
	WEEK: 7,
	MONTH: 30,
	// ALL has no server-side horizon; the trend chart shows the last 30 days.
	ALL: 30,
};

function startOfDay(date: Date): Date {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);

	return start;
}

export function rangeStartFor(
	range: DashboardTimeRange,
	now: Date
): Date | null {
	switch (range) {
		case 'TODAY':
			return startOfDay(now);
		case 'WEEK':
			return startOfDay(new Date(now.getTime() - 6 * DAY_MS));
		case 'MONTH':
			return startOfDay(new Date(now.getTime() - 29 * DAY_MS));
		case 'ALL':
			return null;
	}
}

export function filterByCreatedAt(
	evaluations: Evaluation[],
	rangeStart: Date | null
): Evaluation[] {
	if (!rangeStart) return evaluations;

	const startMs = rangeStart.getTime();

	return evaluations.filter((evaluation) => {
		if (!evaluation.createdAt) return false;

		return new Date(evaluation.createdAt).getTime() >= startMs;
	});
}

export function computeKpis(input: {
	evaluations: Evaluation[];
	evaluationsTotal: number;
	range: DashboardTimeRange;
	disputes: EvaluationDisputeSummary[];
	disputesTotal: number;
}): DashboardKpis {
	const { evaluations, evaluationsTotal, range, disputes, disputesTotal } =
		input;
	const completed = evaluations.filter(
		(evaluation) => evaluation.status === 'COMPLETED'
	);
	const scored = completed.filter(
		(evaluation) => evaluation.overallScorePct != null
	);
	const aiEvaluations = evaluations.filter(
		(evaluation) => evaluation.evaluatorType === 'AI'
	);
	const failedAi = aiEvaluations.filter(
		(evaluation) => evaluation.aiEvaluationStatus === 'FAILED'
	);

	return {
		// For ALL the paginated total is exact; ranged counts are window-bound.
		evaluationsCount: range === 'ALL' ? evaluationsTotal : evaluations.length,
		completedCount: completed.length,
		avgScorePct:
			scored.length > 0
				? scored.reduce(
						(sum, evaluation) => sum + Number(evaluation.overallScorePct),
						0
					) / scored.length
				: null,
		aiEvaluationsCount: aiEvaluations.length,
		aiFailureRatePct:
			aiEvaluations.length > 0
				? (failedAi.length / aiEvaluations.length) * 100
				: null,
		disputesCount: disputesTotal,
		avgScoreDelta:
			disputes.length > 0
				? disputes.reduce((sum, dispute) => sum + dispute.scoreDelta, 0) /
					disputes.length
				: null,
	};
}

export function bucketEvaluations(
	evaluations: Evaluation[],
	range: DashboardTimeRange,
	now: Date,
	locale: string
): TrendBucket[] {
	const isHourly = range === 'TODAY';
	const bucketMs = isHourly ? HOUR_MS : DAY_MS;
	const formatter = new Intl.DateTimeFormat(
		locale,
		isHourly
			? { hour: '2-digit', minute: '2-digit' }
			: { day: 'numeric', month: 'short' }
	);

	let firstBucketStart: Date;
	let bucketCount: number;
	if (isHourly) {
		firstBucketStart = startOfDay(now);
		bucketCount = now.getHours() + 1;
	} else {
		bucketCount = TREND_DAYS[range];
		firstBucketStart = startOfDay(
			new Date(now.getTime() - (bucketCount - 1) * DAY_MS)
		);
	}

	const startMs = firstBucketStart.getTime();
	const buckets: TrendBucket[] = Array.from(
		{ length: bucketCount },
		(_, index) => ({
			label: formatter.format(new Date(startMs + index * bucketMs)),
			created: 0,
			completed: 0,
		})
	);

	const bucketIndexFor = (isoDate: string | null | undefined) => {
		if (!isoDate) return -1;

		const index = Math.floor(
			(new Date(isoDate).getTime() - startMs) / bucketMs
		);

		return index >= 0 && index < bucketCount ? index : -1;
	};

	for (const evaluation of evaluations) {
		const createdIndex = bucketIndexFor(evaluation.createdAt);
		if (createdIndex !== -1) buckets[createdIndex].created += 1;

		if (evaluation.status === 'COMPLETED') {
			const completedIndex = bucketIndexFor(
				evaluation.evaluatedAt ?? evaluation.createdAt
			);
			if (completedIndex !== -1) buckets[completedIndex].completed += 1;
		}
	}

	return buckets;
}

const AI_STATUS_ORDER = [
	'PENDING',
	'PROCESSING',
	'COMPLETED',
	'FAILED',
] as const;

export function aiStatusBreakdown(
	evaluations: Evaluation[]
): AiStatusSegment[] {
	const counts = new Map<string, number>();

	for (const evaluation of evaluations) {
		if (evaluation.evaluatorType !== 'AI' || !evaluation.aiEvaluationStatus) {
			continue;
		}

		counts.set(
			evaluation.aiEvaluationStatus,
			(counts.get(evaluation.aiEvaluationStatus) ?? 0) + 1
		);
	}

	return AI_STATUS_ORDER.filter((status) => (counts.get(status) ?? 0) > 0).map(
		(status) => ({ status, count: counts.get(status) ?? 0 })
	);
}

export function topAgentsByAvgScore(
	evaluations: Evaluation[],
	getAgentName: (evaluation: Evaluation) => string
): AgentScoreBar[] {
	const byAgent = new Map<
		number,
		{ sum: number; count: number; name: string }
	>();

	for (const evaluation of evaluations) {
		if (
			evaluation.status !== 'COMPLETED' ||
			evaluation.overallScorePct == null
		) {
			continue;
		}

		const entry = byAgent.get(evaluation.agentId) ?? {
			sum: 0,
			count: 0,
			name: getAgentName(evaluation),
		};
		entry.sum += Number(evaluation.overallScorePct);
		entry.count += 1;
		byAgent.set(evaluation.agentId, entry);
	}

	return [...byAgent.entries()]
		.filter(([, entry]) => entry.count >= TOP_AGENTS_MIN_EVALUATIONS)
		.map(([agentId, entry]) => ({
			agentId,
			agentName: entry.name,
			avgScorePct: Math.round((entry.sum / entry.count) * 10) / 10,
			evaluationsCount: entry.count,
		}))
		.sort((a, b) => b.avgScorePct - a.avgScorePct)
		.slice(0, TOP_AGENTS_COUNT);
}
