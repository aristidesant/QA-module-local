import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingRule,
	CoachingSessionRecord,
	EvaluationArea,
	LmsAssignment,
	LmsImpactVerdict,
} from '~/models/qa';
import { AreaBadge, ImpactBadge } from '~/modules/qa/lms/components/Badges';
import { DIMENSION_TO_AREA, LMS_AREA_META } from '~/modules/qa/lms/constants';
import { daysUntil, isOverdue } from '~/modules/qa/lms/helpers';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type {
	AgentProfile,
	DimensionKey,
	TeamRole,
} from '~/modules/qa/team/types';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';

/** Evaluation periods and the days each one looks back over. */
const EVALUATION_PERIODS = [
	{ value: 'WEEKLY', days: 7 },
	{ value: 'MONTHLY', days: 30 },
	{ value: 'QUARTERLY', days: 90 },
] as const;
type EvaluationPeriod = (typeof EVALUATION_PERIODS)[number]['value'];

/** Not a real EvaluationArea — a synthetic filter value for the "Weakest" dropdown. */
const BURNOUT_RISK_FILTER = 'BURNOUT_RISK';

export interface AgentCoachingRow {
	id: string;
	name: string;
	team: string;
	supervisorId: string;
	overall: number;
	weakestArea: EvaluationArea;
	weakestValue: number;
	active: number;
	pending: number;
	overdue: number;
	/** Dates of the agent's coaching sessions; counted over the evaluation period. */
	sessionDates: string[];
	lastImpact: LmsImpactVerdict | null;
	/** Has at least one coaching session still scheduled. */
	pendingSession: boolean;
	/** Coaching rules that fired for the agent (assigned content or created a session). */
	triggeredRuleIds: string[];
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
		const measured = mine
			.filter((a) => a.impact)
			.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
		/** Sentiment is scored 1-5; every dimension is compared on the same 0-100 scale. */
		const toPct = (k: DimensionKey, v: number) =>
			k === 'sentiment' ? Math.round(((v - 1) / 4) * 100) : v;
		const weakest = [...p.dimensions].sort(
			(a, b) => toPct(a.key, a.score) - toPct(b.key, b.score)
		)[0];
		const lastImpact = measured[0]?.impact?.verdict ?? null;

