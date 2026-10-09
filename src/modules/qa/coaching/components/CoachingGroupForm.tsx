import { useMemo, useState } from 'react';
import {
	Box,
	Button,
	Group,
	MultiSelect,
	NumberInput,
	Pill,
	Select,
	Stack,
	TagsInput,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingCohort } from '~/models/qa';
import { MaterialPickerModal } from '~/modules/qa/lms/components/MaterialPickerModal';
import {
	managerScopeAgents,
	today,
	type ManagerPersona,
} from '~/modules/qa/lms/helpers';
import { day } from '~/modules/qa/lms/mockData';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { selectContent, selectPaths, useLmsStore } from '~/stores/qa/lmsStore';
import { CohortMembersProgress } from './CohortMembersProgress';
import { PickerField } from './PickerField';
import styles from './CoachingRuleForm.module.css';

/** Days a new member has to finish what the group assigns, unless the supervisor changes it. */
const DEFAULT_DUE_DAYS = 14;

interface GroupFormValues {
	name: string;
	description: string;
	tags: string[];
	agentIds: string[];
	pathId: string | null;
	contentIds: string[];
	dueInDays: number;
}

const toValues = (cohort: CoachingCohort | null): GroupFormValues => ({
	name: cohort?.name ?? '',
	description: cohort?.description ?? '',
	tags: cohort?.tags ?? [],
	agentIds: cohort?.agentIds ?? [],
	pathId: cohort?.pathId ?? null,
	contentIds: cohort?.contentIds ?? [],
	dueInDays: DEFAULT_DUE_DAYS,
});

interface CoachingGroupFormProps {
	mode: 'create' | 'edit';
	cohort: CoachingCohort | null;
	role: TeamRole;
	persona: ManagerPersona;
	onClose: () => void;
	onSaved: () => void;
}

