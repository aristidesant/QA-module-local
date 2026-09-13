import { useEffect, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendarEvent, IconCheck, IconClock, IconPhone, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingActionItem, CoachingSessionRecord, LmsAssignment, LmsContent } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useCoachingStore, nextCoachingId } from '~/stores/qa/coachingStore';
import { AreaBadge, FormatBadge } from '~/modules/qa/lms/components/Badges';
import { AREA_TO_DIMENSION } from '~/modules/qa/lms/constants';
import { day } from '~/modules/qa/lms/mockData';
import { today } from '~/modules/qa/lms/helpers';
import type { AgentProfile } from '~/modules/qa/team/types';
import { SESSION_STATUS_COLOR } from '../constants';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';

interface SessionDetailDrawerProps {
	session: CoachingSessionRecord | null;
	profile: AgentProfile | undefined;
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	opened: boolean;
	onClose: () => void;
	onOpenCall: (callId: string) => void;
}

export function SessionDetailDrawer({
	session,
	profile,
	assignments,
	contentById,
	opened,
	onClose,
	onOpenCall,
}: SessionDetailDrawerProps) {
	const { t } = useTranslation('qa.coaching');
	const [outcome, setOutcome] = useState('');
	const [followUp, setFollowUp] = useState<string | null>(null);
	const [items, setItems] = useState<CoachingActionItem[]>([]);
	const [draft, setDraft] = useState('');

	useEffect(() => {
		if (!opened || !session) return;
		setOutcome(session.outcome ?? '');
		setFollowUp(session.followUpDate ?? day(today(), 14));
		setItems(session.actionItems);
		setDraft('');
	}, [opened, session]);

	if (!session) return null;

	const linked = assignments.filter((a) => session.linkedAssignmentIds.includes(a.id));
	const dimension = session.area ? AREA_TO_DIMENSION[session.area] : null;
	const sinceSession =
		profile && dimension
			? profile.performance.slice(-3).map((p) => ({ label: p.label, value: p[dimension] }))
			: [];

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
			.completeSession(session.id, outcome.trim() || t('sessions.detail.outcome'), items, followUp);
		notifySuccess(t('sessions.detail.completed'));
		onClose();
	};

	const handleStatus = (status: CoachingSessionRecord['status']) => {
		useCoachingStore.getState().setSessionStatus(session.id, status);
		notifySuccess(t('sessions.detail.statusChanged'));
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={session.topic}
			description={`${session.agentName} · ${dayjs(session.date).format('D MMM YYYY HH:mm')} · ${session.coachName}`}
			icon={<IconCalendarEvent size={18} />}
			iconColor={SESSION_STATUS_COLOR[session.status]}
		>
			<Stack gap='md'>
				<Group gap='xs'>
					<Badge size='xs' color={SESSION_STATUS_COLOR[session.status]} variant='light'>
						{t(`sessions.status.${session.status}`)}
					</Badge>
					<Badge size='xs' variant='outline'>
						{t(`sessions.types.${session.type}`)}
					</Badge>
					{session.area && <AreaBadge area={session.area} subItem={session.subItem} size='xs' />}
					<Text size='xs' c='dimmed'>
						{session.durationMin} min
					</Text>
				</Group>

				<SectionCard title={t('sessions.detail.evidence')} padding='md'>
					{session.evidenceCallIds.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('sessions.detail.noEvidence')}
						</Text>
					) : (
						<Group gap='xs'>
							{session.evidenceCallIds.map((callId) => (
								<Badge
									key={callId}
									variant='light'
									leftSection={<IconPhone size={12} />}
									className={pointerStyles.pointer}
									onClick={() => onOpenCall(callId)}
								>
									{callId}
								</Badge>
							))}
						</Group>
					)}
				</SectionCard>

				<SectionCard title={t('sessions.detail.talkingPoints')} padding='md'>
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

				{linked.length > 0 && (
					<SectionCard title={t('sessions.detail.linked')} padding='md'>
						<Stack gap='xs'>
							{linked.map((a) => {
								const content = contentById[a.contentId];
								return (
									<Group key={a.id} gap='xs' wrap='nowrap'>
										<Text size='sm'>{content?.title ?? a.contentId}</Text>
										{content && <FormatBadge format={content.format} size='xs' />}
									</Group>
								);
							})}
						</Stack>
					</SectionCard>
				)}

				<SectionCard title={t('sessions.detail.actionItems')} padding='md'>
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
													prev.map((x) => (x.id === item.id ? { ...x, done: e.currentTarget.checked } : x))
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
										<ThemeIcon
											size='sm'
											radius='xl'
											variant='light'
											color={item.acknowledgedByAgent ? 'green' : 'gray'}
										>
											{item.acknowledgedByAgent ? <IconCheck size={12} /> : <IconClock size={12} />}
										</ThemeIcon>
										<ActionIcon
											size='sm'
											variant='subtle'
											color='red'
											onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
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
							<Button variant='light' leftSection={<IconPlus size={14} />} onClick={addItem}>
								{t('sessions.detail.addItem')}
							</Button>
						</Group>
					</Stack>
				</SectionCard>

				<SectionCard title={t('sessions.detail.commitment')} padding='md'>
					{session.agentCommitment.acknowledged ? (
						<Badge color='green' variant='light' leftSection={<IconCheck size={12} />}>
							{t('sessions.detail.committedOn', {
								date: session.agentCommitment.acknowledgedAt?.slice(0, 10) ?? '',
							})}
						</Badge>
					) : (
						<Text size='sm' c='dimmed'>
							{t('sessions.detail.notCommitted')}
						</Text>
					)}
				</SectionCard>

				{session.status === 'SCHEDULED' ? (
					<SectionCard title={t('sessions.detail.outcome')} padding='md'>
						<Stack gap='sm'>
							<Textarea
								placeholder={t('sessions.detail.outcomePlaceholder')}
								autosize
								minRows={2}
								value={outcome}
								onChange={(e) => setOutcome(e.currentTarget.value)}
							/>
							<DatePickerInput
								label={t('sessions.detail.followUp')}
								value={followUp}
								onChange={(v) => setFollowUp(v ? new Date(v).toISOString().slice(0, 10) : null)}
							/>
							<Group justify='flex-end' gap='xs'>
								<Button size='xs' variant='subtle' color='gray' onClick={() => handleStatus('CANCELLED')}>
									{t('sessions.detail.cancel')}
								</Button>
								<Button size='xs' variant='default' onClick={() => handleStatus('MISSED')}>
									{t('sessions.detail.missed')}
								</Button>
								<Button size='xs' onClick={handleComplete}>
									{t('sessions.detail.complete')}
								</Button>
							</Group>
						</Stack>
					</SectionCard>
				) : (
					session.outcome && (
						<SectionCard title={t('sessions.detail.outcome')} padding='md'>
							<Text size='sm'>{session.outcome}</Text>
						</SectionCard>
					)
				)}

				{session.status === 'COMPLETED' && sinceSession.length > 0 && (
					<SectionCard title={t('sessions.detail.impactAfter')} padding='md'>
						<AreaChart
							h={100}
							data={sinceSession}
							dataKey='label'
							series={[{ name: 'value', color: 'blue.6' }]}
							curveType='monotone'
							withDots={false}
							withYAxis={false}
							gridAxis='none'
						/>
					</SectionCard>
				)}
			</Stack>
		</AppDrawer>
	);
}
