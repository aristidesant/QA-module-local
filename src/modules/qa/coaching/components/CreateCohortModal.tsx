import { useMemo } from 'react';
import { Button, Group, Modal, MultiSelect, Select, Stack, TagsInput, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { useLmsStore, selectPaths } from '~/stores/qa/lmsStore';
import { managerScopeAgents, type ManagerPersona } from '~/modules/qa/lms/helpers';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';

interface CreateCohortModalProps {
	opened: boolean;
	onClose: () => void;
	role: TeamRole;
	persona: ManagerPersona;
}

interface FormValues {
	name: string;
	description: string;
	agentIds: string[];
	pathId: string | null;
	tags: string[];
}

export function CreateCohortModal({ opened, onClose, role, persona }: CreateCohortModalProps) {
	const { t } = useTranslation('qa.coaching');
	const paths = useLmsStore(selectPaths);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const form = useForm<FormValues>({
		initialValues: { name: '', description: '', agentIds: [], pathId: null, tags: [] },
	});

	const addTeam = (supervisorId: string | null) => {
		if (!supervisorId) return;
		const ids = scopeAgents.filter((a) => a.supervisorId === supervisorId).map((a) => a.id);
		form.setFieldValue('agentIds', [...new Set([...form.values.agentIds, ...ids])]);
	};

	const handleSubmit = () => {
		if (!form.values.name.trim()) {
			notifyWarning(t('cohorts.create.validation.name'));
			return;
		}
		if (form.values.agentIds.length < 2) {
			notifyWarning(t('cohorts.create.validation.members'));
			return;
		}

		const created = useCoachingStore.getState().addCohort({
			name: form.values.name.trim(),
			description: form.values.description.trim(),
			agentIds: form.values.agentIds,
			pathId: form.values.pathId,
			ruleIds: [],
			tags: form.values.tags,
			createdBy: persona.name,
			createdByRole: persona.role,
		});

		if (form.values.pathId) {
			useLmsStore.getState().enroll(form.values.agentIds, form.values.pathId, persona.name, 'MANUAL', null);
		}

		notifySuccess(t('cohorts.create.success', { name: created.name }));
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('cohorts.create.title')} size='lg' centered>
			<Stack gap='sm'>
				<TextInput
					label={t('cohorts.create.name')}
					placeholder={t('cohorts.create.namePlaceholder')}
					value={form.values.name}
					onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
				/>
				<Textarea
					label={t('cohorts.create.description')}
					autosize
					minRows={2}
					value={form.values.description}
					onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
				/>
				<MultiSelect
					label={t('cohorts.create.members')}
					description={t('cohorts.create.membersHint')}
					data={scopeAgents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }))}
					value={form.values.agentIds}
					onChange={(v) => form.setFieldValue('agentIds', v)}
					searchable
					clearable
				/>
				<Select
					label={t('cohorts.create.addTeam')}
					data={TEAM_SUPERVISORS.filter((s) => role === 'qa-manager' || s.id === 'SUP-001').map((s) => ({
						value: s.id,
						label: `${s.team} · ${s.name}`,
					}))}
					value={null}
					onChange={addTeam}
					placeholder={t('cohorts.create.addTeam')}
				/>
				<Select
					label={t('cohorts.create.path')}
					data={paths.filter((p) => p.status === 'PUBLISHED').map((p) => ({ value: p.id, label: p.title }))}
					value={form.values.pathId}
					onChange={(v) => form.setFieldValue('pathId', v)}
					clearable
				/>
				<TagsInput
					label={t('cohorts.create.tags')}
					value={form.values.tags}
					onChange={(v) => form.setFieldValue('tags', v)}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('cohorts.create.cancel')}
					</Button>
					<Button onClick={handleSubmit}>{t('cohorts.create.submit')}</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
