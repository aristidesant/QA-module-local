import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	ActionIcon,
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Checkbox,
	Grid,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import {
	IconCheck,
	IconClock,
	IconPhone,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import type {
	CoachingActionItem,
	CoachingBatchDecision,
	CoachingSessionModality,
	CoachingSessionRecord,
	LmsContent,
} from '~/models/qa';
import { LMS_AREA_META, LMS_FORMAT_META } from '~/modules/qa/lms/constants';
import { AREA_TO_DIMENSION } from '~/modules/qa/lms/constants';
import { managerScopeAgents, today } from '~/modules/qa/lms/helpers';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import { day } from '~/modules/qa/lms/mockData';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	useCoachingStore,
	nextCoachingId,
	selectBatches,
	selectCoachingDay,
	selectSessions,
} from '~/stores/qa/coachingStore';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectEnrollments,
	selectPaths,
} from '~/stores/qa/lmsStore';
import { useTeamStore } from '~/stores/qa/teamStore';
import { AgentLearningCard } from '../components/AgentLearningCard';
import { SessionBrief } from '../components/SessionBrief';
import { SessionDecisionCard } from '../components/SessionDecisionCard';
import { SessionPlaceFields } from '../components/SessionPlaceFields';
import {
	PreviousSessionCard,
	SuggestedMaterialCard,
} from '../components/SessionBriefAside';
import queueStyles from '../components/Queue.module.css';
import {
	coachingAgentPath,
	coachingBasePath,
	sessionStatusBadge,
} from '../constants';
import { lastCompletedSession } from '../postCoaching';
import { nextBatchAt } from '../weeklyBatch';

/**
 * One coaching session on its own page (route `sessions/:sessionId`): the
 * pre-loaded brief and the session itself on the left, what the supervisor
 * decides (schedule, complete, outcome) on the right. Color is kept for the
 * few things that are critical: a missed session and, inside the brief, a
 * Critical group, a falling score or a critical error.
 */
