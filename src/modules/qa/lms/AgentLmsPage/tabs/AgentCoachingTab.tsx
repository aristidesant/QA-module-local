import { useMemo } from 'react';
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
	IconTargetArrow,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { CoachingSessionRecord } from '~/models/qa';
import {
	useCoachingStore,
	selectCohorts,
	selectSessions,
} from '~/stores/qa/coachingStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { AGENT_PERSONA } from '../../constants';
import { AreaBadge } from '../../components/Badges';

const helper = createColumnHelper<CoachingSessionRecord>();

const STATUS_COLOR: Record<CoachingSessionRecord['status'], string> = {
	SCHEDULED: 'blue',
	COMPLETED: 'green',
	MISSED: 'red',
	CANCELLED: 'gray',
};

export function AgentCoachingTab() {
	const { t } = useTranslation('qa.lms');
	const allSessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);

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
	const commitments = useMemo(
		() =>
			sessions
				.filter((s) => s.status === 'COMPLETED')
				.flatMap((s) => s.actionItems.map((item) => ({ session: s, item }))),
		[sessions]
	);

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
						<Stack gap='sm'>
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
							{commitments.map(({ session, item }) => (
								<Paper key={item.id} withBorder p='sm' radius='md'>
									<Group
										justify='space-between'
										align='flex-start'
										wrap='nowrap'
									>
										<Stack gap={2} flex={1} miw={0}>
											<Text size='sm' fw={500}>
												{item.text}
											</Text>
											<Text size='xs' c='dimmed'>
												{session.topic} · {session.coachName} ·{' '}
												{t('due.date', { date: item.dueDate })}
											</Text>
										</Stack>
										{item.acknowledgedByAgent ? (
											<Badge
												color='green'
												variant='light'
												leftSection={<IconCheck size={12} />}
											>
												{t('agent.coaching.acknowledged', {
													date: item.acknowledgedAt?.slice(0, 10) ?? '',
												})}
											</Badge>
										) : (
											<Button
												size='xs'
												variant='light'
												onClick={() => handleCommit(session.id, item.id)}
											>
												{t('agent.coaching.acknowledge')}
											</Button>
										)}
									</Group>
								</Paper>
							))}
						</Stack>
					)}
				</SectionCard>
			</SimpleGrid>

			<SectionCard title={t('agent.coaching.past')} icon={IconHistory}>
				<BaseTable<CoachingSessionRecord>
					data={past}
					columns={columns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('agent.coaching.empty')}
				/>
			</SectionCard>
		</Stack>
	);
}
