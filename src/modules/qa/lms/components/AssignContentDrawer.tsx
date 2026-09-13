import { useEffect, useMemo } from 'react';
import {
	Button,
	Chip,
	Group,
	MultiSelect,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { IconSchool } from '@tabler/icons-react';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useLmsStore, selectContent, selectPaths } from '~/stores/qa/lmsStore';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { LMS_AREAS, LMS_AREA_META } from '../constants';
import { managerPersona, managerScopeAgents, today } from '../helpers';
import { day } from '../mockData';

export interface AssignPreset {
	agentIds?: string[];
	contentIds?: string[];
	pathId?: string;
	cohortId?: string;
	reason?: string;
	ruleId?: string;
}

interface AssignContentDrawerProps {
	opened: boolean;
	onClose: () => void;
	role: TeamRole;
	preset?: AssignPreset;
	/** Coaching cohorts, when the Coaching module is mounted. Hides the option when empty. */
	cohorts?: { id: string; name: string; agentIds: string[] }[];
}

interface FormValues {
	mode: 'content' | 'path';
	contentIds: string[];
	pathId: string | null;
	targetMode: 'agents' | 'team' | 'cohort';
	agentIds: string[];
	teamId: string | null;
	cohortId: string | null;
	dueDate: string | null;
	mandatory: boolean;
	requireAcceptance: boolean;
	reason: string;
}

