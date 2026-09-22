import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingQueueItem,
	CoachingSessionRecord,
	EvaluationArea,
	LmsAssignment,
	LmsImpactVerdict,
} from '~/models/qa';
import { AreaBadge, ImpactBadge } from '~/modules/qa/lms/components/Badges';
import { DIMENSION_TO_AREA, LMS_AREA_META } from '~/modules/qa/lms/constants';
import { daysUntil, isOverdue } from '~/modules/qa/lms/helpers';
import { getScoreColor } from '~/modules/qa/team/helpers';
import { TEAM_PROFILES, TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type {
	AgentProfile,
	DimensionKey,
	TeamRole,
} from '~/modules/qa/team/types';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';

/** Not a real EvaluationArea — a synthetic filter value for the "Weakest" dropdown. */
const BURNOUT_RISK_FILTER = 'BURNOUT_RISK';

type AgentState = 'attention' | 'inTraining' | 'measuring' | 'onTrack';

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
	sessions30d: number;
	lastImpact: LmsImpactVerdict | null;
	state: AgentState;
}

const helper = createColumnHelper<AgentCoachingRow>();

const STATE_COLOR: Record<AgentState, string> = {
	attention: 'red',
	inTraining: 'blue',
	measuring: 'teal',
	onTrack: 'green',
};

export function buildAgentRows(
	profiles: AgentProfile[],
	assignments: LmsAssignment[],
	sessions: CoachingSessionRecord[],
	queue: CoachingQueueItem[]
): AgentCoachingRow[] {
	const inQueue = new Set(queue.map((q) => q.agentId));

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

		const state: AgentState = inQueue.has(p.agent.id)
			? 'attention'
			: open.length > 0
				? 'inTraining'
				: lastImpact === 'PENDING'
					? 'measuring'
					: 'onTrack';

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
			sessions30d: sessions.filter(
				(s) => s.agentId === p.agent.id && daysUntil(s.date) >= -30
			).length,
			lastImpact,
			state,
		};
	});
}

interface AgentsTabProps {
	rows: AgentCoachingRow[];
	assignments: LmsAssignment[];
	role: TeamRole;
	onOpen: (agentId: string) => void;
}

export function AgentsTab({ rows, assignments, role, onOpen }: AgentsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [search, setSearch] = useState('');
	const [team, setTeam] = useState<string | null>(null);
	const [area, setArea] = useState<string | null>(null);
	const [state, setState] = useState<string | null>(null);

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
				const level = TEAM_PROFILES[r.id]?.risk.burnout.level;
				if (!level || level === BurnoutRiskLevel.LOW) return false;
			} else if (area && r.weakestArea !== area) return false;
			if (state && r.state !== state) return false;
			return true;
		});
	}, [rows, search, team, area, state]);

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
		helper.accessor('overall', {
			header: t('agents.columns.overall'),
			cell: (info) => (
				<Badge size='sm' color={getScoreColor(info.getValue())} variant='light'>
					{info.getValue()}
				</Badge>
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
		helper.accessor('sessions30d', {
			header: t('agents.columns.sessions'),
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
		helper.accessor('state', {
			header: t('agents.columns.state'),
			cell: (info) => (
				<Badge size='xs' color={STATE_COLOR[info.getValue()]} variant='light'>
					{t(`agents.state.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
	];

	const clear = () => {
		setSearch('');
		setTeam(null);
		setArea(null);
		setState(null);
	};

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('agents.title')}
				description={t('agents.description')}
				icon={IconUsers}
			>
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
						placeholder={t('agents.filters.state')}
						data={(
							[
								'attention',
								'inTraining',
								'measuring',
								'onTrack',
							] as AgentState[]
						).map((s) => ({
							value: s,
							label: t(`agents.state.${s}`),
						}))}
						value={state}
						onChange={setState}
						clearable
						w={170}
					/>
					<Button size='sm' variant='subtle' onClick={clear}>
						{t('agents.filters.clear')}
					</Button>
				</Group>
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
								initialSort={[{ id: 'overall', desc: false }]}
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
