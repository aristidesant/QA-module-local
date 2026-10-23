import { useMemo } from 'react';
import { Badge, Group, Select, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingBatchItem,
	CoachingSessionRecord,
	CoachingWeeklyBatch,
} from '~/models/qa';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	useCoachingStore,
	selectBatches,
	selectCoachingDay,
} from '~/stores/qa/coachingStore';
import { sessionStatusBadge, WEEKDAYS } from '../constants';
import { nextBatchAt } from '../weeklyBatch';
import { CRITICAL_ISSUES, ScoreTrendText, TierScore } from './QuietIndicators';

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

/** The latest weekly run for the viewer's scope: each agent's aspects to improve and where their session stands. The 1:1 vs message decision is taken inside the session. */
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
	const summary = {
		analysed: rows.length,
		oneOnOne: rows.filter((r) => r.decision === 'ONE_ON_ONE').length,
		toConfirm: rows.filter((r) => r.session?.status === 'PROPOSED').length,
		ai: rows.filter((r) => r.decision === 'AI_MESSAGE').length,
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
				if (!brief) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				return (
					<Stack gap={2}>
						<TierScore score={brief.score} tier={brief.tier} />
						<ScoreTrendText
							verdict={brief.trend}
							current={brief.score}
							previous={brief.previousScore}
						/>
					</Stack>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.display({
			id: 'findings',
			header: t('sessions.batch.columns.findings'),
			cell: (info) => {
				const findings = info.row.original.session?.brief?.findings ?? [];
				if (findings.length === 0) {
					return (
						<Text size='sm' c='dimmed'>
							{t('sessions.batch.clean')}
						</Text>
					);
				}
				return (
					<Group gap={4} wrap='wrap'>
						{findings.map((finding) => {
							const critical = CRITICAL_ISSUES.has(finding.issue);
							return (
								<Badge
									key={finding.issue}
									size='xs'
									variant={critical ? 'light' : 'outline'}
									color={critical ? 'red' : 'gray'}
								>
									{t(`issues.${finding.issue}`, { ns: 'qa.calls' })}
								</Badge>
							);
						})}
					</Group>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor((r) => r.session?.status ?? '', {
			id: 'status',
			header: t('sessions.columns.status'),
			cell: (info) => {
				const s = info.row.original.session;
				if (!s) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				const badge = sessionStatusBadge(s.status);
				const when = dayjs(s.date);
				// Second line: when the message goes out or went out, or when the 1:1 takes place.
				const line =
					s.type === 'AI_MESSAGE'
						? t(
								s.status === 'COMPLETED'
									? 'sessions.batch.sentOn'
									: 'sessions.batch.sendsOn',
								{ date: when.format('ddd D MMM') }
							)
						: s.status === 'PROPOSED'
							? t('sessions.batch.suggestedDate', {
									date: when.format('ddd D MMM, HH:mm'),
								})
							: when.format('ddd D MMM, HH:mm');
				return (
					<Stack gap={2} align='flex-start'>
						<Badge size='xs' variant={badge.variant} color={badge.color}>
							{t(`sessions.status.${s.status}`)}
						</Badge>
						<Text size='xs' c='dimmed'>
							{line}
						</Text>
					</Stack>
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
		<SectionCard
			icon={IconSparkles}
			title={t('sessions.batch.titleWeek', {
				from: dayjs(latest.weekFrom).format('D MMM'),
				to: dayjs(latest.weekTo).format('D MMM'),
			})}
			description={
				<>
					<Text component='span' display='block' inherit>
						{t('sessions.batch.facts', {
							generated: dayjs(latest.generatedAt).format('ddd D MMM, HH:mm'),
							coaching: dayjs(latest.coachingDate).format('ddd D MMM'),
							next: dayjs(next.generatedAt).format('ddd D MMM'),
						})}
					</Text>
					<Text component='span' display='block' inherit>
						{t('sessions.batch.summary', summary)}
					</Text>
				</>
			}
			headerActions={coachingDaySelect}
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
	);
}