export function AssignContentDrawer({ opened, onClose, role, preset, cohorts }: AssignContentDrawerProps) {
	const { t } = useTranslation('qa.lms');
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const persona = managerPersona(role);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const form = useForm<FormValues>({
		initialValues: {
			mode: 'content',
			contentIds: [],
			pathId: null,
			targetMode: 'agents',
			agentIds: [],
			teamId: null,
			cohortId: null,
			dueDate: day(today(), 14),
			mandatory: true,
			requireAcceptance: true,
			reason: '',
		},
	});

	useEffect(() => {
		if (!opened) return;
		form.setValues({
			mode: preset?.pathId ? 'path' : 'content',
			contentIds: preset?.contentIds ?? [],
			pathId: preset?.pathId ?? null,
			targetMode: preset?.cohortId ? 'cohort' : 'agents',
			agentIds: preset?.agentIds ?? [],
			teamId: null,
			cohortId: preset?.cohortId ?? null,
			dueDate: day(today(), 14),
			mandatory: true,
			requireAcceptance: true,
			reason: preset?.reason ?? '',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, preset]);

	const publishedContent = useMemo(() => content.filter((c) => c.status === 'PUBLISHED'), [content]);

	const contentOptions = useMemo(
		() =>
			LMS_AREAS.map((area) => ({
				group: t(LMS_AREA_META[area].labelKey),
				items: publishedContent
					.filter((c) => c.area === area)
					.map((c) => ({
						value: c.id,
						label: `${c.title} · ${t(`formats.${c.format}`)} · ${c.durationMin} min`,
					})),
			})).filter((g) => g.items.length > 0),
		[publishedContent, t]
	);

	const agentOptions = useMemo(
		() => scopeAgents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` })),
		[scopeAgents]
	);

	const teamOptions = useMemo(
		() =>
			TEAM_SUPERVISORS.filter((s) => role === 'qa-manager' || s.id === 'SUP-001').map((s) => ({
				value: s.id,
				label: `${s.team} · ${s.name}`,
			})),
		[role]
	);

	const resolvedAgentIds = useMemo(() => {
		if (form.values.targetMode === 'team') {
			return form.values.teamId
				? scopeAgents.filter((a) => a.supervisorId === form.values.teamId).map((a) => a.id)
				: [];
		}
		if (form.values.targetMode === 'cohort') {
			const cohort = cohorts?.find((c) => c.id === form.values.cohortId);
			return cohort ? cohort.agentIds.filter((id) => scopeAgents.some((a) => a.id === id)) : [];
		}
		return form.values.agentIds;
	}, [form.values.targetMode, form.values.teamId, form.values.cohortId, form.values.agentIds, cohorts, scopeAgents]);

	const selectedPath = paths.find((p) => p.id === form.values.pathId);
	const itemCount = form.values.mode === 'path' ? (selectedPath?.modules.length ?? 0) : form.values.contentIds.length;

	const validationError = (): string | null => {
		if (form.values.mode === 'content' && form.values.contentIds.length === 0) {
			return t('manager.assignDrawer.validation.material');
		}
		if (form.values.mode === 'path' && !form.values.pathId) {
			return t('manager.assignDrawer.validation.path', { defaultValue: t('manager.assignDrawer.validation.material') });
		}
		if (resolvedAgentIds.length === 0) return t('manager.assignDrawer.validation.agents');
		if (!form.values.dueDate) return t('manager.assignDrawer.validation.due');
		if (form.values.reason.trim().length < 10) return t('manager.assignDrawer.validation.reason');
		return null;
	};

	const handleSubmit = () => {
		const error = validationError();
		if (error) {
			notifyWarning(error);
			return;
		}
		const dueDate = new Date(form.values.dueDate as string).toISOString().slice(0, 10);
		const store = useLmsStore.getState();

		if (form.values.mode === 'path' && selectedPath) {
			store.enroll(resolvedAgentIds, selectedPath.id, persona.name, 'MANUAL', dueDate);
			store.assign({
				agentIds: resolvedAgentIds,
				contentIds: selectedPath.modules.filter((m) => m.required).map((m) => m.contentId),
				pathId: selectedPath.id,
				dueDate,
				mandatory: form.values.mandatory,
				requireAcceptance: form.values.requireAcceptance,
				reason: form.values.reason.trim(),
				source: 'LEARNING_PATH',
				assignedBy: persona.name,
				assignedByRole: persona.role,
			});
			notifySuccess(
				t('manager.assignDrawer.successPath', { count: resolvedAgentIds.length, path: selectedPath.title })
			);
		} else {
			const created = store.assign({
				agentIds: resolvedAgentIds,
				contentIds: form.values.contentIds,
				dueDate,
				mandatory: form.values.mandatory,
				requireAcceptance: form.values.requireAcceptance,
				reason: form.values.reason.trim(),
				source: preset?.ruleId ? 'COACHING_RULE' : 'MANUAL',
				ruleId: preset?.ruleId ?? null,
				assignedBy: persona.name,
				assignedByRole: persona.role,
			});
			notifySuccess(t('manager.assignDrawer.success', { count: created.length }));
		}

		onClose();
	};

	const presetAgent = preset?.agentIds?.length === 1 ? scopeAgents.find((a) => a.id === preset.agentIds?.[0]) : undefined;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={
				presetAgent
					? t('manager.assignDrawer.titleWithAgent', { name: presetAgent.name })
					: t('manager.assignDrawer.title')
			}
			icon={<IconSchool size={18} />}
			iconColor='blue'
		>
			<Stack gap='md'>
				<SectionCard title={t('manager.assignDrawer.what')} padding='md'>
					<Stack gap='sm'>
						<AppSegmentedControl
							size='sm'
							value={form.values.mode}
							onChange={(v) => form.setFieldValue('mode', v as FormValues['mode'])}
							data={[
								{ label: t('manager.assignDrawer.mode.content'), value: 'content' },
								{ label: t('manager.assignDrawer.mode.path'), value: 'path' },
							]}
						/>
						{form.values.mode === 'content' ? (
							<MultiSelect
								label={t('manager.assignDrawer.material')}
								placeholder={t('manager.assignDrawer.materialPlaceholder')}
								data={contentOptions}
								value={form.values.contentIds}
								onChange={(v) => form.setFieldValue('contentIds', v)}
								searchable
								clearable
								maxDropdownHeight={280}
							/>
						) : (
							<Select
								label={t('manager.assignDrawer.path')}
								data={paths
									.filter((p) => p.status === 'PUBLISHED')
									.map((p) => ({ value: p.id, label: `${p.title} · ${p.modules.length} · ${p.estimatedMin} min` }))}
								value={form.values.pathId}
								onChange={(v) => form.setFieldValue('pathId', v)}
								searchable
							/>
						)}
					</Stack>
				</SectionCard>

				<SectionCard title={t('manager.assignDrawer.who')} padding='md'>
					<Stack gap='sm'>
						<AppSegmentedControl
							size='sm'
							value={form.values.targetMode}
							onChange={(v) => form.setFieldValue('targetMode', v as FormValues['targetMode'])}
							data={[
								{ label: t('manager.assignDrawer.targetMode.agents'), value: 'agents' },
								{ label: t('manager.assignDrawer.targetMode.team'), value: 'team' },
								...(cohorts?.length
									? [{ label: t('manager.assignDrawer.targetMode.cohort'), value: 'cohort' }]
									: []),
							]}
						/>

						{form.values.targetMode === 'agents' && (
							<MultiSelect
								label={t('manager.assignDrawer.agents')}
								placeholder={t('manager.assignDrawer.agentsPlaceholder')}
								data={agentOptions}
								value={form.values.agentIds}
								onChange={(v) => form.setFieldValue('agentIds', v)}
								searchable
								clearable
								maxDropdownHeight={280}
							/>
						)}
						{form.values.targetMode === 'team' && (
							<Select
								label={t('manager.assignDrawer.team')}
								data={teamOptions}
								value={form.values.teamId}
								onChange={(v) => form.setFieldValue('teamId', v)}
							/>
						)}
						{form.values.targetMode === 'cohort' && (
							<Select
								label={t('manager.assignDrawer.cohort')}
								data={(cohorts ?? []).map((c) => ({ value: c.id, label: `${c.name} · ${c.agentIds.length}` }))}
								value={form.values.cohortId}
								onChange={(v) => form.setFieldValue('cohortId', v)}
							/>
						)}

						<Text size='xs' c='dimmed'>
							{t('manager.assignDrawer.summary', {
								items: itemCount,
								agents: resolvedAgentIds.length,
								date: form.values.dueDate ? new Date(form.values.dueDate).toISOString().slice(0, 10) : '—',
							})}
						</Text>
					</Stack>
				</SectionCard>

				<SectionCard title={t('manager.assignDrawer.when')} padding='md'>
					<Stack gap='sm'>
						<DatePickerInput
							label={t('manager.assignDrawer.dueDate')}
							minDate={new Date(today())}
							value={form.values.dueDate}
							onChange={(v) => form.setFieldValue('dueDate', v)}
						/>
						<Chip.Group
							value={null}
							onChange={(v) => {
								if (typeof v === 'string') form.setFieldValue('dueDate', day(today(), Number(v)));
							}}
						>
							<Group gap='xs'>
								{[7, 14, 30].map((d) => (
									<Chip key={d} value={String(d)} size='xs' variant='outline'>
										{t(`manager.assignDrawer.dueQuick.${d}`)}
									</Chip>
								))}
							</Group>
						</Chip.Group>

						<Switch
							label={t('manager.assignDrawer.mandatory')}
							description={t('manager.assignDrawer.mandatoryHint')}
							checked={form.values.mandatory}
							onChange={(e) => form.setFieldValue('mandatory', e.currentTarget.checked)}
						/>
						<Switch
							label={t('manager.assignDrawer.requireAcceptance')}
							description={t('manager.assignDrawer.requireAcceptanceHint')}
							checked={form.values.requireAcceptance}
							onChange={(e) => form.setFieldValue('requireAcceptance', e.currentTarget.checked)}
						/>
						<Textarea
							label={t('manager.assignDrawer.reason')}
							placeholder={t('manager.assignDrawer.reasonPlaceholder')}
							autosize
							minRows={2}
							value={form.values.reason}
							onChange={(e) => form.setFieldValue('reason', e.currentTarget.value)}
						/>
					</Stack>
				</SectionCard>

				<Group justify='flex-end'>
					<Button variant='subtle' onClick={onClose}>
						{t('manager.assignDrawer.cancel')}
					</Button>
					<Button onClick={handleSubmit} disabled={validationError() !== null}>
						{t('manager.assignDrawer.submit')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
