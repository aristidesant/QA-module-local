import dayjs from 'dayjs';
import type { DisputeCase } from '~/models/qa/disputeCases';
import type { CoachingSessionRecord } from '~/models/qa/coaching';
import type { LmsAssignment } from '~/models/qa/lms';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import type {
	ReportDefinition,
	ReportSectionView,
	SubsectionedSectionKey,
} from '~/models/qa/reportBuilder';
import type {
	ComparisonSeriesPoint,
	GroupByDimension,
	SegmentMetricId,
	SegmentRow,
	SegmentSeriesPoint,
	TeamKpis,
} from '~/modules/qa/analytics/types';
import { OTHER_SEGMENT_KEY } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import {
	alignedComparisonSeries,
	assessBurnout,
	autoGranularity,
	buildSegmentSeries,
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
import {
	buildAliasMap,
	sectionViewOf,
	selectedSubsections,
	subsectionViewOf,
	toAnalyticsFilters,
	visibleSections,
} from './helpers';

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

/** One line per segment over time, for the line view of a grouped section. */
export interface SegmentLines {
	points: SegmentSeriesPoint[];
	/** Every segment in table order, with its value now and in the previous period for the small-multiple panels. */
	keys: {
		key: string;
		label: string;
		current: number | null;
		previous: number | null;
	}[];
}

/** The one table of a segment section: a column per metric of every selected subsection. */
export interface SectionTable {
	metricIds: SegmentMetricId[];
	/** The metric the change column compares: the first selected subsection's. */
	primary: SegmentMetricId;
	rows: SegmentRow[];
}

/** A subsection switched to a chart: what to plot above the section's table. Rows come from the table. */
export interface SubsectionBlock {
	sub: string;
	view: Exclude<ReportSectionView, 'table'>;
	/** The metric the chart plots. */
	primary: SegmentMetricId;
	/** Current vs previous period of `primary`; only for an ungrouped line view. */
	series: ComparisonSeriesPoint[] | null;
	/** One line per segment; only for a grouped line view. */
	lines: SegmentLines | null;
}

export type ReportSectionData =
	| {
			key: 'overview';
			view: ReportSectionView;
			kpis: TeamKpis;
			previous: TeamKpis;
			series: ComparisonSeriesPoint[];
	  }
	| {
			key:
				| 'qa'
				| 'compliance'
				| 'sentiment'
				| 'business'
				| 'surveys'
				| 'campaigns'
				| 'agents';
			table: SectionTable;
			/** Only the subsections switched to bars or lines, in catalogue order. */
			blocks: SubsectionBlock[];
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

	/** One line per segment, in table order, over the report's period. Reports never fold rows, so every segment is here. */
	const linesFor = (
		rows: SegmentRow[],
		dimension: GroupByDimension,
		primary: SegmentMetricId
	): SegmentLines => {
		const segments = rows.filter((row) => row.key !== OTHER_SEGMENT_KEY);
		return {
			points: buildSegmentSeries(
				calls,
				dimension,
				primary,
				from,
				to,
				autoGranularity(from, to),
				segments.map((row) => row.key)
			),
			keys: segments.map((row) => ({
				key: row.key,
				label: row.label,
				current: row.metrics[primary] ?? null,
				previous: row.previous[primary] ?? null,
			})),
		};
	};

	/** The section's table (every selected subsection as columns) and a chart block per subsection switched to bars or lines. */
	const blocksFor = (
		key: SubsectionedSectionKey,
		dimension: GroupByDimension
	): { table: SectionTable; blocks: SubsectionBlock[] } => {
		const subsections = selectedSubsections(definition, key);
		const metricIds = [...new Set(subsections.flatMap((sub) => sub.metricIds))];
		const rows = buildSegments(
			calls,
			previousCalls,
			dimension,
			metricIds,
			from,
			to,
			filters.minCalls,
			// A report lists every segment in scope: no "Other" fold.
			Infinity
		).map((row) =>
			dimension === 'agent'
				? { ...row, label: nameOf(row.key, row.label) }
				: row
		);
		const blocks: SubsectionBlock[] = [];
		for (const sub of subsections) {
			const view = subsectionViewOf(definition, key, sub.key);
			if (view === 'table') continue;
			const primary = sub.metricIds[0];
			const lines =
				view === 'line' && dimension !== 'none'
					? linesFor(rows, dimension, primary)
					: null;
			blocks.push({
				sub: sub.key,
				view,
				primary,
				series:
					view === 'line' && !lines
						? alignedComparisonSeries(calls, previousCalls, primary, filters)
						: null,
				lines,
			});
		}
		return { table: { metricIds, primary: metricIds[0], rows }, blocks };
	};

	const sections = visibleSections(definition).map((key): ReportSectionData => {
		switch (key) {
			case 'overview':
				return {
					key,
					view: sectionViewOf(definition, key),
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
			case 'business':
			case 'surveys':
				return { key, ...blocksFor(key, definition.groupBy) };

			case 'campaigns':
			case 'agents':
				return {
					key,
					...blocksFor(key, key === 'campaigns' ? 'campaign' : 'agent'),
				};

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
							(program) =>
								program.startDate <= to &&
								(program.endDate ?? '9999-12-31') >= from
						)
						.map((program) => {
							const top = leader(computeStandings(program, TEAM_CALLS));
							return {
								name: program.name,
								status: program.status,
								period: `${program.startDate} → ${program.endDate ?? 'ongoing'}`,
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
