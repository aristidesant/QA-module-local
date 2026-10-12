import { useMemo } from 'react';
import { Group, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingRule,
	CoachingSessionRecord,
	LmsContent,
} from '~/models/qa';
import {
	AreaBadge,
	FormatBadge,
	ImpactBadge,
} from '~/modules/qa/lms/components/Badges';
import { LMS_AREA_META } from '~/modules/qa/lms/constants';
import type { AssignmentRow } from '~/modules/qa/lms/helpers';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import type { RosterAgent, TeamRole } from '~/modules/qa/team/types';
import { ScorecardTrendBadge } from '../../components/ScorecardBadges';
import { countVerdicts, impactByArea } from '../../helpers';
import {
	sessionImpacts,
	summarizeSessionImpacts,
	type SessionImpactRow,
} from '../../postCoaching';

/** An improved rate at or above this share is shown in green. */
const IMPACT_RATE_GOOD = 60;
/** How many recently measured sessions the sessions card lists. */
const RECENT_SESSIONS = 8;

type Verdict = 'IMPROVED' | 'SAME' | 'DECLINED';

interface ContentEffectivenessRow {
	contentId: string;
	title: string;
	content: LmsContent | undefined;
	measured: number;
	improved: number;
	same: number;
	declined: number;
	avgDelta: number;
}

interface TeamImpactRow {
	team: string;
	measured: number;
	improved: number;
	rate: number;
}

const contentHelper = createColumnHelper<ContentEffectivenessRow>();
const recentHelper = createColumnHelper<AssignmentRow>();
const ruleHelper = createColumnHelper<CoachingRule>();
const teamHelper = createColumnHelper<TeamImpactRow>();
const sessionRecentHelper = createColumnHelper<SessionImpactRow>();

interface ImpactTabProps {
	rows: AssignmentRow[];
	sessions: CoachingSessionRecord[];
	/** Agents of the viewer's scope; sessions of anyone else are not measured. */
	agents: Pick<RosterAgent, 'id' | 'name'>[];
	rules: CoachingRule[];
	contentById: Record<string, LmsContent>;
	role: TeamRole;
	onOpenAgent: (agentId: string) => void;
}

