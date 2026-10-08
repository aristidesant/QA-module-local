import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { CoachingSessionRecord, LmsAssignment } from '~/models/qa';
import { getScoreBandColor } from '~/modules/qa/constants/badgeColors';
import { daysUntil, isOverdue } from '~/modules/qa/lms/helpers';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { AgentProfile, TeamRole } from '~/modules/qa/team/types';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import {
	ScorecardBadge,
	ScorecardDimensionBadge,
	ScorecardTrendBadge,
} from '../../components/ScorecardBadges';
import {
	SCORECARD_DIMENSION_META,
	SCORECARD_DIMENSION_ORDER,
	TIER_META,
	TIER_ORDER,
	buildAgentScorecard,
	type PerformanceTier,
	type ScorecardDimension,
	type ScorecardTrend,
	type WeeklyScorecard,
} from '../../scorecard';
import styles from './AgentsTab.module.css';

/** The period selector is hidden for now; the tab keeps working on the default (weekly). */
const SHOW_PERIOD_SELECTOR = false;

/** Evaluation periods and the days each one looks back over. */
const EVALUATION_PERIODS = [
	{ value: 'WEEKLY', days: 7 },
	{ value: 'MONTHLY', days: 30 },
	{ value: 'QUARTERLY', days: 90 },
] as const;
type EvaluationPeriod = (typeof EVALUATION_PERIODS)[number]['value'];

/** Not a real scorecard aspect: a synthetic filter value for the "Weakest aspect" dropdown. */
const BURNOUT_RISK_FILTER = 'BURNOUT_RISK';

export interface AgentCoachingRow {
	id: string;
	name: string;
	team: string;
	supervisorId: string;
	/** This week's scorecard; null when the agent has no evaluated calls in the last 7 days. */
	scorecard: WeeklyScorecard | null;
	tier: PerformanceTier | null;
	/** This week's scorecard against the previous week's. */
	trend: ScorecardTrend | null;
	weakest: { dimension: ScorecardDimension; value: number } | null;
	pending: number;
	overdue: number;
	/** Dates of the agent's coaching sessions; counted over the evaluation period. */
	sessionDates: string[];
	/** Has at least one coaching session still scheduled. */
	pendingSession: boolean;
	/** Coaching rules that fired for the agent (assigned content or created a session), with the date. */
	ruleEvents: { ruleId: string; date: string }[];
}

const helper = createColumnHelper<AgentCoachingRow>();

export function buildAgentRows(
	profiles: AgentProfile[],
	assignments: LmsAssignment[],
	sessions: CoachingSessionRecord[]
): AgentCoachingRow[] {
	return profiles.map((p) => {
		const mine = assignments.filter((a) => a.agentId === p.agent.id);
		const open = mine.filter((a) => a.status !== 'COMPLETED');
		const sc = buildAgentScorecard(p.agent.id);

		return {
			id: p.agent.id,
			name: p.agent.name,
			team: p.agent.team,
			supervisorId: p.agent.supervisorId,
			scorecard: sc.current,
			tier: sc.tier,
			trend: sc.trend,
			weakest: sc.weakest,
			pending: mine.filter(
				(a) =>
					a.acceptance.status === 'PENDING' ||
					a.acceptance.status === 'NO_RESPONSE'
			).length,
			overdue: open.filter(isOverdue).length,
			sessionDates: sessions
				.filter((s) => s.agentId === p.agent.id)
				.map((s) => s.date),
			ruleEvents: [
				...mine.flatMap((a) =>
					a.ruleId ? [{ ruleId: a.ruleId, date: a.assignedAt }] : []
				),
				...sessions
					.filter(
						(s) => s.agentId === p.agent.id || s.agentIds?.includes(p.agent.id)
					)
					.flatMap((s) =>
						s.ruleId ? [{ ruleId: s.ruleId, date: s.date }] : []
					),
			],
			pendingSession: sessions.some(
				(s) =>
					(s.agentId === p.agent.id || s.agentIds?.includes(p.agent.id)) &&
					s.status === 'SCHEDULED'
			),
		};
	});
}

interface AgentsTabProps {
	rows: AgentCoachingRow[];
	role: TeamRole;
	onOpen: (agentId: string) => void;
}

