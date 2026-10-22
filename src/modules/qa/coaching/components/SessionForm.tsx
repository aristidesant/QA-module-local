import { useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Autocomplete,
	Badge,
	Button,
	Chip,
	CloseButton,
	Group,
	MultiSelect,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPhone, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { EvidenceCallsModal } from './EvidenceCallsModal';
import { SessionPlaceFields } from './SessionPlaceFields';
import type {
	CoachingCohort,
	CoachingEvidenceMoment,
	CoachingSessionModality,
	CoachingSessionType,
	EvaluationArea,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import {
	managerScopeAgents,
	type ManagerPersona,
} from '~/modules/qa/lms/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	COACHING_TOPICS,
	MODALITY_FREE_TYPES,
	SESSION_DURATIONS,
} from '../constants';

export interface SessionPreset {
	agentId?: string;
	cohortId?: string;
	area?: EvaluationArea | null;
	type?: CoachingSessionType;
	linkedAssignmentIds?: string[];
	topic?: string;
	/** Call pinned as evidence, with the moments that motivated the session. */
	evidenceCallIds?: string[];
	evidenceMoments?: CoachingEvidenceMoment[];
	talkingPoints?: string[];
}

interface SessionFormProps {
	onClose: () => void;
	onSaved: () => void;
	role: TeamRole;
	persona: ManagerPersona;
	preset?: SessionPreset;
	cohorts: CoachingCohort[];
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
}

interface FormValues {
	agentId: string | null;
	/** Participants of a group session. */
	agentIds: string[];
	cohortId: string | null;
	date: string | null;
	durationMin: number;
	type: CoachingSessionType;
	modality: CoachingSessionModality;
	meetingLink: string;
	/** Where an in-person session takes place. */
	location: string;
	topic: string | null;
	area: string | null;
	subItem: string | null;
	evidenceCallIds: string[];
	notes: string;
	linkedAssignmentIds: string[];
}

const tomorrowAt10 = () => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(10, 0, 0, 0);
	return d.toISOString();
};

