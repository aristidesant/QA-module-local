import { useMemo } from 'react';
import { Badge, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconMessage, IconSparkles, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingBatchItem,
	CoachingSessionRecord,
	CoachingWeeklyBatch,
} from '~/models/qa';
import {
	CALL_ISSUE_BY_KEY,
	type CallIssueKey,
} from '~/modules/qa/calls/issues';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	useCoachingStore,
	selectBatches,
	selectCoachingDay,
} from '~/stores/qa/coachingStore';
import { SESSION_STATUS_COLOR, WEEKDAYS } from '../constants';
import { TIER_META } from '../scorecard';
import { nextBatchAt } from '../weeklyBatch';
import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';

interface BatchRow extends CoachingBatchItem {
	session: CoachingSessionRecord | undefined;
}

const helper = createColumnHelper<BatchRow>();

interface WeeklyBatchPanelProps {
	role: TeamRole;
	sessions: CoachingSessionRecord[];
	agentTeam: Record<string, string>;
	onOpen: (sessionId: string) => void;
}

/** The latest weekly run for the viewer's scope: who gets a 1:1, who gets the AI message, and where each stands. */
export function WeeklyBatchPanel({
	role,
	sessions,
	agentTeam,
	onOpen,
}: WeeklyBatchPanelProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls']);
	const batches = useCoachingStore(selectBatches);
	const coachingDay = useCoachingStore(selectCoachingDay);
	const setCoachingDay = useCoachingStore((s) => s.setCoachingDay);

	const latest: CoachingWeeklyBatch | undefined = useMemo(
		() =>
			[...batches]
				.filter(
					(b) =>
						role === 'qa-manager' || b.supervisorId === SUPERVISOR_PERSONA.id
				)
				.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0],
		[batches, role]
	);
	const next = nextBatchAt(coachingDay);

	const rows = useMemo<BatchRow[]>(
		() =>
			(latest?.items ?? []).map((item) => ({
				...item,
				session: sessions.find((s) => s.id === item.sessionId),
			})),
		[latest, sessions]
	);
	const kpi = {
		analysed: rows.length,
		proposed: rows.filter((r) => r.session?.status === 'PROPOSED').length,
		scheduled: rows.filter(
			(r) =>
				r.decision === 'ONE_ON_ONE' &&
				(r.session?.status === 'SCHEDULED' || r.session?.status === 'COMPLETED')
		).length,
		ai: rows.filter((r) => r.session?.type === 'AI_MESSAGE').length,
	};

	const columns: BaseTableColumnDef<BatchRow>[] = [
		helper.accessor('agentName', {
			header: t('sessions.columns.agent'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm' fw={500}>
						{info.getValue()}
					</Text>
					<Text size='xs' c='dimmed'>
						{agentTeam[info.row.original.agentId] ?? ''}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor((r) => r.session?.brief?.score ?? -1, {
			id: 'scorecard',
			header: t('agents.columns.scorecard'),
			cell: (info) => {
				const brief = info.row.original.session?.brief;
				return brief ? (
					<Group gap={6} wrap='nowrap'>
						<Badge
							size='sm'
							variant='filled'
							color={TIER_META[brief.tier].color}
						>
							{brief.score}
						</Badge>
						<TierBadge tier={brief.tier} size='xs' />
					</Group>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.display({
			id: 'trend',
			header: t('agents.columns.lastImpact'),
			cell: (info) => {
				const brief = info.row.original.session?.brief;
				const trend =
					brief && brief.trend && brief.previousScore !== null
						? {
								verdict: brief.trend,
								current: brief.score,
								previous: brief.previousScore,
								delta: brief.score - brief.previousScore,
							}
						: null;
				return <ScorecardTrendBadge trend={trend} size='xs' />;
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.display({
			id: 'findings',
			header: t('sessions.batch.columns.findings'),
			cell: (info) => {
				const findings = info.row.original.session?.brief?.findings ?? [];
				return findings.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('sessions.batch.clean')}
					</Text>
				) : (
					<Group gap={4} wrap='wrap'>
						{findings.map((f) => (
							<Badge
								key={f.issue}
								size='xs'
								variant='light'
								color={CALL_ISSUE_BY_KEY[f.issue as CallIssueKey].color}
							>
								{t(`issues.${f.issue}`, { ns: 'qa.calls' })}
							</Badge>
						))}
					</Group>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor('decision', {
			header: t('sessions.batch.columns.decision'),
			cell: (info) => (
				<Stack gap={2}>
					<Badge
						size='xs'
						variant={info.getValue() === 'ONE_ON_ONE' ? 'filled' : 'light'}
						color={info.getValue() === 'ONE_ON_ONE' ? 'blue' : 'gray'}
						leftSection={
							info.getValue() === 'ONE_ON_ONE' ? (
								<IconUser size={10} />
							) : (
								<IconMessage size={10} />
							)
						}
					>
						{t(`sessions.batch.decision.${info.getValue()}`)}
					</Badge>
					<Text size='xs' c='dimmed'>
						{t(`sessions.batch.reason.${info.row.original.reason}`)}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor((r) => r.session?.status ?? '', {
			id: 'status',
			header: t('sessions.columns.status'),
			cell: (info) => {
				const status = info.row.original.session?.status;
				return status ? (
					<Badge size='xs' variant='light' color={SESSION_STATUS_COLOR[status]}>
						{t(`sessions.status.${status}`)}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor((r) => r.session?.date ?? '', {
			id: 'date',
			header: t('sessions.batch.columns.date'),
			cell: (info) => {
				const s = info.row.original.session;
				if (!s) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				if (s.type === 'AI_MESSAGE') {
					return (
						<Text size='sm' c='dimmed'>
							{t('sessions.batch.sentOn', {
								date: dayjs(s.date).format('D MMM'),
							})}
						</Text>
					);
				}
				const when = dayjs(s.date).format('ddd D MMM, HH:mm');
				return (
					<Text size='sm'>
						{s.status === 'PROPOSED'
							? t('sessions.batch.suggestedDate', { date: when })
							: when}
					</Text>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
	];

	const coachingDaySelect = (
		<Select
			size='xs'
			w={170}
			label={t('sessions.batch.coachingDay')}
			data={WEEKDAYS.map((d) => ({
				value: String(d),
				label: t(`sessions.batch.weekdays.${d}`),
			}))}
			value={String(coachingDay)}
			onChange={(v) => v !== null && setCoachingDay(Number(v))}
			allowDeselect={false}
		/>
	);

	if (!latest) {
		return (
			<SectionCard
				icon={IconSparkles}
				title={t('sessions.batch.title')}
				headerActions={coachingDaySelect}
			>
				<EmptyState
					message={t('sessions.batch.empty', {
						date: dayjs(next.generatedAt).format('ddd D MMM, HH:mm'),
					})}
				/>
			</SectionCard>
		);
	}

	return (
		<Stack gap='md'>
			<SectionCard
				icon={IconSparkles}
				title={t('sessions.batch.title')}
				description={t('sessions.batch.description', {
					generated: dayjs(latest.generatedAt).format('ddd D MMM, HH:mm'),
					from: dayjs(latest.weekFrom).format('D MMM'),
					to: dayjs(latest.weekTo).format('D MMM'),
					coaching: dayjs(latest.coachingDate).format('ddd D MMM'),
				})}
				headerActions={
					<Group gap='sm' align='flex-end'>
						{coachingDaySelect}
						<Badge size='sm' variant='light' color='violet'>
							{t('sessions.batch.next', {
								date: dayjs(next.generatedAt).format('ddd D MMM, HH:mm'),
							})}
						</Badge>
					</Group>
				}
			>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
					<StatCard
						variant='compact'
						title={t('sessions.batch.kpi.analysed')}
						value={kpi.analysed}
					/>
					<StatCard
						variant='compact'
						title={t('sessions.batch.kpi.proposed')}
						value={kpi.proposed}
						color={
							kpi.proposed > 0 ? 'var(--mantine-color-violet-7)' : undefined
						}
					/>
					<StatCard
						variant='compact'
						title={t('sessions.batch.kpi.scheduled')}
						value={kpi.scheduled}
					/>
					<StatCard
						variant='compact'
						title={t('sessions.batch.kpi.ai')}
						value={kpi.ai}
					/>
				</SimpleGrid>
			</SectionCard>

			<SectionCard
				title={t('sessions.batch.agents')}
				description={t('sessions.batch.agentsDescription')}
			>
				<BaseTable<BatchRow>
					data={rows}
					columns={columns}
					getRowId={(r) => r.agentId}
					initialSort={[{ id: 'scorecard', desc: false }]}
					density='compact'
					emptyMessage={t('sessions.empty')}
					onRowClick={(r) => onOpen(r.sessionId)}
				/>
			</SectionCard>
		</Stack>
	);
}
