import { useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	MultiSelect,
	NumberInput,
	Select,
	Stack,
	TagsInput,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendarEvent, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingCohort, CoachingSessionType, EvaluationArea, LmsAssignment, LmsContent } from '~/models/qa';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { LMS_AREA_META, SUB_ITEMS_BY_AREA } from '~/modules/qa/lms/constants';
import { managerScopeAgents, type ManagerPersona } from '~/modules/qa/lms/helpers';
import { EVALUATION_AREAS } from '~/modules/qa/triggers/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { COACHING_TOPICS, SESSION_DURATIONS, SESSION_TYPES } from '../constants';

export interface SessionPreset {
	agentId?: string;
	cohortId?: string;
	area?: EvaluationArea | null;
	type?: CoachingSessionType;
	linkedAssignmentIds?: string[];
	topic?: string;
}

interface SessionEditorDrawerProps {
	opened: boolean;
	onClose: () => void;
	role: TeamRole;
	persona: ManagerPersona;
	preset?: SessionPreset;
	cohorts: CoachingCohort[];
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
}

interface FormValues {
	agentId: string | null;
	cohortId: string | null;
	date: string | null;
	durationMin: number;
	type: CoachingSessionType;
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

export function SessionEditorDrawer({
	opened,
	onClose,
	role,
	persona,
	preset,
	cohorts,
	assignments,
	contentById,
}: SessionEditorDrawerProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);
	const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
	const [pointDraft, setPointDraft] = useState('');

	const form = useForm<FormValues>({
		initialValues: {
			agentId: null,
			cohortId: null,
			date: tomorrowAt10(),
			durationMin: 30,
			type: 'ONE_ON_ONE',
			topic: COACHING_TOPICS[0],
			area: null,
			subItem: null,
			evidenceCallIds: [],
			notes: '',
			linkedAssignmentIds: [],
		},
	});