export default function CoachingSessionDetailPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms', 'qa.calls']);
	const location = useLocation();
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();

	const role = roleFromPath(location.pathname);
	const sessions = useCoachingStore(selectSessions);
	const coachingDay = useCoachingStore(selectCoachingDay);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const enrollments = useLmsStore(selectEnrollments);
	const batches = useCoachingStore(selectBatches);
	const profilesMap = useTeamStore((s) => s.profiles);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);

	// A supervisor only reaches sessions that involve their own agents.
	const session: CoachingSessionRecord | null =
		sessions.find(
			(s) =>
				s.id === sessionId &&
				(s.agentIds ?? [s.agentId]).some((id) =>
					scopeAgents.some((a) => a.id === id)
				)
		) ?? null;

	// The weekly-batch row behind this session, when it came from one.
	const batchItem = useMemo(
		() =>
			batches
				.flatMap((b) => b.items)
				.find((i) => i.sessionId === session?.id) ?? null,
		[batches, session?.id]
	);

	// The agent's last completed coach-led session before this one, with or without a brief.
	const previousSession = useMemo(() => {
		if (!session) return null;
		const fromBrief = session.brief?.previous;
		if (fromBrief) {
			return sessions.find((s) => s.id === fromBrief.sessionId) ?? null;
		}
		return lastCompletedSession(
			sessions.filter((s) => s.id !== session.id && s.date < session.date),
			session.agentId
		);
	}, [sessions, session]);

	const [outcome, setOutcome] = useState('');
	const [followUp, setFollowUp] = useState<string | null>(null);
	const [items, setItems] = useState<CoachingActionItem[]>([]);
	const [draft, setDraft] = useState('');
	const [proposedDate, setProposedDate] = useState<string | null>(null);
	const [proposedModality, setProposedModality] =
		useState<CoachingSessionModality>('IN_PERSON');
	const [proposedLocation, setProposedLocation] = useState('');
	const [proposedLink, setProposedLink] = useState('');

	useEffect(() => {
		if (!session) return;
		setOutcome(session.outcome ?? '');
		setFollowUp(session.followUpDate ?? day(today(), 14));
		setItems(session.actionItems);
		setDraft('');
		setProposedDate(`${nextBatchAt(coachingDay).coachingDate}T10:00:00.000Z`);
		setProposedModality(session.modality ?? 'IN_PERSON');
		setProposedLocation(session.location ?? '');
		setProposedLink(session.meetingLink ?? '');
		// Reset only when another session loads, not on every store update of this one.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.id, coachingDay]);

	const backToSessions = () =>
		navigate(`${coachingBasePath(role)}?tab=sessions`);
	const openCall = (callId: string) =>
		navigate(`/qa/campaigns/1/calls/${callId}`);

	if (!session) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('sessions.detail.notFound')} />
			</ContentContainer>
		);
	}

	const profile = profilesMap[session.agentId];
	const isAi = session.type === 'AI_MESSAGE';
	const linked = assignments.filter((a) =>
		session.linkedAssignmentIds.includes(a.id)
	);
	const dimension = session.area ? AREA_TO_DIMENSION[session.area] : null;
	const sinceSession =
		profile && dimension
			? profile.performance
					.slice(-3)
					.map((p) => ({ label: p.label, value: p[dimension] }))
			: [];
	const status = sessionStatusBadge(session.status);

	// Each call once; the weak aspects that flagged it are shown beside it.
	const aspectsByCall = new Map<string, string[]>();
	for (const f of session.brief?.findings ?? [])
		for (const id of f.evidenceCallIds)
			aspectsByCall.set(id, [...(aspectsByCall.get(id) ?? []), f.issue]);

	const addItem = () => {
		if (!draft.trim()) return;
		setItems((prev) => [
			...prev,
			{
				id: nextCoachingId('ai'),
				text: draft.trim(),
				dueDate: followUp ?? day(today(), 14),
				done: false,
				acknowledgedByAgent: false,
				acknowledgedAt: null,
			},
		]);
		setDraft('');
	};

	const handleComplete = () => {
		useCoachingStore
			.getState()
			.completeSession(
				session.id,
				outcome.trim() || t('sessions.detail.outcome'),
				items,
				followUp
			);
		notifySuccess(t('sessions.detail.completed'));
		backToSessions();
	};

	const handleStatus = (next: CoachingSessionRecord['status']) => {
		useCoachingStore.getState().setSessionStatus(session.id, next);
		notifySuccess(t('sessions.detail.statusChanged'));
		backToSessions();
	};

	const saveProposed = (
		changes: Parameters<
			ReturnType<typeof useCoachingStore.getState>['updateProposed']
		>[1]
	) => useCoachingStore.getState().updateProposed(session.id, changes);

	const handleDecision = (decision: CoachingBatchDecision) => {
		if (!batchItem || batchItem.decision === decision) return;
		useCoachingStore.getState().setBatchDecision(session.id, decision);
		const updated = useCoachingStore
			.getState()
			.sessions.find((x) => x.id === session.id);
		notifySuccess(
			decision === 'AI_MESSAGE'
				? t('sessions.batch.queued', {
						date: dayjs(updated?.date).format('ddd D MMM'),
					})
				: t('sessions.batch.proposedAgain')
		);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(coachingBasePath(role))}>
						{t('title')}
					</Anchor>
					<Anchor size='sm' onClick={backToSessions}>
						{t('tabs.sessions')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{session.topic}
					</Text>
				</Breadcrumbs>

				<Stack gap={6}>
					<Title order={1}>{session.topic}</Title>
					<Text size='sm' c='dimmed'>
						{session.agentName} ·{' '}
						{dayjs(session.date).format('D MMM YYYY, HH:mm')} ·{' '}
						{session.coachName}
					</Text>
					<Group gap='sm' mt={4}>
						<Badge size='sm' variant={status.variant} color={status.color}>
							{t(`sessions.status.${session.status}`)}
						</Badge>
						<Text size='sm'>
							{t(`sessions.types.${session.type}`)}
							{session.modality && (
								<Text span c='dimmed'>
									{' · '}
									{t(`sessions.modality.${session.modality}`)}
									{session.modality === 'IN_PERSON' &&
										session.location &&
										` (${session.location})`}
								</Text>
							)}
							<Text span c='dimmed'>
								{' · '}
								{session.durationMin} min
							</Text>
							{session.area && (
								<Text span c='dimmed'>
									{' · '}
									{t(LMS_AREA_META[session.area].labelKey, { ns: 'qa.lms' })}
									{session.subItem &&
										` (${t(`subItems.${session.subItem}`, { ns: 'qa.lms' })})`}
								</Text>
							)}
						</Text>
						{session.meetingLink && (
							<Anchor
								size='sm'
								href={
									/^https?:\/\//i.test(session.meetingLink)
										? session.meetingLink
										: `https://${session.meetingLink}`
								}
								target='_blank'
								rel='noreferrer'
							>
								{t('sessions.detail.meetingLink')}
							</Anchor>
						)}
					</Group>
				</Stack>

				<Grid gap='md'>
					<Grid.Col span={{ base: 12, md: 8 }}>
						<Stack gap='md'>
							{session.brief && <SessionBrief brief={session.brief} />}

							{isAi && (
								<SectionCard
									title={t('sessions.detail.aiMessage')}
									padding='md'
								>
									<Text size='sm' className={queueStyles.preWrap}>
										{session.aiMessage}
									</Text>
								</SectionCard>
							)}

							<SectionCard title={t('sessions.detail.evidence')} padding='md'>
								{session.evidenceCallIds.length === 0 ? (
									<Text size='sm' c='dimmed'>
										{t('sessions.detail.noEvidence')}
									</Text>
								) : (
									<Stack gap='xs'>
										{session.evidenceCallIds.map((callId) => {
											const aspects = aspectsByCall.get(callId) ?? [];
											return (
												<Group key={callId} gap='sm' wrap='nowrap'>
													<Badge
														size='sm'
														variant='outline'
														color='gray'
														leftSection={<IconPhone size={12} />}
														className={pointerStyles.pointer}
														onClick={() => openCall(callId)}
													>
														{callId}
													</Badge>
													{aspects.length > 0 && (
														<Text size='xs' c='dimmed'>
															{aspects
																.map((issue) =>
																	t(`issues.${issue}`, { ns: 'qa.calls' })
																)
																.join(' · ')}
														</Text>
													)}
												</Group>
											);
										})}
									</Stack>
								)}
							</SectionCard>

							{!isAi && (
								<>
									<SectionCard
										title={t('sessions.detail.talkingPoints')}
										padding='md'
									>
										{session.talkingPoints.length === 0 ? (
											<Text size='sm' c='dimmed'>
												{t('sessions.detail.noPoints')}
											</Text>
										) : (
											<Stack gap={4}>
												{session.talkingPoints.map((point, i) => (
													<Text key={`${point}-${i}`} size='sm'>
														• {point}
													</Text>
												))}
											</Stack>
										)}
									</SectionCard>

									<SectionCard
										title={t('sessions.detail.actionItems')}
										padding='md'
									>
										<Stack gap='sm'>
											{items.map((item) => (
												<Paper key={item.id} withBorder p='xs' radius='sm'>
													<Group justify='space-between' wrap='nowrap'>
														<Group gap='xs' wrap='nowrap' flex={1}>
															<Checkbox
																size='xs'
																checked={item.done}
																onChange={(e) =>
																	setItems((prev) =>
																		prev.map((x) =>
																			x.id === item.id
																				? {
																						...x,
																						done: e.currentTarget.checked,
																					}
																				: x
																		)
																	)
																}
															/>
															<Stack gap={0} flex={1}>
																<Text size='sm'>{item.text}</Text>
																<Text size='xs' c='dimmed'>
																	{t('sessions.detail.itemDue')} {item.dueDate}
																</Text>
															</Stack>
														</Group>
														<Group gap={4} wrap='nowrap'>
															<Group
																gap={0}
																c={
																	item.acknowledgedByAgent
																		? undefined
																		: 'dimmed'
																}
															>
																{item.acknowledgedByAgent ? (
																	<IconCheck size={14} />
																) : (
																	<IconClock size={14} />
																)}
															</Group>
															<ActionIcon
																size='sm'
																variant='subtle'
																color='gray'
																onClick={() =>
																	setItems((prev) =>
																		prev.filter((x) => x.id !== item.id)
																	)
																}
															>
																<IconTrash size={14} />
															</ActionIcon>
														</Group>
													</Group>
												</Paper>
											))}
											{items.length === 0 && (
												<Text size='sm' c='dimmed'>
													{t('sessions.detail.noItems')}
												</Text>
											)}
											<Group gap='xs' align='flex-end'>
												<TextInput
													label={t('sessions.detail.itemText')}
													value={draft}
													onChange={(e) => setDraft(e.currentTarget.value)}
													flex={1}
												/>
												<Button
													variant='default'
													leftSection={<IconPlus size={14} />}
													onClick={addItem}
												>
													{t('sessions.detail.addItem')}
												</Button>
											</Group>
										</Stack>
									</SectionCard>
								</>
							)}
						</Stack>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Stack gap='md'>
							{batchItem && (
								<SessionDecisionCard
									session={session}
									item={batchItem}
									onDecisionChange={handleDecision}
								>
									{session.status === 'PROPOSED' ? (
										<Stack gap='sm'>
											<DateTimePicker
												label={t('sessions.detail.proposed.date')}
												value={proposedDate}
												onChange={(v) => {
													setProposedDate(v);
													if (v)
														saveProposed({ date: new Date(v).toISOString() });
												}}
												valueFormat='MMM D, YYYY HH:mm'
											/>
											<SessionPlaceFields
												modality={proposedModality}
												location={proposedLocation}
												meetingLink={proposedLink}
												onModalityChange={(m) => {
													setProposedModality(m);
													saveProposed({ modality: m });
												}}
												onLocationChange={(value) => {
													setProposedLocation(value);
													saveProposed({ location: value.trim() || null });
												}}
												onMeetingLinkChange={(value) => {
													setProposedLink(value);
													saveProposed({ meetingLink: value.trim() || null });
												}}
											/>
										</Stack>
									) : session.status === 'SCHEDULED' ? (
										<Text size='sm'>
											{t('sessions.decision.confirmedFor', {
												date: dayjs(session.date).format('ddd D MMM, HH:mm'),
											})}
										</Text>
									) : null}
								</SessionDecisionCard>
							)}

							{!isAi && session.status === 'SCHEDULED' && (
								<SectionCard title={t('sessions.detail.outcome')} padding='md'>
									<Stack gap='sm'>
										<Textarea
											placeholder={t('sessions.detail.outcomePlaceholder')}
											autosize
											minRows={3}
											value={outcome}
											onChange={(e) => setOutcome(e.currentTarget.value)}
										/>
										<DatePickerInput
											label={t('sessions.detail.followUp')}
											value={followUp}
											onChange={(v) =>
												setFollowUp(
													v ? new Date(v).toISOString().slice(0, 10) : null
												)
											}
										/>
										<Stack gap='xs'>
											<Button fullWidth onClick={handleComplete}>
												{t('sessions.detail.complete')}
											</Button>
											<Button
												fullWidth
												variant='default'
												onClick={() => handleStatus('MISSED')}
											>
												{t('sessions.detail.missed')}
											</Button>
											<Button
												fullWidth
												variant='subtle'
												color='gray'
												onClick={() => handleStatus('CANCELLED')}
											>
												{t('sessions.detail.cancel')}
											</Button>
										</Stack>
									</Stack>
								</SectionCard>
							)}

							{!isAi &&
								session.status !== 'PROPOSED' &&
								session.status !== 'SCHEDULED' &&
								(session.outcome || session.followUpDate) && (
									<SectionCard
										title={t('sessions.detail.outcome')}
										padding='md'
									>
										<Stack gap='sm'>
											{session.outcome && (
												<Text size='sm'>{session.outcome}</Text>
											)}
											{session.followUpDate && (
												<Stack gap={0}>
													<Text size='xs' c='dimmed'>
														{t('sessions.detail.followUp')}
													</Text>
													<Text size='sm'>{session.followUpDate}</Text>
												</Stack>
											)}
										</Stack>
									</SectionCard>
								)}

							{!isAi && (
								<PreviousSessionCard
									previous={previousSession}
									comparison={session.brief?.previous ?? null}
								/>
							)}

							{session.type !== 'GROUP' && (
								<AgentLearningCard
									agentId={session.agentId}
									assignments={assignments}
									enrollments={enrollments}
									paths={paths}
									contentById={contentById}
									onViewAll={() =>
										navigate(
											`${coachingAgentPath(role, session.agentId)}?tab=assignments`
										)
									}
								/>
							)}

							{session.brief && (
								<SuggestedMaterialCard
									sessionId={session.id}
									brief={session.brief}
									agentId={session.agentId}
									assignments={assignments}
									contentById={contentById}
									editable={
										session.status === 'PROPOSED' ||
										session.status === 'SCHEDULED'
									}
								/>
							)}

							{!isAi && session.status === 'COMPLETED' && (
								<SectionCard
									title={t('sessions.detail.commitment')}
									padding='md'
								>
									{session.agentCommitment.acknowledged ? (
										<Group gap={6}>
											<IconCheck size={14} />
											<Text size='sm'>
												{t('sessions.detail.committedOn', {
													date:
														session.agentCommitment.acknowledgedAt?.slice(
															0,
															10
														) ?? '',
												})}
											</Text>
										</Group>
									) : (
										<Text size='sm' c='dimmed'>
											{t('sessions.detail.notCommitted')}
										</Text>
									)}
								</SectionCard>
							)}

							{linked.length > 0 && (
								<SectionCard title={t('sessions.detail.linked')} padding='md'>
									<Stack gap='xs'>
										{linked.map((a) => {
											const material = contentById[a.contentId];
											return (
												<Stack key={a.id} gap={0}>
													<Text size='sm'>
														{material?.title ?? a.contentId}
													</Text>
													{material && (
														<Text size='xs' c='dimmed'>
															{t(LMS_FORMAT_META[material.format].labelKey, {
																ns: 'qa.lms',
															})}
														</Text>
													)}
												</Stack>
											);
										})}
									</Stack>
								</SectionCard>
							)}

							{!isAi &&
								session.status === 'COMPLETED' &&
								sinceSession.length > 0 && (
									<SectionCard
										title={t('sessions.detail.impactAfter')}
										padding='md'
									>
										<AreaChart
											h={100}
											data={sinceSession}
											dataKey='label'
											series={[{ name: 'value', color: 'gray.6' }]}
											curveType='monotone'
											withDots={false}
											withYAxis={false}
											gridAxis='none'
										/>
									</SectionCard>
								)}
						</Stack>
					</Grid.Col>
				</Grid>
			</Stack>
		</ContentContainer>
	);
}
