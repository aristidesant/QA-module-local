import dayjs from 'dayjs';
import type { DisputeCase } from '~/models/qa/disputeCases';
import type { CoachingSessionRecord } from '~/models/qa/coaching';
import type { LmsAssignment } from '~/models/qa/lms';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import type {
	ReportDefinition,
	ReportSectionKey,
} from '~/models/qa/reportBuilder';
import type {
	ComparisonSeriesPoint,
	GroupByDimension,
	SegmentMetricId,
	SegmentRow,
	TeamKpis,
} from '~/modules/qa/analytics/types';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import {
	alignedComparisonSeries,
	assessBurnout,
	buildSegments,
	burnoutCandidates,
	computeKpis,
	filterCalls,
	previousPeriod,
	scopeAgents,
	shiftFilters,
} from '~/modules/qa/analytics/helpers';
import { TEAM_PROFILES } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { casesForRole } from '~/modules/qa/disputes/cases/helpers';
import { computeStandings, leader } from '~/modules/qa/rankings/helpers';
import { SECTION_METRICS } from './constants';
import { buildAliasMap, toAnalyticsFilters, visibleSections } from './helpers';

export interface CoachingSectionRow {
	agentName: string;
	sessions: number;
	assignments: number;
	completed: number;
}

export interface BurnoutSectionRow {
	agentName: string;
	level: string;
	percentage: number;
}

export interface RankingSectionRow {
	name: string;
	status: string;
	period: string;
	leader: string | null;
	winner: string | null;
}

export type ReportSectionData =
	| {
			key: 'overview';
			kpis: TeamKpis;
			previous: TeamKpis;
			series: ComparisonSeriesPoint[];
	  }
	| {
			key: 'qa' | 'compliance' | 'sentiment' | 'business';
			metricIds: SegmentMetricId[];
			primary: SegmentMetricId;
			rows: SegmentRow[];
			series: ComparisonSeriesPoint[];
	  }
	| {
			key: 'campaigns' | 'agents';
			metricIds: SegmentMetricId[];
			primary: SegmentMetricId;
			rows: SegmentRow[];
	  }
	| {
			key: 'coaching';
			sessions: number;
			completed: number;
			overdue: number;
			rows: CoachingSectionRow[];
	  }
	| {
			key: 'disputes';
			open: number;
			accepted: number;
			rejected: number;
			acceptanceRate: number | null;
			rows: DisputeCase[];
	  }
	| { key: 'burnout'; rows: BurnoutSectionRow[] }
	| { key: 'rankings'; rows: RankingSectionRow[] };

export interface ReportStores {
	cases: DisputeCase[];
	programs: RankingProgram[];
	sessions: CoachingSessionRecord[];
	assignments: LmsAssignment[];
}

export interface ReportData {
	definition: ReportDefinition;
	role: TeamRole;
	generatedAt: string;
	kpis: TeamKpis;
	previousKpis: TeamKpis;
	sections: ReportSectionData[];
}

const inPeriod = (iso: string, from: string, to: string): boolean => {
	const day = iso.slice(0, 10);
	return day >= from && day <= to;
};

