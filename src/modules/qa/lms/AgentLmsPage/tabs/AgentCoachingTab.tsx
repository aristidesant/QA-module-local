import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import {
	IconCalendarEvent,
	IconCheck,
	IconHistory,
	IconSparkles,
	IconTargetArrow,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type {
	CoachingActionItem,
	CoachingSessionRecord,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import {
	useCoachingStore,
	selectCohorts,
	selectSessions,
} from '~/stores/qa/coachingStore';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
} from '~/stores/qa/lmsStore';
import { needsResponse } from '~/modules/qa/lms/helpers';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { AgentSessionDetailDrawer } from '~/modules/qa/coaching/components/AgentSessionDetailDrawer';
import { AGENT_PERSONA, agentContentPath } from '../../constants';
import { AreaBadge } from '../../components/Badges';
import cardStyles from '../../components/Cards.module.css';

interface SessionCommitment {
	kind: 'session';
	key: string;
	acknowledged: boolean;
	sortDate: string;
	session: CoachingSessionRecord;
	item: CoachingActionItem;
}

interface MaterialCommitment {
	kind: 'material';
	key: string;
	acknowledged: boolean;
	sortDate: string;
	assignment: LmsAssignment;
	content: LmsContent | undefined;
}

type Commitment = SessionCommitment | MaterialCommitment;

const helper = createColumnHelper<CoachingSessionRecord>();

const STATUS_COLOR: Record<CoachingSessionRecord['status'], string> = {
	SCHEDULED: 'blue',
	COMPLETED: 'green',
	MISSED: 'red',
	CANCELLED: 'gray',
};

export function AgentCoachingTab() {
	const { t } = useTranslation('qa.lms');
	const navigate = useNavigate();
	const allSessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);
	const [detailSession, setDetailSession] =
		useState<CoachingSessionRecord | null>(null);

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);

	const sessions = useMemo(() => {
		const myCohortIds = cohorts
			.filter((c) => c.agentIds.includes(AGENT_PERSONA.id))
			.map((c) => c.id);
		return allSessions.filter(
			(s) =>
				s.agentId === AGENT_PERSONA.id ||
				(s.cohortId && myCohortIds.includes(s.cohortId))
		);
	}, [allSessions, cohorts]);

	// One weekly cadence → one upcoming session, ever. Take the soonest scheduled one.
	const next = useMemo(
		() =>
			sessions
				.filter((s) => s.status === 'SCHEDULED')
				.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null,
		[sessions]
	);
	const past = useMemo(
		() =>
			sessions
				.filter((s) => s.status !== 'SCHEDULED')
				.sort((a, b) => b.date.localeCompare(a.date)),
		[sessions]
	);
	// The last AI-written weekly review, so it reads like a message from the QA assistant.
	const latestAi = useMemo(
		() =>
			sessions
				.filter((s) => s.type === 'AI_MESSAGE')
				.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
		[sessions]
	);
	// Two kinds of commitment: behavioral action items agreed during a session,
	// and educational material assigned because of coaching (COACHING_RULE).
	// Merged into one list, still-open ones first, then most recent.
	const MAX_COMMITMENTS = 3;
	const commitments = useMemo(() => {
		const fromSessions: Commitment[] = sessions
			.filter((s) => s.status === 'COMPLETED')
			.flatMap((s) =>
				s.actionItems.map((item) => ({
					kind: 'session' as const,
					key: item.id,
					acknowledged: item.acknowledgedByAgent,
					sortDate: s.date,
					session: s,
					item,
				}))
			);

		const fromMaterial: Commitment[] = assignments
			.filter(
				(a) =>
					a.agentId === AGENT_PERSONA.id &&
					a.source === 'COACHING_RULE' &&
					a.status !== 'COMPLETED'
			)
			.map((a) => ({
				kind: 'material' as const,
				key: a.id,
				acknowledged: !needsResponse(a),
				sortDate: a.assignedAt,
				assignment: a,
				content: contentById[a.contentId],
			}));

		return [...fromSessions, ...fromMaterial]
			.sort((a, b) => {
				if (a.acknowledged !== b.acknowledged) {
					return a.acknowledged ? 1 : -1;
				}
				return b.sortDate.localeCompare(a.sortDate);
			})
			.slice(0, MAX_COMMITMENTS);
	}, [sessions, assignments, contentById]);

	const handleCommit = (sessionId: string, itemId: string) => {
		useCoachingStore.getState().acknowledgeActionItem(sessionId, itemId);
		useCoachingStore.getState().acknowledgeCommitment(sessionId, null);
		notifySuccess(t('agent.coaching.acknowledge'));
	};

	const columns: BaseTableColumnDef<CoachingSessionRecord>[] = [
		helper.accessor('date', {
			header: t('agent.coaching.columns.date'),
			cell: (info) => (
				<Text size='sm'>
					{dayjs(info.getValue()).format('D MMM YYYY HH:mm')}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('topic', {
			header: t('agent.coaching.columns.topic'),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('type', {
			header: t('agent.coaching.columns.type'),
			cell: (info) => (
				<Badge size='xs' variant='outline'>
					{t(`agent.coaching.types.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('coachName', {
			header: t('agent.coaching.columns.coach'),
			cell: (info) => (
				<Group gap={6} wrap='nowrap'>
					<Text size='sm'>{info.getValue()}</Text>
					<Badge size='xs' variant='outline'>
						{info.row.original.coachRole}
					</Badge>
				</Group>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'area',
			header: t('agent.coaching.columns.area'),
			cell: (info) =>
				info.row.original.area ? (
					<AreaBadge
						area={info.row.original.area}
						subItem={info.row.original.subItem}
						size='xs'
					/>
				) : null,
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.accessor('status', {
			header: t('agent.coaching.columns.status'),
			cell: (info) => (
				<Badge size='sm' color={STATUS_COLOR[info.getValue()]} variant='light'>
					{info.getValue()}
				</Badge>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
		helper.display({
			id: 'outcome',
			header: t('agent.coaching.columns.outcome'),
			cell: (info) => (
				<Text size='xs' c='dimmed'>
					{info.row.original.outcome ?? '—'}
				</Text>
			),
		}) as BaseTableColumnDef<CoachingSessionRecord>,
	];

	if (!sessions.length) {
		return <EmptyState message={t('agent.coaching.empty')} />;
	}

	return (
		<Stack gap='md'>
			{latestAi && (
				<SectionCard
					title={t('agent.coaching.latestMessage')}
					description={t('agent.coaching.latestMessageDescription')}
					icon={IconSparkles}
				>
					<Stack
						gap={4}
						className={cardStyles.clickable}
						onClick={() => setDetailSession(latestAi)}
					>
						<Text size='xs' c='dimmed'>
							{dayjs(latestAi.date).format('D MMM YYYY')} · {latestAi.coachName}
						</Text>
						<Text size='sm'>{(latestAi.aiMessage ?? '').slice(0, 280)}…</Text>
					</Stack>
				</SectionCard>
			)}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard
					title={t('agent.coaching.upcoming')}
					description={t('agent.coaching.upcomingDescription')}
					icon={IconCalendarEvent}
					fullHeight
				>
					{next === null ? (
						<Text size='sm' c='dimmed'>
							{t('agent.coaching.empty')}
						</Text>
					) : (
						<Stack
							gap='sm'
							className={cardStyles.clickable}
							onClick={() => setDetailSession(next)}
						>
							<Group gap='xs' align='flex-start'>
								<Text fw={600} size='md' flex={1}>
									{next.topic}
								</Text>
								{next.area && (
									<AreaBadge
										area={next.area}
										subItem={next.subItem}
										size='xs'
									/>
								)}
							</Group>
							<Text size='sm' fw={500}>
								{dayjs(next.date).format('D MMM YYYY · HH:mm')}
							</Text>
							<Text size='sm' c='dimmed'>
								{next.coachName} · {next.durationMin} min
							</Text>
							{next.talkingPoints.length > 0 && (
								<Stack gap={2} mt={4}>
									<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
										{t('agent.coaching.talkingPoints')}
									</Text>
									{next.talkingPoints.map((point, i) => (
										<Text key={i} size='sm'>
											• {point}
										</Text>
									))}
								</Stack>
							)}
						</Stack>
					)}
				</SectionCard>

				<SectionCard
					title={t('agent.coaching.commitments')}
					description={t('agent.coaching.commitmentsDescription')}
					icon={IconTargetArrow}
					fullHeight
				>
					{commitments.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('agent.coaching.noCommitments')}
						</Text>
					) : (
						<Stack gap='sm'>
							{commitments.map((c) => (
								<Paper
									key={c.key}
									withBorder
									p='sm'
									radius='md'
									className={cardStyles.clickable}
									onClick={() =>
										c.kind === 'session'
											? setDetailSession(c.session)
											: navigate(agentContentPath(c.assignment.contentId))
									}
								>
									<Group
										justify='space-between'
										align='flex-start'
										wrap='nowrap'
									>
										<Stack gap={2} flex={1} miw={0}>
											<Badge
												size='xs'
												variant='outline'
												color='gray'
												w='fit-content'
											>
												{t(
													c.kind === 'session'
														? 'agent.coaching.commitmentType.session'
														: 'agent.coaching.commitmentType.material'
												)}
											</Badge>
											{c.kind === 'session' ? (
												<>
													<Text size='sm' fw={500}>
														{c.item.text}
													</Text>
													<Text size='xs' c='dimmed'>
														{c.session.topic} · {c.session.coachName} ·{' '}
														{t('due.date', { date: c.item.dueDate })}
													</Text>
												</>
											) : (
												<>
													<Text size='sm' fw={500}>
														{c.content?.title ?? c.assignment.contentId}
													</Text>
													<Text size='xs' c='dimmed'>
														{t('agent.assignments.assignedBy', {
															name: c.assignment.assignedBy,
														})}{' '}
														· {t('due.date', { date: c.assignment.dueDate })}
													</Text>
												</>
											)}
										</Stack>
										{c.kind === 'session' ? (
											c.item.acknowledgedByAgent ? (
												<Badge
													color='green'
													variant='light'
													leftSection={<IconCheck size={12} />}
												>
													{t('agent.coaching.acknowledged', {
														date: c.item.acknowledgedAt?.slice(0, 10) ?? '',
													})}
												</Badge>
											) : (
												<Button
													size='xs'
													variant='light'
													onClick={(e) => {
														e.stopPropagation();
														handleCommit(c.session.id, c.item.id);
													}}
												>
													{t('agent.coaching.acknowledge')}
												</Button>
											)
										) : !needsResponse(c.assignment) ? (
											<Badge
												color='green'
												variant='light'
												leftSection={<IconCheck size={12} />}
											>
												{t('agent.assignments.accepted', {
													date:
														c.assignment.acceptance.respondedAt?.slice(0, 10) ??
														'',
												})}
											</Badge>
										) : (
											<Badge color='yellow' variant='light'>
												{t('agent.assignments.needsResponse')}
											</Badge>
										)}
									</Group>
								</Paper>
							))}
						</Stack>
					)}
				</SectionCard>
			</SimpleGrid>

			<SectionCard
				title={t('agent.coaching.past')}
				description={t('agent.coaching.pastDescription')}
				icon={IconHistory}
				headerActions={
					<Text size='sm' c='dimmed'>
						{t('agent.coaching.rowsCount', { count: past.length })}
					</Text>
				}
			>
				<BaseTable<CoachingSessionRecord>
					data={past}
					columns={columns}
					getRowId={(r) => r.id}
					initialSort={[{ id: 'date', desc: true }]}
					enablePagination
					showPaginationControls
					pageSize={10}
					density='compact'
					emptyMessage={t('agent.coaching.empty')}
					onRowClick={(session) => setDetailSession(session)}
				/>
			</SectionCard>

			<AgentSessionDetailDrawer
				session={detailSession}
				opened={detailSession !== null}
				onClose={() => setDetailSession(null)}
			/>
		</Stack>
	);
}