	useEffect(() => {
		if (!opened) return;
		form.setValues({
			agentId: preset?.agentId ?? null,
			cohortId: preset?.cohortId ?? null,
			date: tomorrowAt10(),
			durationMin: 30,
			type: preset?.type ?? (preset?.cohortId ? 'GROUP' : 'ONE_ON_ONE'),
			topic: preset?.topic ?? COACHING_TOPICS[0],
			area: preset?.area ?? null,
			subItem: null,
			evidenceCallIds: [],
			notes: '',
			linkedAssignmentIds: preset?.linkedAssignmentIds ?? [],
		});
		setTalkingPoints([]);
		setPointDraft('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, preset]);

	const isGroup = form.values.type === 'GROUP';

	const agentAssignments = useMemo(
		() =>
			form.values.agentId
				? assignments.filter((a) => a.agentId === form.values.agentId && a.status !== 'COMPLETED')
				: [],
		[assignments, form.values.agentId]
	);

	const subItemOptions = useMemo(() => {
		if (!form.values.area) return [];
		return (SUB_ITEMS_BY_AREA[form.values.area as EvaluationArea] ?? []).map((key) => ({
			value: key,
			label: t(`subItems.${key}`, { ns: 'qa.lms' }),
		}));
	}, [form.values.area, t]);

	const addPoint = () => {
		if (!pointDraft.trim()) return;
		setTalkingPoints((prev) => [...prev, pointDraft.trim()]);
		setPointDraft('');
	};

	const handleSubmit = () => {
		if (isGroup ? !form.values.cohortId : !form.values.agentId) {
			notifyWarning(t('sessions.editor.validation.agent'));
			return;
		}
		if (!form.values.topic) {
			notifyWarning(t('sessions.editor.validation.topic'));
			return;
		}
		if (!form.values.date) {
			notifyWarning(t('sessions.editor.validation.date'));
			return;
		}

		const cohort = cohorts.find((c) => c.id === form.values.cohortId);
		const agent = scopeAgents.find((a) => a.id === form.values.agentId);
		const agentId = isGroup ? (cohort?.agentIds[0] ?? '') : (form.values.agentId as string);
		const agentName = isGroup
			? `${cohort?.name ?? ''} (${cohort?.agentIds.length ?? 0} agents)`
			: (agent?.name ?? '');

		useCoachingStore.getState().scheduleSession(
			{
				agentId,
				agentName,
				date: new Date(form.values.date).toISOString(),
				durationMin: form.values.durationMin,
				type: form.values.type,
				topic: form.values.topic,
				area: (form.values.area as EvaluationArea) ?? null,
				subItem: form.values.subItem,
				evidenceCallIds: form.values.evidenceCallIds,
				talkingPoints,
				notes: form.values.notes,
				linkedAssignmentIds: form.values.linkedAssignmentIds,
				cohortId: form.values.cohortId,
			},
			{ id: persona.id, name: persona.name, role: persona.role }
		);

		notifySuccess(t('sessions.editor.success', { name: agentName }));
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={t('sessions.editor.createTitle')}
			icon={<IconCalendarEvent size={18} />}
			iconColor='blue'
		>
			<Stack gap='md'>
				<SectionCard title={t('sessions.editor.agent')} padding='md'>
					<Stack gap='sm'>
						<Select
							label={t('sessions.editor.type')}
							data={SESSION_TYPES.map((s) => ({ value: s, label: t(`sessions.types.${s}`) }))}
							value={form.values.type}
							onChange={(v) => v && form.setFieldValue('type', v as CoachingSessionType)}
						/>
						{isGroup ? (
							<Select
								label={t('sessions.editor.cohort')}
								data={cohorts.map((c) => ({ value: c.id, label: `${c.name} · ${c.agentIds.length}` }))}
								value={form.values.cohortId}
								onChange={(v) => form.setFieldValue('cohortId', v)}
							/>
						) : (
							<Select
								label={t('sessions.editor.agent')}
								data={scopeAgents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }))}
								value={form.values.agentId}
								onChange={(v) => form.setFieldValue('agentId', v)}
								searchable
							/>
						)}
					</Stack>
				</SectionCard>

				<SectionCard title={t('sessions.editor.date')} padding='md'>
					<Group grow>
						<DateTimePicker
							label={t('sessions.editor.date')}
							minDate={new Date()}
							value={form.values.date}
							onChange={(v) => form.setFieldValue('date', v)}
							valueFormat='MMM D, YYYY HH:mm'
						/>
						<NumberInput
							label={t('sessions.editor.duration')}
							min={10}
							max={120}
							step={5}
							value={form.values.durationMin}
							onChange={(v) => form.setFieldValue('durationMin', typeof v === 'number' ? v : 30)}
						/>
					</Group>
					<Group gap='xs' mt='xs'>
						{SESSION_DURATIONS.map((d) => (
							<Button
								key={d}
								size='compact-xs'
								variant={form.values.durationMin === d ? 'filled' : 'default'}
								onClick={() => form.setFieldValue('durationMin', d)}
							>
								{d} min
							</Button>
						))}
					</Group>
				</SectionCard>

				<SectionCard title={t('sessions.editor.topic')} padding='md'>
					<Stack gap='sm'>
						<Select
							label={t('sessions.editor.topic')}
							data={COACHING_TOPICS}
							value={form.values.topic}
							onChange={(v) => form.setFieldValue('topic', v)}
							searchable
						/>
						<Group grow>
							<Select
								label={t('sessions.editor.area')}
								data={EVALUATION_AREAS.map((a) => ({
									value: a,
									label: t(LMS_AREA_META[a].labelKey, { ns: 'qa.lms' }),
								}))}
								value={form.values.area}
								onChange={(v) => {
									form.setFieldValue('area', v);
									form.setFieldValue('subItem', null);
								}}
								clearable
							/>
							<Select
								label={t('sessions.editor.subItem')}
								data={subItemOptions}
								value={form.values.subItem}
								onChange={(v) => form.setFieldValue('subItem', v)}
								disabled={!form.values.area}
								clearable
								searchable
							/>
						</Group>
						<TagsInput
							label={t('sessions.editor.evidence')}
							placeholder={t('sessions.editor.evidencePlaceholder')}
							value={form.values.evidenceCallIds}
							onChange={(v) => form.setFieldValue('evidenceCallIds', v)}
						/>

						<Stack gap='xs'>
							<Group gap='xs' align='flex-end'>
								<TextInput
									label={t('sessions.editor.talkingPoints')}
									placeholder={t('sessions.editor.talkingPointPlaceholder')}
									value={pointDraft}
									onChange={(e) => setPointDraft(e.currentTarget.value)}
									flex={1}
								/>
								<Button variant='light' leftSection={<IconPlus size={14} />} onClick={addPoint}>
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
										onClick={() => setTalkingPoints((prev) => prev.filter((_, idx) => idx !== i))}
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
			</Stack>
		</AppDrawer>
	);
}