export function AgentsTab({ rows, role, onOpen }: AgentsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [search, setSearch] = useState('');
	const [team, setTeam] = useState<string | null>(null);
	const [weakest, setWeakest] = useState<string | null>(null);
	const [pendingSession, setPendingSession] = useState<string | null>(null);
	const [tierFilter, setTierFilter] = useState<PerformanceTier | null>(null);
	const [period, setPeriod] = useState<EvaluationPeriod>('WEEKLY');
	const periodDays =
		EVALUATION_PERIODS.find((p) => p.value === period)?.days ?? 7;
	const triggerRules = useTriggerRulesStore(selectTriggerRules);

	/** Every filter except the tier one, so the summary strip always shows the full distribution. */
	const baseFiltered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			if (
				q &&
				!r.name.toLowerCase().includes(q) &&
				!r.id.toLowerCase().includes(q)
			)
				return false;
			if (team && r.supervisorId !== team) return false;
			if (weakest === BURNOUT_RISK_FILTER) {
				if (assessBurnout(r.id, triggerRules).level === BurnoutRiskLevel.LOW)
					return false;
			} else if (weakest && r.weakest?.dimension !== weakest) return false;
			if (pendingSession && r.pendingSession !== (pendingSession === 'yes'))
				return false;
			return true;
		});
	}, [rows, search, team, weakest, pendingSession, triggerRules]);

	const filtered = useMemo(
		() =>
			tierFilter
				? baseFiltered.filter((r) => r.tier === tierFilter)
				: baseFiltered,
		[baseFiltered, tierFilter]
	);

	const tierSummary = useMemo(
		() =>
			Object.fromEntries(
				TIER_ORDER.map((tier) => {
					const inTier = baseFiltered.filter((r) => r.tier === tier);
					const avg = inTier.length
						? Math.round(
								inTier.reduce((s, r) => s + (r.scorecard?.score ?? 0), 0) /
									inTier.length
							)
						: null;
					return [tier, { count: inTier.length, avg }];
				})
			) as Record<PerformanceTier, { count: number; avg: number | null }>,
		[baseFiltered]
	);

	const byTier = useMemo(() => {
		const groups = new Map<PerformanceTier, AgentCoachingRow[]>();
		const noData: AgentCoachingRow[] = [];
		for (const r of filtered) {
			if (!r.tier) noData.push(r);
			else groups.set(r.tier, [...(groups.get(r.tier) ?? []), r]);
		}
		return { groups, noData };
	}, [filtered]);

	const dimensionColumn = (dimension: ScorecardDimension) =>
		helper.accessor((r) => r.scorecard?.dimensions[dimension] ?? -1, {
			id: dimension,
			header: t(SCORECARD_DIMENSION_META[dimension].shortLabelKey),
			cell: (info) => {
				const v = info.getValue();
				return v < 0 ? (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				) : (
					<Text size='sm' fw={500} c={`${getScoreBandColor(v)}.7`}>
						{v}
					</Text>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>;

	const columns: BaseTableColumnDef<AgentCoachingRow>[] = [
		helper.accessor('name', {
			header: t('agents.columns.agent'),
			cell: (info) => (
				<Text size='sm' fw={500}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('team', {
			header: t('agents.columns.team'),
			cell: (info) => (
				<Text size='sm' c='dimmed'>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor((r) => r.scorecard?.score ?? -1, {
			id: 'scorecard',
			header: t('agents.columns.scorecard'),
			cell: (info) => (
				<ScorecardBadge scorecard={info.row.original.scorecard} size='sm' />
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		...SCORECARD_DIMENSION_ORDER.map(dimensionColumn),
		helper.display({
			id: 'weakest',
			header: t('agents.columns.weakest'),
			cell: (info) => {
				const w = info.row.original.weakest;
				if (!w)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				return (
					<Group gap={6} wrap='nowrap'>
						<ScorecardDimensionBadge dimension={w.dimension} size='xs' />
						<Text size='xs' c='dimmed'>
							{w.value}
						</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'trend',
			header: t('agents.columns.lastImpact'),
			cell: (info) => (
				<ScorecardTrendBadge trend={info.row.original.trend} size='xs' />
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'sessions',
			header: t('agents.columns.sessions'),
			cell: (info) => (
				<Text size='sm'>
					{
						info.row.original.sessionDates.filter(
							(d) => daysUntil(d) >= -periodDays && daysUntil(d) <= 0
						).length
					}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('pending', {
			header: t('agents.columns.pending'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'yellow.7' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('overdue', {
			header: t('agents.columns.overdue'),
			cell: (info) => (
				<Text
					size='sm'
					c={info.getValue() > 0 ? 'red' : undefined}
					fw={info.getValue() > 0 ? 600 : 400}
				>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'triggeredRules',
			header: t('agents.columns.triggeredRules'),
			cell: (info) => {
				// Distinct rules that fired for the agent inside the evaluation period.
				const count = new Set(
					info.row.original.ruleEvents
						.filter(
							(e) => daysUntil(e.date) >= -periodDays && daysUntil(e.date) <= 0
						)
						.map((e) => e.ruleId)
				).size;
				return (
					<Text size='sm' c={count === 0 ? 'dimmed' : undefined}>
						{count}
					</Text>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('pendingSession', {
			header: t('agents.columns.pendingSession'),
			cell: (info) =>
				info.getValue() ? (
					<Badge size='xs' variant='light'>
						{t('agents.pendingSession.yes')}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						{t('agents.pendingSession.no')}
					</Text>
				),
		}) as BaseTableColumnDef<AgentCoachingRow>,
	];

	const clear = () => {
		setSearch('');
		setTeam(null);
		setWeakest(null);
		setPendingSession(null);
		setTierFilter(null);
	};

	const periodSelector = SHOW_PERIOD_SELECTOR && (
		<AppSegmentedControl
			size='xs'
			aria-label={t('agents.evaluationPeriod.label')}
			value={period}
			onChange={(v) => setPeriod(v as EvaluationPeriod)}
			data={EVALUATION_PERIODS.map((p) => ({
				value: p.value,
				label: t(`agents.evaluationPeriod.${p.value}`),
			}))}
		/>
	);

	const renderTable = (tableRows: AgentCoachingRow[]) => (
		<BaseTable<AgentCoachingRow>
			data={tableRows}
			columns={columns}
			getRowId={(r) => r.id}
			initialSort={[{ id: 'scorecard', desc: true }]}
			density='compact'
			emptyMessage={t('agents.empty')}
			onRowClick={(r) => onOpen(r.id)}
		/>
	);

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('agents.title')}
				description={t('agents.description')}
				icon={IconUsers}
			>
				<Stack gap='md'>
					<Group gap='sm' wrap='wrap'>
						<TextInput
							size='sm'
							placeholder={t('agents.filters.search')}
							leftSection={<IconSearch size={16} />}
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
							miw={220}
						/>
						{role === 'qa-manager' && (
							<Select
								size='sm'
								placeholder={t('agents.filters.team')}
								data={TEAM_SUPERVISORS.map((s) => ({
									value: s.id,
									label: s.team,
								}))}
								value={team}
								onChange={setTeam}
								clearable
								w={150}
							/>
						)}
						<Select
							size='sm'
							placeholder={t('agents.filters.area')}
							data={[
								...SCORECARD_DIMENSION_ORDER.map((d) => ({
									value: d as string,
									label: t(SCORECARD_DIMENSION_META[d].labelKey),
								})),
								{
									value: BURNOUT_RISK_FILTER,
									label: t('agents.filters.burnoutRisk'),
								},
							]}
							value={weakest}
							onChange={setWeakest}
							clearable
							w={190}
						/>
						<Select
							size='sm'
							placeholder={t('agents.filters.pendingSession')}
							data={[
								{ value: 'yes', label: t('agents.pendingSession.yes') },
								{ value: 'no', label: t('agents.pendingSession.no') },
							]}
							value={pendingSession}
							onChange={setPendingSession}
							clearable
							w={170}
						/>
						<Button size='sm' variant='subtle' onClick={clear}>
							{t('agents.filters.clear')}
						</Button>
					</Group>
				</Stack>
			</SectionCard>

			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				{TIER_ORDER.map((tier) => {
					const { count, avg } = tierSummary[tier];
					return (
						<UnstyledButton
							key={tier}
							className={styles.tierCard}
							data-active={tierFilter === tier || undefined}
							aria-pressed={tierFilter === tier}
							onClick={() =>
								setTierFilter((cur) => (cur === tier ? null : tier))
							}
						>
							<StatCard
								variant='compact'
								title={t(TIER_META[tier].labelKey)}
								value={count}
								subtitle={
									avg === null
										? t(TIER_META[tier].rangeKey)
										: t('agents.summary.avgScorecard', { value: avg })
								}
								badge={
									<Badge
										size='xs'
										variant='light'
										color={TIER_META[tier].color}
									>
										{t(TIER_META[tier].rangeKey)}
									</Badge>
								}
							/>
						</UnstyledButton>
					);
				})}
			</SimpleGrid>

			{filtered.length === 0 ? (
				<EmptyState message={t('agents.empty')} />
			) : (
				<>
					{TIER_ORDER.map((tier) => {
						const tierRows = byTier.groups.get(tier) ?? [];
						if (tierRows.length === 0) return null;
						return (
							<SectionCard
								key={tier}
								headerAccent={TIER_META[tier].color}
								title={t(TIER_META[tier].labelKey)}
								description={t('agents.tiers.description', {
									range: t(TIER_META[tier].rangeKey),
								})}
								headerActions={
									<Group gap='xs'>
										{periodSelector}
										<Badge
											size='sm'
											variant='light'
											color={TIER_META[tier].color}
										>
											{t('agents.summary.agents', { count: tierRows.length })}
										</Badge>
									</Group>
								}
							>
								{renderTable(tierRows)}
							</SectionCard>
						);
					})}
					{byTier.noData.length > 0 && (
						<SectionCard
							title={t('agents.tiers.noData.title')}
							description={t('agents.tiers.noData.description')}
							headerActions={
								<Badge size='sm' variant='light' color='gray'>
									{t('agents.summary.agents', { count: byTier.noData.length })}
								</Badge>
							}
						>
							{renderTable(byTier.noData)}
						</SectionCard>
					)}
				</>
			)}
		</Stack>
	);
}