export function SessionForm({
	onClose,
	onSaved,
	role,
	persona,
	preset,
	cohorts,
	assignments,
	contentById,
}: SessionFormProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);
	const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
	const [pointDraft, setPointDraft] = useState('');
	const [evidenceOpen, setEvidenceOpen] = useState(false);

	const form = useForm<FormValues>({
		initialValues: {
			agentId: null,
			agentIds: [],
			cohortId: null,
			date: tomorrowAt10(),
			durationMin: 30,
			type: 'ONE_ON_ONE',
			modality: 'IN_PERSON',
			meetingLink: '',
			location: '',
			topic: '',
			area: null,
			subItem: null,
			evidenceCallIds: [],
			notes: '',
			linkedAssignmentIds: [],
		},
	});

	useEffect(() => {
		form.setValues({
			agentId: preset?.agentId ?? null,
			agentIds:
				cohorts.find((c) => c.id === preset?.cohortId)?.agentIds ??
				(preset?.agentId ? [preset.agentId] : []),
			cohortId: preset?.cohortId ?? null,
			date: tomorrowAt10(),
			durationMin: 30,
			type: preset?.type ?? (preset?.cohortId ? 'GROUP' : 'ONE_ON_ONE'),
			modality: 'IN_PERSON',
			meetingLink: '',
			location: '',
			topic: preset?.topic ?? '',
			area: preset?.area ?? null,
			subItem: null,
			evidenceCallIds: preset?.evidenceCallIds ?? [],
			notes: '',
			linkedAssignmentIds: preset?.linkedAssignmentIds ?? [],
		});
		setTalkingPoints(preset?.talkingPoints ?? []);
		setPointDraft('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preset]);

	const isGroup = form.values.type === 'GROUP';
	const isVirtual =
		!MODALITY_FREE_TYPES.includes(form.values.type) &&
		form.values.modality === 'REMOTE';
	const isInPerson =
		!MODALITY_FREE_TYPES.includes(form.values.type) &&
		form.values.modality === 'IN_PERSON';

	// The evidence filter starts on the session's agent, or on the group's participants.
	const evidenceAgentIds = isGroup
		? form.values.agentIds
		: form.values.agentId
			? [form.values.agentId]
			: [];

	const agentAssignments = useMemo(
		() =>
			form.values.agentId
				? assignments.filter(
						(a) => a.agentId === form.values.agentId && a.status !== 'COMPLETED'
					)
				: [],
		[assignments, form.values.agentId]
	);

	const addPoint = () => {
		if (!pointDraft.trim()) return;
		setTalkingPoints((prev) => [...prev, pointDraft.trim()]);
		setPointDraft('');
	};

	const handleSubmit = () => {
		if (isGroup ? form.values.agentIds.length < 2 : !form.values.agentId) {
			notifyWarning(t('sessions.editor.validation.agent'));
			return;
		}
		if (!form.values.topic?.trim()) {
			notifyWarning(t('sessions.editor.validation.topic'));
			return;
		}
		if (!form.values.date) {
			notifyWarning(t('sessions.editor.validation.date'));
			return;
		}
		if (isInPerson && !form.values.location.trim()) {
			form.setFieldError('location', t('sessions.place.required'));
			return;
		}
		if (isVirtual && !form.values.meetingLink.trim()) {
			form.setFieldError(
				'meetingLink',
				t('sessions.editor.validation.meetingLink')
			);
			return;
		}

		const participants = scopeAgents.filter((a) =>
			form.values.agentIds.includes(a.id)
		);
		const cohort = cohorts.find((c) => c.id === form.values.cohortId);
		const agent = scopeAgents.find((a) => a.id === form.values.agentId);
		const agentId = isGroup
			? (participants[0]?.id ?? '')
			: (form.values.agentId as string);
		const agentName = isGroup
			? cohort &&
				cohort.agentIds.length === participants.length &&
				cohort.agentIds.every((id) => form.values.agentIds.includes(id))
				? `${cohort.name} (${participants.length})`
				: `${participants
						.slice(0, 2)
						.map((a) => a.name)
						.join(
							', '
						)}${participants.length > 2 ? ` +${participants.length - 2}` : ''}`
			: (agent?.name ?? '');

		useCoachingStore.getState().scheduleSession(
			{
				agentId,
				agentName,
				date: new Date(form.values.date).toISOString(),
				durationMin: form.values.durationMin,
				type: form.values.type,
				modality: MODALITY_FREE_TYPES.includes(form.values.type)
					? null
					: form.values.modality,
				meetingLink: isVirtual ? form.values.meetingLink.trim() : null,
				location: isInPerson ? form.values.location.trim() : null,
				topic: form.values.topic.trim(),
				area: null,
				subItem: null,
				evidenceCallIds: form.values.evidenceCallIds,
				evidenceMoments: (preset?.evidenceMoments ?? []).filter((m) =>
					form.values.evidenceCallIds.includes(m.callId)
				),
				talkingPoints,
				notes: form.values.notes,
				linkedAssignmentIds: form.values.linkedAssignmentIds,
				agentIds: isGroup ? form.values.agentIds : undefined,
				cohortId: isGroup ? form.values.cohortId : null,
			},
			{ id: persona.id, name: persona.name, role: persona.role }
		);

		notifySuccess(t('sessions.editor.success', { name: agentName }));
		onSaved();
	};

	return (
		<Stack gap='md'>
			<SectionCard title={t('sessions.editor.agent')} padding='md'>
				<Stack gap='sm'>
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{t('sessions.editor.format')}
						</Text>
						<AppSegmentedControl
							size='sm'
							value={isGroup ? 'GROUP' : 'ONE_ON_ONE'}
							onChange={(v) => {
								form.setFieldValue('type', v as CoachingSessionType);
								form.setFieldValue('evidenceCallIds', []);
							}}
							data={[
								{
									value: 'ONE_ON_ONE',
									label: t('sessions.editor.formats.ONE_ON_ONE'),
								},
								{ value: 'GROUP', label: t('sessions.editor.formats.GROUP') },
							]}
						/>
					</Stack>
					{!MODALITY_FREE_TYPES.includes(form.values.type) && (
						<Stack gap={4}>
							<Text size='sm' fw={500}>
								{t('sessions.editor.modality')}
							</Text>
							<SessionPlaceFields
								modality={form.values.modality}
								location={form.values.location}
								meetingLink={form.values.meetingLink}
								locationError={form.errors.location}
								meetingLinkError={form.errors.meetingLink}
								onModalityChange={(m) => {
									form.setFieldValue('modality', m);
									form.clearErrors();
								}}
								onLocationChange={(value) => {
									form.setFieldValue('location', value);
									form.clearFieldError('location');
								}}
								onMeetingLinkChange={(value) => {
									form.setFieldValue('meetingLink', value);
									form.clearFieldError('meetingLink');
								}}
							/>
						</Stack>
					)}
					{isGroup ? (
						<>
							<MultiSelect
								label={t('sessions.editor.participants')}
								description={t('sessions.editor.participantsHint')}
								data={scopeAgents.map((a) => ({
									value: a.id,
									label: `${a.name} · ${a.team}`,
								}))}
								value={form.values.agentIds}
								onChange={(v) => {
									form.setFieldValue('agentIds', v);
									form.setFieldValue('evidenceCallIds', []);
								}}
								searchable
								clearable
							/>
							<Select
								label={t('sessions.editor.addFromGroup')}
								placeholder={t('sessions.editor.addFromGroupPlaceholder')}
								data={cohorts.map((c) => ({
									value: c.id,
									label: `${c.name} · ${c.agentIds.length}`,
								}))}
								value={null}
								onChange={(v) => {
									const group = cohorts.find((c) => c.id === v);
									if (!group) return;
									form.setFieldValue('cohortId', group.id);
									form.setFieldValue('agentIds', [
										...new Set([...form.values.agentIds, ...group.agentIds]),
									]);
									form.setFieldValue('evidenceCallIds', []);
								}}
								clearable
							/>
						</>
					) : (
						<Select
							label={t('sessions.editor.agent')}
							data={scopeAgents.map((a) => ({
								value: a.id,
								label: `${a.name} · ${a.team}`,
							}))}
							value={form.values.agentId}
							onChange={(v) => {
								form.setFieldValue('agentId', v);
								form.setFieldValue('evidenceCallIds', []);
							}}
							searchable
						/>
					)}
				</Stack>
			</SectionCard>

			<SectionCard title={t('sessions.editor.date')} padding='md'>
				<Stack gap='sm'>
					<DateTimePicker
						label={t('sessions.editor.date')}
						minDate={new Date()}
						value={form.values.date}
						onChange={(v) => form.setFieldValue('date', v)}
						valueFormat='MMM D, YYYY HH:mm'
					/>
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{t('sessions.editor.duration')}
						</Text>
						<Chip.Group
							value={String(form.values.durationMin)}
							onChange={(v) => form.setFieldValue('durationMin', Number(v))}
						>
							<Group gap='xs'>
								{SESSION_DURATIONS.map((d) => (
									<Chip key={d} value={String(d)} variant='outline'>
										{t('sessions.editor.minutes', { count: d })}
									</Chip>
								))}
							</Group>
						</Chip.Group>
					</Stack>
				</Stack>
			</SectionCard>

			<SectionCard title={t('sessions.editor.topic')} padding='md'>
				<Stack gap='sm'>
					<Autocomplete
						label={t('sessions.editor.topic')}
						description={t('sessions.editor.topicHint')}
						placeholder={t('sessions.editor.topicPlaceholder')}
						data={COACHING_TOPICS}
						value={form.values.topic ?? ''}
						onChange={(v) => form.setFieldValue('topic', v)}
						limit={COACHING_TOPICS.length}
					/>
					<Stack gap='xs'>
						<Text size='sm' fw={500}>
							{t('sessions.editor.evidence')}
						</Text>
						<Group gap='xs'>
							<Button
								variant='default'
								leftSection={<IconPhone size={14} />}
								onClick={() => setEvidenceOpen(true)}
							>
								{t('sessions.editor.evidenceSelect')}
							</Button>
						</Group>
						{form.values.evidenceCallIds.length === 0 ? (
							<Text size='xs' c='dimmed'>
								{t('sessions.editor.evidenceEmpty')}
							</Text>
						) : (
							<Group gap='xs'>
								{form.values.evidenceCallIds.map((id) => {
									const call = TEAM_CALLS.find((c) => c.id === id);
									return (
										<Badge
											key={id}
											variant='light'
											size='lg'
											tt='none'
											rightSection={
												<CloseButton
													size='xs'
													onClick={() =>
														form.setFieldValue(
															'evidenceCallIds',
															form.values.evidenceCallIds.filter(
																(c) => c !== id
															)
														)
													}
												/>
											}
										>
											{call ? `${call.id} · ${call.agentName}` : id}
										</Badge>
									);
								})}
							</Group>
						)}
						{(preset?.evidenceMoments ?? []).filter((m) =>
							form.values.evidenceCallIds.includes(m.callId)
						).length > 0 && (
							<Stack gap={4}>
								<Text size='xs' fw={500}>
									{t('sessions.editor.evidenceMoments')}
								</Text>
								{(preset?.evidenceMoments ?? [])
									.filter((m) => form.values.evidenceCallIds.includes(m.callId))
									.map((m) => (
										<Text key={m.momentId} size='xs' c='dimmed'>
											• {m.timestamp} · {m.itemName}
										</Text>
									))}
							</Stack>
						)}
					</Stack>

					<Stack gap='xs'>
						<Group gap='xs' align='flex-end'>
							<TextInput
								label={t('sessions.editor.talkingPoints')}
								placeholder={t('sessions.editor.talkingPointPlaceholder')}
								value={pointDraft}
								onChange={(e) => setPointDraft(e.currentTarget.value)}
								flex={1}
							/>
							<Button
								variant='light'
								leftSection={<IconPlus size={14} />}
								onClick={addPoint}
							>
								{t('sessions.editor.addPoint')}
							</Button>
						</Group>
						{talkingPoints.map((point, i) => (
							<Group key={`${point}-${i}`} gap='xs' justify='space-between'>
								<Text size='sm'>• {point}</Text>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='red'
									onClick={() =>
										setTalkingPoints((prev) =>
											prev.filter((_, idx) => idx !== i)
										)
									}
								>
									<IconTrash size={14} />
								</ActionIcon>
							</Group>
						))}
					</Stack>

					{!isGroup && agentAssignments.length > 0 && (
						<MultiSelect
							label={t('sessions.editor.linked')}
							data={agentAssignments.map((a) => ({
								value: a.id,
								label: contentById[a.contentId]?.title ?? a.contentId,
							}))}
							value={form.values.linkedAssignmentIds}
							onChange={(v) => form.setFieldValue('linkedAssignmentIds', v)}
						/>
					)}

					<Textarea
						label={t('sessions.editor.notes')}
						autosize
						minRows={2}
						value={form.values.notes}
						onChange={(e) => form.setFieldValue('notes', e.currentTarget.value)}
					/>
				</Stack>
			</SectionCard>

			<Group justify='flex-end'>
				<Button variant='subtle' onClick={onClose}>
					{t('sessions.editor.cancel')}
				</Button>
				<Button onClick={handleSubmit}>{t('sessions.editor.submit')}</Button>
			</Group>
			<EvidenceCallsModal
				opened={evidenceOpen}
				onClose={() => setEvidenceOpen(false)}
				role={role}
				selectedIds={form.values.evidenceCallIds}
				initialAgentIds={evidenceAgentIds}
				onConfirm={(ids) => form.setFieldValue('evidenceCallIds', ids)}
			/>
		</Stack>
	);
}
