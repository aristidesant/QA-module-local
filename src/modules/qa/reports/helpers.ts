import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type {
	ReportDefinition,
	ReportFrequency,
	ReportSchedule,
	ReportSectionKey,
} from '~/models/qa/reportBuilder';
import type { TeamAnalyticsFilters } from '~/modules/qa/analytics/types';
import { DEFAULT_FILTERS } from '~/modules/qa/analytics/constants';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { CLIENT_SECTIONS } from './constants';

dayjs.extend(relativeTime);

/** Relative dates are measured against the demo clock, not the wall clock. */
export const fromMockNow = (iso: string): string =>
	dayjs(iso).from(dayjs(NOW_ISO));

/** Analytics filters equivalent to a report definition's period and scope. */
export const toAnalyticsFilters = (
	definition: ReportDefinition
): TeamAnalyticsFilters => {
	const { period, scope } = definition;
	// Teams are expressed through their supervisor unless specific ones are picked.
	const supervisorIds =
		scope.supervisorIds.length > 0
			? scope.supervisorIds
			: TEAM_SUPERVISORS.filter((supervisor) =>
					scope.teams.includes(supervisor.team)
				).map((supervisor) => supervisor.id);

	return {
		...DEFAULT_FILTERS,
		from: period.from,
		to: period.to,
		quickRange: period.preset,
		compareWithPrevious: period.compareWithPrevious,
		supervisorIds,
		agentIds: scope.agentIds,
		campaignIds: scope.campaignIds,
		linesOfBusiness: scope.linesOfBusiness,
	};
};

/** Sections the audience is allowed to see, in the definition's own order. */
export const visibleSections = (
	definition: ReportDefinition
): ReportSectionKey[] =>
	definition.audience === 'client'
		? definition.sections.filter((section) => CLIENT_SECTIONS.includes(section))
		: definition.sections;

/** Reports a role may open: supervisors only see their own team's. */
export const definitionsForRole = (
	definitions: ReportDefinition[],
	role: TeamRole
): ReportDefinition[] =>
	role === 'qa-manager'
		? definitions
		: definitions.filter(
				(definition) =>
					definition.createdByRole === 'SUPERVISOR' ||
					definition.scope.teams.includes('Team 1')
			);

/** Next delivery after `from` for a schedule, as an ISO datetime. */
export const nextRunAt = (
	frequency: ReportFrequency,
	dayOfWeek: number,
	time: string,
	from: string = NOW_ISO
): string => {
	const [hour, minute] = time.split(':').map(Number);
	const base = dayjs(from).hour(hour).minute(minute).second(0).millisecond(0);

	if (frequency === 'MONTHLY') {
		const day = Math.min(Math.max(dayOfWeek, 1), 28);
		const thisMonth = base.date(day);
		return (
			thisMonth.isAfter(dayjs(from)) ? thisMonth : thisMonth.add(1, 'month')
		).toISOString();
	}

	const step = frequency === 'BIWEEKLY' ? 14 : 7;
	let next = base.day(dayOfWeek);
	if (!next.isAfter(dayjs(from))) next = next.add(step, 'day');
	return next.toISOString();
};

/** "Team 1, Team 2" / "All teams" — the scope line of the cover page. */
export const scopeSummary = (
	definition: ReportDefinition,
	allTeamsLabel: string
): string => {
	const parts: string[] = [];
	parts.push(
		definition.scope.teams.length > 0
			? definition.scope.teams.join(', ')
			: allTeamsLabel
	);
	if (definition.scope.campaignIds.length > 0) {
		parts.push(`${definition.scope.campaignIds.length} campaigns`);
	}
	if (definition.scope.agentIds.length > 0) {
		parts.push(`${definition.scope.agentIds.length} agents`);
	}
	return parts.join(' · ');
};

/** Stable pseudonyms for client reports: sorted agent ids become Agent 01, 02… */
export const buildAliasMap = (agentIds: string[]): Record<string, string> =>
	Object.fromEntries(
		[...new Set(agentIds)]
			.sort()
			.map((id, index) => [id, `Agent ${String(index + 1).padStart(2, '0')}`])
	);

export const slugify = (value: string): string =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'report';

export const scheduleLabelOf = (
	schedule: ReportSchedule | null
): string | null => (schedule && schedule.enabled ? schedule.frequency : null);