export function ImpactTab({
	rows,
	sessions,
	agents,
	rules,
	contentById,
	role,
	onOpenAgent,
}: ImpactTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms', 'qa.triggers']);

	const measuredRows = useMemo(
		() => rows.filter((r) => r.impact && r.impact.verdict !== 'PENDING'),
		[rows]
	);

	const sessionRows = useMemo(
		() => sessionImpacts(sessions, agents),
		[sessions, agents]
	);
	const measuredSessions = useMemo(
		() => sessionRows.filter((r) => r.verdict !== 'PENDING'),
		[sessionRows]
	);
	const sessionSummaries = useMemo(
		() => summarizeSessionImpacts(sessionRows),
		[sessionRows]
	);
	const recentSessions = useMemo(
		() =>
			[...measuredSessions]
				.sort((a, b) => b.day.localeCompare(a.day))
				.slice(0, RECENT_SESSIONS),
		[measuredSessions]
	);

	// Every measurement on the tab, materials and sessions together.
	const kpis = useMemo(
		() =>
			countVerdicts([
				...measuredRows.map((r) => r.impact!.verdict as Verdict),
				...measuredSessions.map((r) => r.verdict as Verdict),
			]),
		[measuredRows, measuredSessions]
	);

	const areaRows = useMemo(
		() => impactByArea(rows, contentById),
		[rows, contentById]
	);
	const chartData = areaRows.map((a) => ({
		area: t(LMS_AREA_META[a.area].labelKey, { ns: 'qa.lms' }),
		improved: a.improved,
		same: a.same,
		declined: a.declined,
	}));

	const contentRows = useMemo<ContentEffectivenessRow[]>(() => {
		const map = new Map<string, AssignmentRow[]>();
		for (const r of measuredRows) {
			map.set(r.contentId, [...(map.get(r.contentId) ?? []), r]);
		}
		return [...map.entries()]
			.filter(([, list]) => list.length >= 2)
			.map(([contentId, list]) => {
				const deltas = list
					.filter((r) => r.impact?.checkpoint30 !== null && r.impact !== null)
					.map((r) => (r.impact!.checkpoint30 as number) - r.impact!.baseline);
				const content = contentById[contentId];
				const higherIsBetter = content?.impactMetricId
					? METRIC_BY_ID[content.impactMetricId].higherIsBetter
					: true;
				const rawAvg = deltas.length
					? deltas.reduce((s, d) => s + d, 0) / deltas.length
					: 0;
				const counts = countVerdicts(
					list.map((r) => r.impact!.verdict as Verdict)
				);
				return {
					contentId,
					title: content?.title ?? contentId,
					content,
					measured: counts.measured,
					improved: counts.improved,
					same: counts.same,
					declined: counts.declined,
					avgDelta: Math.round((higherIsBetter ? rawAvg : -rawAvg) * 10) / 10,
				};
			})
			.sort(
				(a, b) =>
					b.improved / Math.max(1, b.measured) -
					a.improved / Math.max(1, a.measured)
			);
	}, [measuredRows, contentById]);

	const teamRows = useMemo<TeamImpactRow[]>(() => {
		const map = new Map<string, AssignmentRow[]>();
		for (const r of measuredRows)
			map.set(r.team, [...(map.get(r.team) ?? []), r]);
		return [...map.entries()]
			.map(([team, list]) => {
				const counts = countVerdicts(
					list.map((r) => r.impact!.verdict as Verdict)
				);
				return {
					team,
					measured: counts.measured,
					improved: counts.improved,
					rate: Math.round((counts.improved / counts.measured) * 100),
				};
			})
			.sort((a, b) => a.team.localeCompare(b.team));
	}, [measuredRows]);

	const recent = useMemo(
		() =>
			[...measuredRows]
				.sort((a, b) =>
					(b.completedAt ?? '').localeCompare(a.completedAt ?? '')
				)
				.slice(0, 10),
		[measuredRows]
	);

	const firedRules = rules.filter((r) => r.stats.triggeredLast30Days > 0);

	if (measuredRows.length === 0 && measuredSessions.length === 0) {
		return <EmptyState message={t('impact.empty')} />;
	}

	/** Signed change in the scorecard or metric, colored by direction. */
	const signedDelta = (value: number | null) =>
		value === null ? (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		) : (
			<Text size='sm' c={value > 0 ? 'green' : value < 0 ? 'red' : undefined}>
				{value > 0 ? '+' : ''}
				{value}
			</Text>
		);

	const rateText = (rate: number | null) =>
		rate === null ? (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		) : (
			<Text size='sm' c={rate >= IMPACT_RATE_GOOD ? 'green' : undefined}>
				{rate}%
			</Text>
		);

	const contentColumns: BaseTableColumnDef<ContentEffectivenessRow>[] = [
		contentHelper.accessor('title', {
			header: t('impact.columns.material'),
			cell: (info) => (
				<Stack gap={2}>
					<Text size='sm'>{info.getValue()}</Text>
					<Group gap={4}>
						{info.row.original.content && (
							<FormatBadge
								format={info.row.original.content.format}
								size='xs'
							/>
						)}
						{info.row.original.content && (
							<AreaBadge area={info.row.original.content.area} size='xs' />
						)}
					</Group>
				</Stack>
			),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
		contentHelper.accessor('measured', {
			header: t('impact.columns.measured'),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
		contentHelper.accessor('improved', {
			header: t('impact.columns.improved'),
			cell: (info) => (
				<Text size='sm' fw={600}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
		contentHelper.accessor('same', {
			header: t('impact.columns.same'),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
		contentHelper.accessor('declined', {
			header: t('impact.columns.declined'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'red' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
		contentHelper.accessor('avgDelta', {
			header: t('impact.columns.avgDelta'),
			cell: (info) => signedDelta(info.getValue()),
		}) as BaseTableColumnDef<ContentEffectivenessRow>,
	];

	const recentColumns: BaseTableColumnDef<AssignmentRow>[] = [
		recentHelper.accessor('agentName', {
			header: t('impact.recentColumns.agent'),
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.accessor('contentTitle', {
			header: t('impact.recentColumns.material'),
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.accessor('completedAt', {
			header: t('impact.recentColumns.completed'),
			cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.display({
			id: 'metric',
			header: t('impact.recentColumns.metric'),
			cell: (info) => (
				<Text size='xs' c='dimmed'>
					{info.row.original.impact
						? t(`metrics.${info.row.original.impact.metricId}`, {
								ns: 'qa.triggers',
							})
						: '—'}
				</Text>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.display({
			id: 'before',
			header: t('impact.recentColumns.before'),
			cell: (info) => (
				<Text size='sm'>{info.row.original.impact?.baseline ?? '—'}</Text>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.display({
			id: 'after',
			header: t('impact.recentColumns.after'),
			cell: (info) => (
				<Text size='sm'>{info.row.original.impact?.checkpoint30 ?? '—'}</Text>
			),
		}) as BaseTableColumnDef<AssignmentRow>,
		recentHelper.display({
			id: 'verdict',
			header: t('impact.recentColumns.verdict'),
			cell: (info) => (
				<ImpactBadge impact={info.row.original.impact} size='xs' />
			),
		}) as BaseTableColumnDef<AssignmentRow>,
	];

	const ruleColumns: BaseTableColumnDef<CoachingRule>[] = [
		ruleHelper.accessor('name', {
			header: t('impact.columns.rule'),
		}) as BaseTableColumnDef<CoachingRule>,
		ruleHelper.accessor((r) => r.stats.triggeredLast30Days, {
			id: 'fired',
			header: t('impact.columns.fired'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CoachingRule>,
		ruleHelper.accessor((r) => r.stats.agentsAffected, {
			id: 'agents',
			header: t('impact.columns.agents'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CoachingRule>,
		ruleHelper.accessor((r) => r.stats.improvedRate, {
			id: 'rate',
			header: t('impact.columns.improvedRate'),
			cell: (info) => rateText(info.getValue()),
		}) as BaseTableColumnDef<CoachingRule>,
	];

	const sessionRecentColumns: BaseTableColumnDef<SessionImpactRow>[] = [
		sessionRecentHelper.accessor('agentName', {
			header: t('impact.recentColumns.agent'),
		}) as BaseTableColumnDef<SessionImpactRow>,
		sessionRecentHelper.display({
			id: 'session',
			header: t('impact.columns.session'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{t(`sessions.types.${info.row.original.type}`)}</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.topic}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<SessionImpactRow>,
		sessionRecentHelper.display({
			id: 'aspect',
			header: t('impact.columns.area'),
			cell: (info) => {
				const { area, dimension } = info.row.original;
				return (
					<Text size='xs' c='dimmed'>
						{area && dimension
							? t(LMS_AREA_META[area].labelKey, { ns: 'qa.lms' })
							: t('impact.composite')}
					</Text>
				);
			},
		}) as BaseTableColumnDef<SessionImpactRow>,
		sessionRecentHelper.display({
			id: 'beforeAfter',
			header: t('impact.columns.beforeAfter'),
			cell: (info) => (
				<Text size='sm'>
					{info.row.original.before} → {info.row.original.after}
				</Text>
			),
		}) as BaseTableColumnDef<SessionImpactRow>,
		sessionRecentHelper.display({
			id: 'verdict',
			header: t('impact.columns.verdict'),
			cell: (info) => {
				const r = info.row.original;
				if (r.verdict === 'PENDING' || r.before === null || r.after === null) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				return (
					<ScorecardTrendBadge
						size='xs'
						tooltipKey='impact.sessionTooltip'
						trend={{
							verdict: r.verdict,
							current: r.after,
							previous: r.before,
							delta: r.after - r.before,
						}}
					/>
				);
			},
		}) as BaseTableColumnDef<SessionImpactRow>,
	];

	const teamColumns: BaseTableColumnDef<TeamImpactRow>[] = [
		teamHelper.accessor('team', {
			header: t('impact.columns.team'),
		}) as BaseTableColumnDef<TeamImpactRow>,
		teamHelper.accessor('measured', {
			header: t('impact.columns.measured'),
		}) as BaseTableColumnDef<TeamImpactRow>,
		teamHelper.accessor('rate', {
			header: t('impact.columns.improvedRate'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap' w={150}>
					<Progress
						value={info.getValue()}
						size='sm'
						radius='xl'
						color='green'
						flex={1}
					/>
					<Text size='xs'>{info.getValue()}%</Text>
				</Group>
			),
		}) as BaseTableColumnDef<TeamImpactRow>,
	];

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard
					title={t('impact.kpi.measured')}
					value={kpis.measured}
					subtitle={t('impact.kpi.split', {
						materials: measuredRows.length,
						sessions: measuredSessions.length,
					})}
					variant='compact'
				/>
				<StatCard
					title={t('impact.kpi.improved')}
					value={kpis.improved}
					color='var(--mantine-color-green-7)'
					variant='compact'
				/>
				<StatCard
					title={t('impact.kpi.same')}
					value={kpis.same}
					variant='compact'
				/>
				<StatCard
					title={t('impact.kpi.declined')}
					value={kpis.declined}
					color={kpis.declined > 0 ? 'var(--mantine-color-red-7)' : undefined}
					variant='compact'
				/>
			</SimpleGrid>

			<SectionCard
				title={t('impact.byRule')}
				description={t('impact.byRuleDescription')}
			>
				<BaseTable<CoachingRule>
					data={firedRules}
					columns={ruleColumns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('impact.empty')}
				/>
			</SectionCard>

			<SectionCard
				title={t('impact.byContent')}
				description={t('impact.byContentDescription')}
			>
				<Stack gap='lg'>
					<BaseTable<ContentEffectivenessRow>
						data={contentRows}
						columns={contentColumns}
						getRowId={(r) => r.contentId}
						density='compact'
						emptyMessage={t('impact.empty')}
					/>
					<Stack gap='xs'>
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{t('impact.recent')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('impact.recentDescription')}
							</Text>
						</Stack>
						<BaseTable<AssignmentRow>
							data={recent}
							columns={recentColumns}
							getRowId={(r) => r.id}
							density='compact'
							emptyMessage={t('impact.empty')}
							onRowClick={(r) => onOpenAgent(r.agentId)}
						/>
					</Stack>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('impact.bySession')}
				description={t('impact.bySessionDescription')}
			>
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
						{sessionSummaries.map((summary) => (
							<StatCard
								key={summary.kind}
								title={t(`impact.sessionKind.${summary.kind}`)}
								value={
									summary.improvedRate !== null
										? `${summary.improvedRate}%`
										: '—'
								}
								color={
									summary.improvedRate !== null &&
									summary.improvedRate >= IMPACT_RATE_GOOD
										? 'var(--mantine-color-green-7)'
										: undefined
								}
								subtitle={t('impact.sessionKpi.subtitle', {
									measured: summary.measured,
									delta:
										summary.avgDelta !== null
											? `${summary.avgDelta > 0 ? '+' : ''}${summary.avgDelta}`
											: '—',
								})}
								variant='compact'
							/>
						))}
					</SimpleGrid>
					<BaseTable<SessionImpactRow>
						data={recentSessions}
						columns={sessionRecentColumns}
						getRowId={(r) => `${r.sessionId}-${r.agentId}`}
						density='compact'
						emptyMessage={t('impact.empty')}
						onRowClick={(r) => onOpenAgent(r.agentId)}
					/>
				</Stack>
			</SectionCard>

			{role === 'qa-manager' && (
				<SectionCard title={t('impact.byTeam')}>
					<BaseTable<TeamImpactRow>
						data={teamRows}
						columns={teamColumns}
						getRowId={(r) => r.team}
						density='compact'
						emptyMessage={t('impact.empty')}
					/>
				</SectionCard>
			)}

			<SectionCard
				title={t('impact.byArea')}
				description={t('impact.byAreaDescription')}
			>
				<Stack gap='md'>
					<BarChart
						h={200}
						data={chartData}
						dataKey='area'
						type='stacked'
						series={[
							{
								name: 'improved',
								label: t('impact.series.improved'),
								color: 'green.6',
							},
							{
								name: 'same',
								label: t('impact.series.same'),
								color: 'gray.5',
							},
							{
								name: 'declined',
								label: t('impact.series.declined'),
								color: 'red.6',
							},
						]}
						withLegend
					/>
					<SimpleGrid cols={4} spacing='xs'>
						{areaRows.map((a) => (
							<Stack key={a.area} gap={2}>
								<Text size='xs' c='dimmed' lineClamp={1}>
									{t(LMS_AREA_META[a.area].labelKey, { ns: 'qa.lms' })}
								</Text>
								<Text
									size='lg'
									fw={700}
									c={a.improvedRate >= IMPACT_RATE_GOOD ? 'green' : undefined}
								>
									{a.improvedRate}%
								</Text>
							</Stack>
						))}
					</SimpleGrid>
				</Stack>
			</SectionCard>
		</Stack>
	);
}
