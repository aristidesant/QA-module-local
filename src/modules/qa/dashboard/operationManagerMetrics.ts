import type { TriggerRule } from '~/models/qa';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import {
	scopeAgents,
	buildSegmentSeries,
	periodKeyOf,
	isNegativeCallEmotion,
	burnoutLevelsByAgent,
} from '~/modules/qa/analytics/helpers';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { aggregateDashboardMetrics } from '~/modules/qa/calls/agentMetrics';
import type { ThresholdSettings } from '~/modules/qa/settings/types';
import { BurnoutRiskLevel } from './types/burnoutRisk';
import { dashboardLineOfBusinessFor } from './lineOfBusiness';

/** Team names in roster order, one chart line each. */
export const OPERATION_MANAGER_TEAMS: string[] = TEAM_SUPERVISORS.map(
	(supervisor) => supervisor.team
);

/** Short windows get a point per day, longer ones a point per ISO week. */
export const chartGranularity = (days: number): 'daily' | 'weekly' =>
	days <= 14 ? 'daily' : 'weekly';

export type TeamTrendMetric =
	| 'QA_OVERALL_SCORE'
	| 'COMPLIANCE_OVERALL_SCORE'
	| 'CUSTOMER_SENTIMENT_SCORE';

/** One point per period with a value per team; `label` is what the X axis shows. */
export interface TeamSeriesPoint {
	period: string;
	label: string;
	[team: string]: number | string | null;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** `2026-W30` → `W30`; `2026-09-12` → `12 Sep`. */
const periodLabel = (period: string): string => {
	const week = period.match(/-W(\d{2})$/);
	if (week) return `W${week[1]}`;
	return new Date(`${period}T00:00:00Z`).toLocaleDateString('en', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC',
	});
};

/** QA, compliance or customer sentiment per team over the window. */
export const buildTeamPerformanceSeries = (
	calls: TeamCallMetric[],
	days: number,
	metric: TeamTrendMetric
): TeamSeriesPoint[] =>
	buildSegmentSeries(
		calls,
		'team',
		metric,
		addDays(TODAY, -(days - 1)),
		TODAY,
		chartGranularity(days),
		OPERATION_MANAGER_TEAMS
	).map((point) => ({ ...point, label: periodLabel(point.period) }));

/**
 * Burnout proxy per team: the share of calls whose agent emotion is negative,
 * the driver behind the medium burnout rule. Teams without calls in a period get null.
 */
export const buildTeamBurnoutSeries = (
	calls: TeamCallMetric[],
	days: number
): TeamSeriesPoint[] => {
	const granularity = chartGranularity(days);
	const from = addDays(TODAY, -(days - 1));
	const totals = new Map<
		string,
		Map<string, { total: number; negative: number }>
	>();
	for (const call of calls) {
		const day = call.date.slice(0, 10);
		if (day < from || day > TODAY) continue;
		const period = periodKeyOf(call.date, granularity);
		const byTeam = totals.get(period) ?? new Map();
		const entry = byTeam.get(call.team) ?? { total: 0, negative: 0 };
		entry.total += 1;
		if (isNegativeCallEmotion(call.agentEmotion)) entry.negative += 1;
		byTeam.set(call.team, entry);
		totals.set(period, byTeam);
	}
	return [...totals.keys()].sort().map((period) => {
		const point: TeamSeriesPoint = { period, label: periodLabel(period) };
		const byTeam = totals.get(period)!;
		for (const team of OPERATION_MANAGER_TEAMS) {
			const entry = byTeam.get(team);
			point[team] = entry ? round1((100 * entry.negative) / entry.total) : null;
		}
		return point;
	});
};

export interface PlatformBurnoutSummary {
	level: BurnoutRiskLevel;
	counts: Record<BurnoutRiskLevel, number>;
	total: number;
	atRisk: number;
}

/**
 * Platform-wide burnout read from the live trigger rules.
 * Headline cut-points: HIGH when at least 15% of agents are high or at least 40% are at risk,
 * MEDIUM when at least 15% are at risk, otherwise LOW.
 */
export const platformBurnoutSummary = (
	rules: TriggerRule[]
): PlatformBurnoutSummary => {
	const levels = burnoutLevelsByAgent(rules);
	const agents = scopeAgents('qa-manager');
	const counts: Record<BurnoutRiskLevel, number> = {
		[BurnoutRiskLevel.LOW]: 0,
		[BurnoutRiskLevel.MEDIUM]: 0,
		[BurnoutRiskLevel.HIGH]: 0,
	};
	for (const agent of agents) {
		counts[levels[agent.id] ?? BurnoutRiskLevel.LOW] += 1;
	}
	const total = agents.length;
	const atRisk =
		counts[BurnoutRiskLevel.MEDIUM] + counts[BurnoutRiskLevel.HIGH];
	const high = counts[BurnoutRiskLevel.HIGH];
	const share = (value: number) => (total === 0 ? 0 : value / total);
	const level =
		share(high) >= 0.15 || share(atRisk) >= 0.4
			? BurnoutRiskLevel.HIGH
			: share(atRisk) >= 0.15
				? BurnoutRiskLevel.MEDIUM
				: BurnoutRiskLevel.LOW;
	return { level, counts, total, atRisk };
};

export interface CampaignPerformanceRow {
	id: string;
	name: string;
	lineOfBusiness: string | null;
	calls: number;
	qaScore: number;
	compliance: number;
	customerSentiment: number;
	autoFails: number;
	conversionRate: number | null;
}

/** One row per campaign that has calls in the window, busiest first. */
export const buildCampaignPerformanceRows = (
	calls: TeamCallMetric[],
	thresholds: ThresholdSettings
): CampaignPerformanceRow[] => {
	const groups = new Map<string, TeamCallMetric[]>();
	for (const call of calls) {
		groups.set(call.campaignId, [...(groups.get(call.campaignId) ?? []), call]);
	}
	return [...groups.entries()]
		.map(([id, group]) => {
			const metrics = aggregateDashboardMetrics(group, thresholds);
			const categories = metrics.complianceCategories;
			const compliance = categories.length
				? Math.round(
						categories.reduce((sum, category) => sum + category.score, 0) /
							categories.length
					)
				: 0;
			return {
				id,
				name: group[0].campaignName,
				lineOfBusiness: dashboardLineOfBusinessFor(id),
				calls: metrics.calls,
				qaScore: metrics.qa.total,
				compliance,
				customerSentiment: metrics.sentiment.customerAvg,
				autoFails: metrics.autoFails,
				conversionRate:
					metrics.sales && metrics.sales.offered > 0
						? Math.round((100 * metrics.sales.sold) / metrics.sales.offered)
						: null,
			};
		})
		.sort((a, b) => b.calls - a.calls);
};
