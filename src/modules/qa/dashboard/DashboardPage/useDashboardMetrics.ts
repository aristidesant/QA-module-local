import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Evaluation, EvaluationListQueryParams } from '~/models/qa';
import { useAgentsQuery } from '~/queries/qa/agentsQueries';
import { useDisputesQuery } from '~/queries/qa/disputesQueries';
import { useEvaluationsQuery } from '~/queries/qa/evaluationsQueries';
import { useHealthQuery } from '~/queries/qa/healthQueries';
import type { DashboardTimeRange } from '~/stores/qaDashboardFilterStore';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import {
	AGENT_NAME_MAP_LIMIT,
	DISPUTES_PAGE_LIMIT,
	EVALUATION_WINDOW_LIMIT,
	RECENT_EVALUATIONS_COUNT,
} from './DashboardPage.constants';
import {
	aiStatusBreakdown,
	bucketEvaluations,
	computeKpis,
	filterByCreatedAt,
	rangeStartFor,
	topAgentsByAvgScore,
} from './DashboardPage.helpers';

/**
 * Constant window params so every time range shares one cached query;
 * switching ranges only re-filters client-side (disputes refetch server-side).
 */
const EVALUATION_WINDOW_PARAMS: EvaluationListQueryParams = {
	limit: EVALUATION_WINDOW_LIMIT,
	sortBy: 'createdAt',
	orderBy: 'DESC',
};

export function useDashboardMetrics(timeRange: DashboardTimeRange) {
	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? 'en';
	const rangeStart = useMemo(
		() => rangeStartFor(timeRange, new Date()),
		[timeRange]
	);

	const evaluationsQuery = useEvaluationsQuery(EVALUATION_WINDOW_PARAMS);
	const disputesQuery = useDisputesQuery({
		...(rangeStart ? { createdAtFrom: rangeStart.toISOString() } : {}),
		sortBy: 'createdAt',
		orderBy: 'DESC',
		limit: DISPUTES_PAGE_LIMIT,
	});
	const agentsQuery = useAgentsQuery({ limit: AGENT_NAME_MAP_LIMIT });
	const healthQuery = useHealthQuery();

	const evaluations = useMemo(
		() => evaluationsQuery.data?.data ?? [],
		[evaluationsQuery.data]
	);
	const evaluationsTotal = evaluationsQuery.data?.total ?? 0;
	const disputes = useMemo(
		() => disputesQuery.data?.data ?? [],
		[disputesQuery.data]
	);
	const disputesTotal = disputesQuery.data?.total ?? 0;

	const agentNameById = useMemo(() => {
		const map = new Map<number, string>();
		for (const agent of agentsQuery.data?.data ?? []) {
			map.set(agent.id, getAgentDisplayName(agent));
		}

		return map;
	}, [agentsQuery.data]);

	const resolveAgentName = useMemo(
		() => (evaluation: Evaluation) => {
			if (evaluation.agent) return getAgentDisplayName(evaluation.agent);

			return agentNameById.get(evaluation.agentId) ?? `#${evaluation.agentId}`;
		},
		[agentNameById]
	);

	const inRangeEvaluations = useMemo(
		() => filterByCreatedAt(evaluations, rangeStart),
		[evaluations, rangeStart]
	);

	const kpis = useMemo(
		() =>
			computeKpis({
				evaluations: inRangeEvaluations,
				evaluationsTotal,
				range: timeRange,
				disputes,
				disputesTotal,
			}),
		[inRangeEvaluations, evaluationsTotal, timeRange, disputes, disputesTotal]
	);

	const trend = useMemo(
		() => bucketEvaluations(inRangeEvaluations, timeRange, new Date(), locale),
		[inRangeEvaluations, timeRange, locale]
	);

	const aiStatus = useMemo(
		() => aiStatusBreakdown(inRangeEvaluations),
		[inRangeEvaluations]
	);

	const topAgents = useMemo(
		() => topAgentsByAvgScore(inRangeEvaluations, resolveAgentName),
		[inRangeEvaluations, resolveAgentName]
	);

	const recentEvaluations = useMemo(
		() => inRangeEvaluations.slice(0, RECENT_EVALUATIONS_COUNT),
		[inRangeEvaluations]
	);

	return {
		evaluationsQuery,
		disputesQuery,
		healthQuery,
		kpis,
		trend,
		aiStatus,
		topAgents,
		recentEvaluations,
		resolveAgentName,
		/** The window is bounded; ranged metrics are approximate past this point. */
		showWindowNotice: evaluationsTotal > EVALUATION_WINDOW_LIMIT,
	};
}