/** One learning group: who is in it, and the path and materials every member gets. */
export function CoachingGroupForm({
	mode,
	cohort,
	role,
	persona,
	onClose,
	onSaved,
}: CoachingGroupFormProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);
	const [picker, setPicker] = useState<'path' | 'content' | null>(null);

	const form = useForm<GroupFormValues>({ initialValues: toValues(cohort) });

	const addTeam = (supervisorId: string | null) => {
		if (!supervisorId) return;
		const ids = scopeAgents
			.filter((a) => a.supervisorId === supervisorId)
			.map((a) => a.id);
		form.setFieldValue('agentIds', [
			...new Set([...form.values.agentIds, ...ids]),
		]);
		form.clearFieldError('agentIds');
	};

	/** Marks each invalid field inline and reports whether the group can be saved. */
	const validate = (): boolean => {
		form.clearErrors();
		const errors: Record<string, string> = {};
		if (!form.values.name.trim()) {
			errors.name = t('cohorts.create.validation.name');
		}
		if (form.values.agentIds.length < 2) {
			errors.agentIds = t('cohorts.create.validation.members');
		}
		const assigns =
			form.values.pathId !== null || form.values.contentIds.length > 0;
		if (assigns && (form.values.dueInDays < 1 || form.values.dueInDays > 90)) {
			errors.dueInDays = t('cohorts.create.validation.due');
		}
		form.setErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSave = () => {
		if (!validate()) {
			notifyWarning(t('cohorts.create.validation.fixFields'));
			return;
		}
		const { agentIds, pathId, contentIds } = form.values;
		const name = form.values.name.trim();
		const lms = useLmsStore.getState();
		const dueDate = day(today(), form.values.dueInDays);
		const base = {
			dueDate,
			mandatory: false,
			requireAcceptance: false,
			reason: t('cohorts.assignReason', { name }),
			assignedBy: persona.name,
			assignedByRole: persona.role,
		};
		const path = paths.find((p) => p.id === pathId);

		/** Enrols in the path and assigns its required modules, like the assign drawer does. */
		const enrolInPath = (ids: string[]) => {
			if (!path || ids.length === 0) return;
			lms.enroll(ids, path.id, persona.name, 'MANUAL', dueDate);
			lms.assign({
				...base,
				agentIds: ids,
				contentIds: path.modules
					.filter((m) => m.required)
					.map((m) => m.contentId),
				pathId: path.id,
				source: 'LEARNING_PATH',
			});
		};
		const assignMaterials = (ids: string[], materialIds: string[]) => {
			if (ids.length === 0 || materialIds.length === 0) return;
			lms.assign({
				...base,
				agentIds: ids,
				contentIds: materialIds,
				pathId: null,
				source: 'MANUAL',
			});
		};

		if (mode === 'edit' && cohort) {
			useCoachingStore.getState().updateCohort({
				...cohort,
				name,
				description: form.values.description.trim(),
				tags: form.values.tags,
				agentIds,
				pathId,
				contentIds,
			});
			const added = agentIds.filter((id) => !cohort.agentIds.includes(id));
			const staying = agentIds.filter((id) => cohort.agentIds.includes(id));
			const addedMaterials = contentIds.filter(
				(id) => !cohort.contentIds.includes(id)
			);
			// A new path reaches everyone; the same path only reaches whoever just joined.
			enrolInPath(pathId !== cohort.pathId ? agentIds : added);
			// New members get every material; members already in get only the ones just added.
			assignMaterials(added, contentIds);
			assignMaterials(staying, addedMaterials);
			notifySuccess(t('cohorts.edit.success', { name }));
		} else {
			const created = useCoachingStore.getState().addCohort({
				name,
				description: form.values.description.trim(),
				tags: form.values.tags,
				agentIds,
				pathId,
				contentIds,
				ruleIds: [],
				createdBy: persona.name,
				createdByRole: persona.role,
			});
			enrolInPath(agentIds);
			assignMaterials(agentIds, contentIds);
			notifySuccess(t('cohorts.create.success', { name: created.name }));
		}
		onSaved();
	};

	/** Removes the group; enrolments and assignments its members already have stay. */
	const handleDelete = () => {
		if (!cohort) return;
		modals.openConfirmModal({
			title: t('cohorts.edit.delete'),
			children: <Text size='sm'>{cohort.name}</Text>,
			labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: () => {
				useCoachingStore.getState().deleteCohort(cohort.id);
				notifySuccess(t('cohorts.edit.deleted'));
				onSaved();
			},
		});
	};

	const handleClose = () => {
		if (form.isDirty()) {
			modals.openConfirmModal({
				title: t('rules.editor.discard'),
				labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
				confirmProps: { color: 'red' },
				onConfirm: onClose,
			});
			return;
		}
		onClose();
	};

	const pathTitle =
		paths.find((p) => p.id === form.values.pathId)?.title ?? null;

	return (
		<Stack gap='md'>
			<SectionCard title={t('cohorts.create.sections.basics')} padding='md'>
				<Stack gap='sm'>
					<TextInput
						label={t('cohorts.create.name')}
						placeholder={t('cohorts.create.namePlaceholder')}
						maw={480}
						value={form.values.name}
						error={form.errors.name}
						onChange={(e) => {
							form.setFieldValue('name', e.currentTarget.value);
							form.clearFieldError('name');
						}}
					/>
					<Textarea
						label={t('cohorts.create.description')}
						autosize
						minRows={2}
						value={form.values.description}
						onChange={(e) =>
							form.setFieldValue('description', e.currentTarget.value)
						}
					/>
					<TagsInput
						label={t('cohorts.create.tags')}
						value={form.values.tags}
						onChange={(v) => form.setFieldValue('tags', v)}
					/>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('cohorts.create.sections.members')}
				description={t('cohorts.create.sections.membersHint')}
				padding='md'
			>
				<Stack gap='sm'>
					<MultiSelect
						label={t('cohorts.create.members')}
						data={scopeAgents.map((a) => ({
							value: a.id,
							label: `${a.name} · ${a.team}`,
						}))}
						value={form.values.agentIds}
						error={form.errors.agentIds}
						onChange={(v) => {
							form.setFieldValue('agentIds', v);
							form.clearFieldError('agentIds');
						}}
						searchable
						clearable
					/>
					<Select
						label={t('cohorts.create.addTeam')}
						placeholder={t('cohorts.create.addTeam')}
						maw={320}
						data={TEAM_SUPERVISORS.filter(
							(s) => role === 'qa-manager' || s.id === persona.id
						).map((s) => ({
							value: s.id,
							label: `${s.team} · ${s.name}`,
						}))}
						value={null}
						onChange={addTeam}
					/>
					<Text size='sm' c='dimmed'>
						{t('cohorts.members', { count: form.values.agentIds.length })}
					</Text>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('cohorts.create.sections.learning')}
				description={t('cohorts.create.sections.learningHint')}
				padding='md'
			>
				<Stack gap='sm'>
					{/* What every member is enrolled in sits beside its deadline, so the pair reads as one decision. */}
					<Group align='flex-start' gap='md' wrap='nowrap'>
						<Box flex={1} miw={0}>
							<PickerField
								label={t('cohorts.create.path')}
								placeholder={t('cohorts.picker.pathPlaceholder')}
								summary={pathTitle}
								onOpen={() => setPicker('path')}
							/>
						</Box>
						<NumberInput
							w={140}
							label={t('cohorts.create.dueInDays')}
							min={1}
							max={90}
							value={form.values.dueInDays}
							error={form.errors.dueInDays}
							onChange={(v) => {
								form.setFieldValue(
									'dueInDays',
									typeof v === 'number' ? v : DEFAULT_DUE_DAYS
								);
								form.clearFieldError('dueInDays');
							}}
						/>
					</Group>
					{form.values.pathId && (
						<Box>
							<Button
								variant='subtle'
								size='compact-xs'
								onClick={() => form.setFieldValue('pathId', null)}
							>
								{t('cohorts.create.pathClear')}
							</Button>
						</Box>
					)}

					<PickerField
						label={t('cohorts.create.materials')}
						placeholder={t('cohorts.picker.contentPlaceholder')}
						summary={
							form.values.contentIds.length > 0
								? t('rules.editor.picker.selected', {
										count: form.values.contentIds.length,
									})
								: null
						}
						onOpen={() => setPicker('content')}
					/>
					{form.values.contentIds.length > 0 && (
						<Group gap='xs'>
							{form.values.contentIds.map((id) => (
								<Pill
									key={id}
									size='md'
									withRemoveButton
									removeButtonProps={{ 'aria-label': t('common.remove') }}
									onRemove={() =>
										form.setFieldValue(
											'contentIds',
											form.values.contentIds.filter((x) => x !== id)
										)
									}
								>
									{content.find((c) => c.id === id)?.title ?? id}
								</Pill>
							))}
						</Group>
					)}
				</Stack>
			</SectionCard>

			{mode === 'edit' && cohort && (
				<CohortMembersProgress cohort={cohort} role={role} />
			)}

			{/* Pinned to the viewport so the actions stay in reach on this long form. */}
			<Box className={styles.stickyActions}>
				<Group
					justify={mode === 'edit' ? 'space-between' : 'flex-end'}
					gap='xs'
				>
					{mode === 'edit' && (
						<Button
							variant='subtle'
							color='red'
							leftSection={<IconTrash size={16} />}
							onClick={handleDelete}
						>
							{t('cohorts.edit.delete')}
						</Button>
					)}
					<Group gap='xs'>
						<Button variant='subtle' onClick={handleClose}>
							{t('cohorts.create.cancel')}
						</Button>
						<Button onClick={handleSave}>
							{mode === 'create'
								? t('cohorts.create.submit')
								: t('cohorts.edit.submit')}
						</Button>
					</Group>
				</Group>
			</Box>

			<MaterialPickerModal
				opened={picker !== null}
				onClose={() => setPicker(null)}
				mode={picker ?? 'content'}
				selectedIds={
					picker === 'path'
						? form.values.pathId
							? [form.values.pathId]
							: []
						: form.values.contentIds
				}
				initialArea={null}
				onConfirm={(ids) => {
					if (picker === 'path') {
						form.setFieldValue('pathId', ids[0] ?? null);
					} else {
						form.setFieldValue('contentIds', ids);
					}
				}}
			/>
		</Stack>
	);
}
