import { useMemo } from 'react';
import {
	Badge,
	Box,
	Group,
	SegmentedControl,
	Select,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
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
	CoachingBatchDecision,
	CoachingBatchItem,
	CoachingSessionRecord,
	CoachingWeeklyBatch,
} from '~/models/qa';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
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

/** A decision can only change while the session is still ahead: once held, missed or dismissed it stays as it is. */
const isLocked = (session: CoachingSessionRecord | undefined): boolean =>
	!session ||
	session.status === 'COMPLETED' ||
	session.status === 'MISSED' ||
	session.status === 'CANCELLED';

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
	const setBatchDecision = useCoachingStore((s) => s.setBatchDecision);

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

	/** Flips the decision from the table and says what happens next. */
	const changeDecision = (row: BatchRow, decision: CoachingBatchDecision) => {
		setBatchDecision(row.sessionId, decision);
		const updated = useCoachingStore
			.getState()
			.sessions.find((s) => s.id === row.sessionId);
		notifySuccess(
			decision === 'AI_MESSAGE'
				? t('sessions.batch.queued', {
						date: dayjs(updated?.date).format('ddd D MMM'),
					})
				: t('sessions.batch.proposedAgain')
		);
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
				const finding = info.row.original.session?.brief?.findings[0];
				if (!finding) {
					return (
						<Text size='sm' c='dimmed'>
							{t('sessions.batch.clean')}
						</Text>
					);
				}
				const critical = CRITICAL_ISSUES.has(finding.issue);
				return (
					<Badge
						size='xs'
						variant={critical ? 'light' : 'outline'}
						color={critical ? 'red' : 'gray'}
					>
						{t(`issues.${finding.issue}`, { ns: 'qa.calls' })}
					</Badge>
				);
			},
		}) as BaseTableColumnDef<BatchRow>,
		helper.accessor('decision', {
			header: t('sessions.batch.columns.decision'),
			cell: (info) => {
				const row = info.row.original;
				const locked = isLocked(row.session);
				const control = (
					// The toggle is the row's own action: keep its clicks and keys from opening the session.
					<Box
						w='fit-content'
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<SegmentedControl
							size='xs'
							value={row.decision}
							disabled={locked}
							aria-label={t('sessions.batch.columns.decision')}
							data={[
								{
									value: 'ONE_ON_ONE',
									label: t('sessions.batch.decisionShort.ONE_ON_ONE'),
								},
								{
									value: 'AI_MESSAGE',
									label: t('sessions.batch.decisionShort.AI_MESSAGE'),
								},
							]}
							onChange={(v) => changeDecision(row, v as CoachingBatchDecision)}
						/>
					</Box>
				);
				return (
					<Group gap='xs' wrap='nowrap'>
						{locked ? (
							<Tooltip withArrow label={t('sessions.batch.locked')}>
								{control}
							</Tooltip>
						) : (
							control
						)}
						<Text size='xs' c='dimmed'>
							{t(`sessions.batch.reason.${row.reason}`)}
						</Text>
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
