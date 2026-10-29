import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { TFunction } from 'i18next';
import type {
	ChartableSectionKey,
	ReportDefinition,
	ReportDraft,
	ReportFrequency,
	ReportSchedule,
	ReportScope,
	ReportSectionKey,
	ReportSectionView,
	SubsectionedSectionKey,
} from '~/models/qa/reportBuilder';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import type { TeamAnalyticsFilters } from '~/modules/qa/analytics/types';
import { DEFAULT_FILTERS } from '~/modules/qa/analytics/constants';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { TEAM_CAMPAIGNS, TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { RosterAgent, TeamRole } from '~/modules/qa/team/types';
import {
	CLIENT_SECTIONS,
	DEFAULT_SECTION_VIEW,
	SUBSECTIONS,
	type ReportSubsection,
} from './constants';

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

/**
 * Agents a report covers: the ones picked by hand, else everyone in the role's
 * roster narrowed by team, supervisor, campaign and line of business. An
 * explicit pick wins over the narrowing filters.
 */
export const agentsInScope = (
	role: TeamRole,
	scope: ReportScope
): RosterAgent[] => {
	const roster = scopeAgents(role);
	if (scope.agentIds.length > 0)
		return roster.filter((agent) => scope.agentIds.includes(agent.id));

	return roster.filter((agent) => {
		if (scope.teams.length > 0 && !scope.teams.includes(agent.team))
			return false;
		if (
			scope.supervisorIds.length > 0 &&
			!scope.supervisorIds.includes(agent.supervisorId)
		)
			return false;
		if (
			scope.campaignIds.length > 0 &&
			!agent.campaignIds.some((id) => scope.campaignIds.includes(id))
		)
			return false;
		if (
			scope.linesOfBusiness.length > 0 &&
			!TEAM_CAMPAIGNS.some(
				(campaign) =>
					agent.campaignIds.includes(campaign.id) &&
					scope.linesOfBusiness.includes(campaign.lineOfBusiness)
			)
		)
			return false;
		return true;
	});
};

/** The view a definition asks for a section, falling back to the section's default. */
export const sectionViewOf = (
	definition: Pick<ReportDefinition, 'sectionViews'>,
	key: ChartableSectionKey
): ReportSectionView =>
	definition.sectionViews?.[key] ?? DEFAULT_SECTION_VIEW[key];

/** Subsections a definition asks for in a section, in catalogue order; none picked means all of them. */
export const selectedSubsections = (
	definition: Pick<ReportDefinition, 'subsections'>,
	section: SubsectionedSectionKey
): ReportSubsection[] => {
	const picked = definition.subsections?.[section];
	const all = SUBSECTIONS[section];
	if (!picked || picked.length === 0) return all;
	const chosen = all.filter((sub) => picked.includes(sub.key));
	return chosen.length > 0 ? chosen : all;
};

/** The view of one subsection: its own choice, else the section's. */
export const subsectionViewOf = (
	definition: Pick<ReportDefinition, 'sectionViews' | 'subsectionViews'>,
	section: SubsectionedSectionKey,
	subsection: string
): ReportSectionView =>
	definition.subsectionViews?.[`${section}.${subsection}`] ??
	sectionViewOf(definition, section);

/** The view shared by a section's selected subsections, or 'mixed' when they differ. */
export const effectiveSectionView = (
	definition: Pick<
		ReportDefinition,
		'sectionViews' | 'subsectionViews' | 'subsections'
	>,
	section: ChartableSectionKey
): ReportSectionView | 'mixed' => {
	if (section === 'overview') return sectionViewOf(definition, section);
	const views = new Set(
		selectedSubsections(definition, section).map((sub) =>
			subsectionViewOf(definition, section, sub.key)
		)
	);
	return views.size === 1 ? [...views][0] : 'mixed';
};

export type BuilderStep = 'audience' | 'sections' | 'period' | 'output';

/** One line per builder step, shown in its header so progress reads without opening it. */
export const stepSummaries = (
	draft: ReportDraft,
	role: TeamRole,
	t: TFunction<'qa.reports'>
): Record<BuilderStep, string> => {
	const period =
		draft.period.preset === 'custom'
			? t('preview.period', { from: draft.period.from, to: draft.period.to })
			: t(`period.presets.${draft.period.preset}`);
	const agents = t('scope.agentCount', {
		count: agentsInScope(role, draft.scope).length,
		total: scopeAgents(role).length,
	});
	const schedule = draft.schedule?.enabled
		? t(`output.frequencies.${draft.schedule.frequency}`)
		: t('steps.summaries.noSchedule');
	return {
		audience: `${t(`audience.${draft.audience}`)} · ${draft.name.trim() || t('preview.untitled')}`,
		sections: t('sections.selected', { count: draft.sections.length }),
		period: `${agents} · ${period}`,
		output: `${draft.formats.join(', ') || '—'} · ${schedule}`,
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