		return {
			id: p.agent.id,
			name: p.agent.name,
			team: p.agent.team,
			supervisorId: p.agent.supervisorId,
			overall: p.overall.score,
			weakestArea: DIMENSION_TO_AREA[weakest.key],
			weakestValue: toPct(weakest.key, weakest.score),
			active: open.length,
			pending: mine.filter(
				(a) =>
					a.acceptance.status === 'PENDING' ||
					a.acceptance.status === 'NO_RESPONSE'
			).length,
			overdue: open.filter(isOverdue).length,
			sessionDates: sessions
				.filter((s) => s.agentId === p.agent.id)
				.map((s) => s.date),
			lastImpact,
			triggeredRuleIds: [
				...new Set(
					[
						...mine.map((a) => a.ruleId),
						...sessions
							.filter(
								(s) =>
									s.agentId === p.agent.id || s.agentIds?.includes(p.agent.id)
							)
							.map((s) => s.ruleId),
					].filter((id): id is string => Boolean(id))
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
	assignments: LmsAssignment[];
	/** Used to name the rules that fired for each agent. */
	rules: CoachingRule[];
	role: TeamRole;
	onOpen: (agentId: string) => void;
}

export function AgentsTab({
	rows,
	assignments,
	rules,
	role,
	onOpen,
}: AgentsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [search, setSearch] = useState('');
	const [team, setTeam] = useState<string | null>(null);
	const [area, setArea] = useState<string | null>(null);
	const [pendingSession, setPendingSession] = useState<string | null>(null);
	const [period, setPeriod] = useState<EvaluationPeriod>('WEEKLY');
	const periodDays =
		EVALUATION_PERIODS.find((p) => p.value === period)?.days ?? 7;
	const triggerRules = useTriggerRulesStore(selectTriggerRules);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			if (
				q &&
				!r.name.toLowerCase().includes(q) &&
				!r.id.toLowerCase().includes(q)
			)
				return false;
			if (team && r.supervisorId !== team) return false;
			if (area === BURNOUT_RISK_FILTER) {
				if (assessBurnout(r.id, triggerRules).level === BurnoutRiskLevel.LOW)
					return false;
			} else if (area && r.weakestArea !== area) return false;
			if (pendingSession && r.pendingSession !== (pendingSession === 'yes'))
				return false;
			return true;
		});
	}, [rows, search, team, area, pendingSession, triggerRules]);

	const byTeam = useMemo(() => {
		const map = new Map<string, AgentCoachingRow[]>();
		for (const r of filtered) {
			map.set(r.supervisorId, [...(map.get(r.supervisorId) ?? []), r]);
		}
		return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	}, [filtered]);

	const columns: BaseTableColumnDef<AgentCoachingRow>[] = [
		helper.accessor('name', {
			header: t('agents.columns.agent'),
			cell: (info) => (
				<Text size='sm' fw={500}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'weakest',
			header: t('agents.columns.weakest'),
			cell: (info) => (
				<Group gap={6} wrap='nowrap'>
					<AreaBadge area={info.row.original.weakestArea} size='xs' />
					<Text size='xs' c='dimmed'>
						{info.row.original.weakestValue}
					</Text>
				</Group>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('active', {
			header: t('agents.columns.active'),
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
		helper.display({
			id: 'lastImpact',
			header: t('agents.columns.lastImpact'),
			cell: (info) => {
				const agentId = info.row.original.id;
				const last = assignments
					.filter((a) => a.agentId === agentId && a.impact)
					.sort((a, b) =>
						(b.completedAt ?? '').localeCompare(a.completedAt ?? '')
					)[0];
				return <ImpactBadge impact={last?.impact ?? null} size='xs' />;
			},
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('triggeredRuleIds', {
			header: t('agents.columns.triggeredRules'),
			cell: (info) => {
				const names = info
					.getValue()
					.map((id) => rules.find((r) => r.id === id)?.name ?? id);
				if (names.length === 0)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				return (
					<Tooltip
						label={names.join(' · ')}
						withArrow
						disabled={names.length < 2}
					>
						<Group gap={4} wrap='nowrap'>
							<Badge size='xs' variant='light' maw={170}>
								{names[0]}
							</Badge>
							{names.length > 1 && (
								<Text size='xs' c='dimmed'>
									+{names.length - 1}
								</Text>
							)}
						</Group>
					</Tooltip>
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
		setArea(null);
		setPendingSession(null);
	};

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('agents.title')}
				description={t('agents.description')}
				icon={IconUsers}
			>
				<Stack gap='md'>
					<Group gap='sm' wrap='wrap'>
						<Text size='sm' fw={500}>
							{t('agents.evaluationPeriod.label')}
						</Text>
						<AppSegmentedControl
							size='xs'
							value={period}
							onChange={(v) => setPeriod(v as EvaluationPeriod)}
							data={EVALUATION_PERIODS.map((p) => ({
								value: p.value,
								label: t(`agents.evaluationPeriod.${p.value}`),
							}))}
						/>
					</Group>
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
								...(
									[
										'QUALITY_ASSURANCE',
										'COMPLIANCE',
										'SENTIMENT_EMOTION',
										'BUSINESS_INSIGHTS',
									] as const
								).map((a) => ({
									value: a as string,
									label: t(LMS_AREA_META[a].labelKey, { ns: 'qa.lms' }),
								})),
								{
									value: BURNOUT_RISK_FILTER,
									label: t('agents.filters.burnoutRisk', 'Burnout Risk'),
								},
							]}
							value={area}
							onChange={setArea}
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

			{byTeam.length === 0 ? (
				<EmptyState message={t('agents.empty')} />
			) : (
				byTeam.map(([supervisorId, teamRows]) => {
					const supervisor = TEAM_SUPERVISORS.find(
						(s) => s.id === supervisorId
					);
					return (
						<SectionCard
							key={supervisorId}
							title={supervisor?.team ?? supervisorId}
							description={t('agents.teamCard', {
								team: supervisor?.team ?? '',
								supervisor: supervisor?.name ?? '',
							})}
						>
							<BaseTable<AgentCoachingRow>
								data={teamRows}
								columns={columns}
								getRowId={(r) => r.id}
								initialSort={[{ id: 'name', desc: false }]}
								density='compact'
								emptyMessage={t('agents.empty')}
								onRowClick={(r) => onOpen(r.id)}
							/>
						</SectionCard>
					);
				})
			)}
		</Stack>
	);
}