/** Assembles every section of a report from the analytics dataset and the stores. */
export const buildReportData = (
	definition: ReportDefinition,
	role: TeamRole,
	stores: ReportStores
): ReportData => {
	const filters = toAnalyticsFilters(definition);
	const { from, to } = definition.period;
	const calls = filterCalls(TEAM_CALLS, filters, role);
	const previousCalls = filterCalls(
		TEAM_CALLS,
		shiftFilters(filters, previousPeriod(filters)),
		role
	);

	const kpis = computeKpis(calls);
	const previousKpis = computeKpis(previousCalls);

	// Client reports replace agent names with stable pseudonyms.
	const alias =
		definition.audience === 'client' && !definition.showAgentNames
			? buildAliasMap(scopeAgents(role).map((agent) => agent.id))
			: null;
	const nameOf = (agentId: string, agentName: string) =>
		alias?.[agentId] ?? agentName;

	const metricsFor = (key: ReportSectionKey): SegmentMetricId[] => {
		const defaults = SECTION_METRICS[key];
		const picked = defaults.filter((metricId) =>
			definition.metrics.includes(metricId)
		);
		return picked.length > 0 ? picked : defaults;
	};

	const segmentsFor = (key: ReportSectionKey, dimension: GroupByDimension) => {
		const metricIds = metricsFor(key);
		const rows = buildSegments(
			calls,
			previousCalls,
			dimension,
			metricIds,
			from,
			to,
			filters.minCalls
		).map((row) =>
			dimension === 'agent'
				? { ...row, label: nameOf(row.key, row.label) }
				: row
		);
		return { metricIds, primary: metricIds[0], rows };
	};

	const sections = visibleSections(definition).map((key): ReportSectionData => {
		switch (key) {
			case 'overview':
				return {
					key,
					kpis,
					previous: previousKpis,
					series: alignedComparisonSeries(
						calls,
						previousCalls,
						'QA_OVERALL_SCORE',
						filters
					),
				};

			case 'qa':
			case 'compliance':
			case 'sentiment':
			case 'business': {
				const { metricIds, primary, rows } = segmentsFor(
					key,
					definition.groupBy
				);
				return {
					key,
					metricIds,
					primary,
					rows,
					series: alignedComparisonSeries(
						calls,
						previousCalls,
						primary,
						filters
					),
				};
			}

			case 'campaigns':
				return { key, ...segmentsFor(key, 'campaign') };

			case 'agents':
				return { key, ...segmentsFor(key, 'agent') };

			case 'coaching': {
				const scoped = new Set(scopeAgents(role).map((agent) => agent.id));
				const sessions = stores.sessions.filter(
					(session) =>
						scoped.has(session.agentId) && inPeriod(session.date, from, to)
				);
				const assignments = stores.assignments.filter(
					(assignment) =>
						scoped.has(assignment.agentId) &&
						inPeriod(assignment.assignedAt, from, to)
				);

				const byAgent = new Map<string, CoachingSectionRow>();
				const rowFor = (agentId: string, agentName: string) => {
					const existing = byAgent.get(agentId);
					if (existing) return existing;
					const created: CoachingSectionRow = {
						agentName: nameOf(agentId, agentName),
						sessions: 0,
						assignments: 0,
						completed: 0,
					};
					byAgent.set(agentId, created);
					return created;
				};

				for (const session of sessions) {
					rowFor(session.agentId, session.agentName).sessions += 1;
				}
				for (const assignment of assignments) {
					const profile = TEAM_PROFILES[assignment.agentId];
					const entry = rowFor(
						assignment.agentId,
						profile?.agent.name ?? assignment.agentId
					);
					entry.assignments += 1;
					if (assignment.status === 'COMPLETED') entry.completed += 1;
				}

				return {
					key,
					sessions: sessions.length,
					completed: sessions.filter(
						(session) => session.status === 'COMPLETED'
					).length,
					overdue: assignments.filter(
						(assignment) => assignment.status === 'OVERDUE'
					).length,
					rows: [...byAgent.values()].sort((a, b) => b.sessions - a.sessions),
				};
			}

			case 'disputes': {
				const rows = casesForRole(stores.cases, role)
					.filter((dispute) => inPeriod(dispute.createdAt, from, to))
					.map((dispute) => ({
						...dispute,
						agentName: nameOf(dispute.agentId, dispute.agentName),
					}));
				const accepted = rows.filter(
					(dispute) => dispute.status === 'accepted'
				).length;
				const rejected = rows.filter(
					(dispute) => dispute.status === 'rejected'
				).length;

				return {
					key,
					open: rows.filter((dispute) => dispute.status === 'open').length,
					accepted,
					rejected,
					acceptanceRate:
						accepted + rejected === 0
							? null
							: Math.round((accepted / (accepted + rejected)) * 100),
					rows,
				};
			}

			case 'burnout':
				return {
					key,
					rows: burnoutCandidates(role).map((agent) => {
						const risk = assessBurnout(agent.id);
						return {
							agentName: nameOf(agent.id, agent.name),
							level: risk.level,
							percentage: risk.percentage,
						};
					}),
				};

			case 'rankings':
				return {
					key,
					rows: stores.programs
						.filter(
							(program) => program.startDate <= to && program.endDate >= from
						)
						.map((program) => {
							const top = leader(computeStandings(program, TEAM_CALLS));
							return {
								name: program.name,
								status: program.status,
								period: `${program.startDate} → ${program.endDate}`,
								leader: top ? nameOf(top.agentId, top.agentName) : null,
								winner: program.winnerName,
							};
						}),
				};
		}
	});

	return {
		definition,
		role,
		generatedAt: dayjs().toISOString(),
		kpis,
		previousKpis,
		sections,
	};
};
