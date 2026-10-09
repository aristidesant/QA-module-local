import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
	Box,
	Button,
	Group,
	MultiSelect,
	NumberInput,
	Pill,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type {
	CoachingActionKind,
	CoachingFollowUp,
	CoachingRule,
	CoachingRuleAction,
	CoachingRuleCadence,
	CoachRole,
	ConditionLogic,
	EvaluationArea,
	RuleCondition,
	RuleScope,
	RuleStatus,
} from '~/models/qa';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { ConditionSentenceRow } from '~/modules/qa/triggers/components/ConditionSentenceRow';
import {
	CAMPAIGN_TYPES,
	LINES_OF_BUSINESS,
	METRIC_BY_ID,
	TRIGGER_METRIC_CATALOG,
} from '~/modules/qa/triggers/constants';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import { TRIGGER_CAMPAIGNS } from '~/modules/qa/triggers/mockData';
import { useLmsStore, selectContent, selectPaths } from '~/stores/qa/lmsStore';
import { MaterialPickerModal } from '~/modules/qa/lms/components/MaterialPickerModal';
import { useCoachingStore, nextCoachingId } from '~/stores/qa/coachingStore';
import {
	managerScopeAgents,
	type ManagerPersona,
} from '~/modules/qa/lms/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import { NOW_ISO } from '~/modules/qa/team/constants';
import {
	COACHING_TOPICS,
	DEFAULT_FOLLOW_UP,
	MAX_RULE_CONDITIONS,
} from '../constants';
import { PickerField } from './PickerField';
import styles from './CoachingRuleForm.module.css';

interface CoachingRuleFormValues {
	name: string;
	description: string;
	area: EvaluationArea;
	conditions: RuleCondition[];
	conditionLogic: ConditionLogic;
	scope: RuleScope;
	action: CoachingRuleAction;
	followUp: CoachingFollowUp;
	cooldownDays: number;
	limitEnabled: boolean;
	maxTriggersPerAgent: number;
	cadence: CoachingRuleCadence;
}

interface CoachingRuleFormProps {
	mode: 'create' | 'edit';
	rule: CoachingRule | null;
	role: TeamRole;
	persona: ManagerPersona;
	onClose: () => void;
	onSaved: () => void;
}

const firstMetricOf = (area: EvaluationArea) =>
	TRIGGER_METRIC_CATALOG.find((m) => m.area === area) ??
	TRIGGER_METRIC_CATALOG[0];

const buildCondition = (area: EvaluationArea): RuleCondition => {
	const metric = firstMetricOf(area);
	return {
		id: nextCoachingId('cond'),
		metricId: metric.id,
		subItem: null,
		mode: 'THRESHOLD',
		operator: metric.higherIsBetter ? 'LT' : 'GT',
		value: metric.defaultThreshold,
		value2: null,
		changeDirection: 'DECREASE',
		changePercent: 10,
		consecutiveCount: 3,
		window: 'LAST_14_DAYS',
		windowSize: 10,
	};
};

const emptyScope = (role: TeamRole): RuleScope => ({
	agentIds: [],
	supervisorIds: role === 'supervisor' ? ['SUP-001'] : [],
	campaignIds: [],
	linesOfBusiness: [],
	campaignTypes: [],
});

export function CoachingRuleForm({
	mode,
	rule,
	role,
	persona,
	onClose,
	onSaved,
}: CoachingRuleFormProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	// describeCondition and the row labels live in the Triggers namespace.
	const { t: tTriggers } = useTranslation('qa.triggers');
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const form = useForm<CoachingRuleFormValues>({
		initialValues: {
			name: '',
			description: '',
			area: 'QUALITY_ASSURANCE',
			conditions: [buildCondition('QUALITY_ASSURANCE')],
			conditionLogic: 'ALL',
			scope: emptyScope(role),
			action: {
				kind: 'ASSIGN_CONTENT',
				contentIds: [],
				pathId: null,
				mandatory: true,
				dueInDays: 14,
				requireAcceptance: true,
				scheduleSession: false,
				sessionType: 'ONE_ON_ONE',
				sessionTopic: COACHING_TOPICS[0],
				sessionCoach: role === 'qa-manager' ? 'QA_MANAGER' : 'SUPERVISOR',
				notifySupervisor: true,
			},
			followUp: { ...DEFAULT_FOLLOW_UP },
			cooldownDays: 30,
			limitEnabled: false,
			maxTriggersPerAgent: 3,
			cadence: 'ON_MATCH',
		},
	});

	const [pickerOpen, setPickerOpen] = useState(false);
	const previousArea = useRef<EvaluationArea | null>(null);

	useEffect(() => {
		// Loading a rule must not count as the user switching area.
		previousArea.current = rule
			? (METRIC_BY_ID[rule.conditions[0]?.metricId]?.area ?? rule.area)
			: 'QUALITY_ASSURANCE';
		if (rule) {
			form.setValues({
				name: rule.name,
				description: rule.description,
				area: rule.area,
				conditions: rule.conditions,
				conditionLogic: rule.conditionLogic,
				scope: rule.scope,
				action: rule.action,
				followUp: rule.followUp,
				cooldownDays: rule.cooldownDays,
				limitEnabled: rule.maxTriggersPerAgent != null,
				maxTriggersPerAgent: rule.maxTriggersPerAgent ?? 3,
				cadence: rule.cadence,
			});
		} else {
			form.reset();
			form.setValues({
				name: '',
				description: '',
				area: 'QUALITY_ASSURANCE',
				conditions: [buildCondition('QUALITY_ASSURANCE')],
				conditionLogic: 'ALL',
				scope: emptyScope(role),
				action: {
					kind: 'ASSIGN_CONTENT',
					contentIds: [],
					pathId: null,
					mandatory: true,
					dueInDays: 14,
					requireAcceptance: true,
					scheduleSession: false,
					sessionType: 'ONE_ON_ONE',
					sessionTopic: COACHING_TOPICS[0],
					sessionCoach: role === 'qa-manager' ? 'QA_MANAGER' : 'SUPERVISOR',
					notifySupervisor: true,
				},
				followUp: { ...DEFAULT_FOLLOW_UP },
				cooldownDays: 30,
				limitEnabled: false,
				maxTriggersPerAgent: 3,
				cadence: 'ON_MATCH',
			});
		}
		form.resetDirty();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rule?.id]);

	// The aspect is no longer asked for: it is the area of the first condition.
	const area: EvaluationArea =
		METRIC_BY_ID[form.values.conditions[0]?.metricId]?.area ?? form.values.area;

	useEffect(() => {
		if (previousArea.current === area) return;
		previousArea.current = area;
		form.setFieldValue('action.contentIds', []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [area]);

	/** Marks each invalid field inline and reports whether the form can be saved. */
	const validate = (): boolean => {
		form.clearErrors();
		const errors: Record<string, string> = {};
		if (!form.values.name.trim()) {
			errors.name = t('rules.editor.validation.name');
		}
		if (form.values.conditions.length === 0) {
			errors.conditions = t('rules.editor.validation.condition');
		}
		const badRange = form.values.conditions.find(
			(c) => c.mode === 'RANGE' && (c.value2 ?? c.value) <= c.value
		);
		if (badRange) {
			errors.conditions = tTriggers('editor.validation.rangeInvalid');
		}
		if (
			form.values.action.kind === 'ASSIGN_CONTENT' &&
			form.values.action.contentIds.length === 0
		) {
			errors['action.contentIds'] = t('rules.editor.validation.content');
		}
		if (
			form.values.action.kind === 'ASSIGN_PATH' &&
			!form.values.action.pathId
		) {
			errors['action.pathId'] = t('rules.editor.validation.path');
		}
		if (form.values.action.dueInDays < 1 || form.values.action.dueInDays > 90) {
			errors['action.dueInDays'] = t('rules.editor.validation.due');
		}
		form.setErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const buildRule = (status: RuleStatus): CoachingRule => {
		// A supervisor always stays inside their own team; everything else comes from the Who filters.
		const scope: RuleScope = {
			...form.values.scope,
			supervisorIds:
				role === 'supervisor' ? ['SUP-001'] : form.values.scope.supervisorIds,
		};
		return {
			id: mode === 'edit' && rule ? rule.id : nextCoachingId('cr'),
			name: form.values.name.trim(),
			description: form.values.description.trim(),
			status,
			area,
			// Weekly rules always read the last 7 days, whatever the conditions were set to.
			conditions:
				form.values.cadence === 'WEEKLY'
					? form.values.conditions.map((c) => ({
							...c,
							window: 'LAST_7_DAYS' as const,
						}))
					: form.values.conditions,
			conditionLogic: form.values.conditionLogic,
			scope,
			action: form.values.action,
			followUp: form.values.followUp,
			cooldownDays: form.values.cooldownDays,
			maxTriggersPerAgent: form.values.limitEnabled
				? form.values.maxTriggersPerAgent
				: null,
			cadence: form.values.cadence,
			stats: rule?.stats ?? {
				triggeredLast30Days: 0,
				agentsAffected: 0,
				improvedRate: null,
				lastTriggeredAt: null,
			},
			createdBy: rule?.createdBy ?? persona.name,
			createdByRole: (rule?.createdByRole ?? persona.role) as CoachRole,
			createdAt: rule?.createdAt ?? NOW_ISO,
			updatedAt: NOW_ISO,
		};
	};

	const handleSave = (status: RuleStatus) => {
		if (!validate()) {
			notifyWarning(t('rules.editor.validation.fixFields'));
			return;
		}
		const next = buildRule(status);
		if (mode === 'create') {
			useCoachingStore.getState().addRule(next);
			notifySuccess(t('rules.notifications.created'));
		} else {
			useCoachingStore.getState().updateRule(next);
			notifySuccess(t('rules.notifications.updated'));
		}
		onSaved();
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

	const addCondition = () => {
		if (form.values.conditions.length >= MAX_RULE_CONDITIONS) return;
		form.insertListItem('conditions', buildCondition(area));
	};

	return (
		<Stack gap='md'>
			<SectionCard title={t('rules.editor.sections.basics')} padding='md'>
				<Stack gap='sm'>
					<TextInput
						label={t('rules.editor.fields.name')}
						maw={480}
						value={form.values.name}
						error={form.errors.name}
						onChange={(e) => {
							form.setFieldValue('name', e.currentTarget.value);
							form.clearFieldError('name');
						}}
					/>
					<Textarea
						label={t('rules.editor.fields.description')}
						autosize
						minRows={2}
						value={form.values.description}
						onChange={(e) =>
							form.setFieldValue('description', e.currentTarget.value)
						}
					/>
				</Stack>
			</SectionCard>

			<SectionCard title={t('rules.editor.sections.scope')} padding='md'>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
					<MultiSelect
						label={t('rules.editor.scope.lob')}
						placeholder={t('rules.editor.scope.everyone')}
						data={LINES_OF_BUSINESS}
						value={form.values.scope.linesOfBusiness}
						onChange={(v) => form.setFieldValue('scope.linesOfBusiness', v)}
						clearable
					/>
					<MultiSelect
						label={t('rules.editor.scope.campaignType')}
						placeholder={t('rules.editor.scope.everyone')}
						data={CAMPAIGN_TYPES}
						value={form.values.scope.campaignTypes}
						onChange={(v) =>
							form.setFieldValue(
								'scope.campaignTypes',
								v as RuleScope['campaignTypes']
							)
						}
						clearable
					/>
					<MultiSelect
						label={t('rules.editor.scope.campaigns')}
						placeholder={t('rules.editor.scope.everyone')}
						data={TRIGGER_CAMPAIGNS.map((c) => ({
							value: c.value,
							label: c.label,
						}))}
						value={form.values.scope.campaignIds}
						onChange={(v) => form.setFieldValue('scope.campaignIds', v)}
						clearable
					/>
					<MultiSelect
						label={t('rules.editor.scope.agents')}
						placeholder={t('rules.editor.scope.everyone')}
						data={scopeAgents.map((a) => ({
							value: a.id,
							label: `${a.name} · ${a.team}`,
						}))}
						value={form.values.scope.agentIds}
						onChange={(v) => form.setFieldValue('scope.agentIds', v)}
						searchable
						clearable
					/>
				</SimpleGrid>
			</SectionCard>

			<SectionCard
				title={t('rules.editor.sections.condition')}
				description={t('rules.editor.sections.conditionDescription')}
				padding='md'
			>
				<Stack gap='sm'>
					{form.values.conditions.map((condition, index) => (
						<Fragment key={condition.id}>
							{index === 1 && (
								<AppSegmentedControl
									size='xs'
									value={form.values.conditionLogic}
									onChange={(v) =>
										form.setFieldValue('conditionLogic', v as ConditionLogic)
									}
									data={[
										{ label: t('rules.editor.logicWord.ALL'), value: 'ALL' },
										{ label: t('rules.editor.logicWord.ANY'), value: 'ANY' },
									]}
								/>
							)}
							{index > 1 && (
								<Text size='sm' c='dimmed' fw={500}>
									{t(`rules.editor.logicWord.${form.values.conditionLogic}`)}
								</Text>
							)}
							<ConditionSentenceRow
								condition={condition}
								scoreOnlyAreas={['SENTIMENT_EMOTION']}
								onChange={(updated) => {
									form.setFieldValue(`conditions.${index}`, updated);
									form.clearFieldError('conditions');
								}}
								onRemove={() => form.removeListItem('conditions', index)}
								canRemove={form.values.conditions.length > 1}
							/>
						</Fragment>
					))}

					<Group>
						<Button
							variant='light'
							size='sm'
							leftSection={<IconPlus size={14} />}
							onClick={addCondition}
							disabled={form.values.conditions.length >= MAX_RULE_CONDITIONS}
						>
							{t('rules.editor.fields.addCondition')}
						</Button>
					</Group>

					{typeof form.errors.conditions === 'string' && (
						<Text size='sm' c='danger.7'>
							{form.errors.conditions}
						</Text>
					)}

					<Text size='sm' c='dimmed'>
						{t('rules.editor.preview', {
							summary: form.values.conditions
								.map((c) => describeCondition(tTriggers, c))
								.join(
									` ${t(`rules.editor.logicWord.${form.values.conditionLogic}`)} `
								),
						})}
					</Text>
					{form.values.conditions.some(
						(c) => METRIC_BY_ID[c.metricId].unit === 'SCORE_5'
					) && (
						<Text size='xs' c='dimmed'>
							{tTriggers('editor.fields.scoreScaleHint')}
						</Text>
					)}
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('rules.editor.sections.action')}
				description={t('rules.editor.sections.actionDescription')}
				padding='md'
			>
				<Stack gap='sm'>
					<AppSegmentedControl
						size='sm'
						value={form.values.action.kind}
						onChange={(v) =>
							form.setFieldValue('action.kind', v as CoachingActionKind)
						}
						data={[
							{
								label: t('rules.editor.actionKinds.ASSIGN_CONTENT'),
								value: 'ASSIGN_CONTENT',
							},
							{
								label: t('rules.editor.actionKinds.ASSIGN_PATH'),
								value: 'ASSIGN_PATH',
							},
						]}
					/>

					{/* What to assign sits beside its deadline, so the pair reads as one decision. */}
					<Group align='flex-start' gap='md' wrap='nowrap'>
						<Box flex={1} miw={0}>
							{form.values.action.kind === 'ASSIGN_CONTENT' ? (
								<PickerField
									label={t('rules.editor.fields.content')}
									placeholder={t('rules.editor.picker.contentPlaceholder')}
									summary={
										form.values.action.contentIds.length > 0
											? t('rules.editor.picker.selected', {
													count: form.values.action.contentIds.length,
												})
											: null
									}
									error={form.errors['action.contentIds']}
									onOpen={() => setPickerOpen(true)}
								/>
							) : (
								<PickerField
									label={t('rules.editor.fields.path')}
									placeholder={t('rules.editor.picker.pathPlaceholder')}
									summary={
										paths.find((p) => p.id === form.values.action.pathId)
											?.title ?? null
									}
									error={form.errors['action.pathId']}
									onOpen={() => setPickerOpen(true)}
								/>
							)}
						</Box>
						<NumberInput
							w={140}
							label={t('rules.editor.fields.dueInDays')}
							min={1}
							max={90}
							value={form.values.action.dueInDays}
							error={form.errors['action.dueInDays']}
							onChange={(v) => {
								form.setFieldValue(
									'action.dueInDays',
									typeof v === 'number' ? v : 14
								);
								form.clearFieldError('action.dueInDays');
							}}
						/>
					</Group>
					{form.values.action.kind === 'ASSIGN_CONTENT' &&
						form.values.action.contentIds.length > 0 && (
							<Group gap='xs'>
								{form.values.action.contentIds.map((id) => (
									<Pill
										key={id}
										size='md'
										withRemoveButton
										removeButtonProps={{ 'aria-label': t('common.remove') }}
										onRemove={() =>
											form.setFieldValue(
												'action.contentIds',
												form.values.action.contentIds.filter((x) => x !== id)
											)
										}
									>
										{content.find((c) => c.id === id)?.title ?? id}
									</Pill>
								))}
							</Group>
						)}

					<Stack gap='xs'>
						<Text size='sm' fw={500}>
							{t('rules.editor.fields.options')}
						</Text>
						<Switch
							size='sm'
							label={t('rules.editor.fields.mandatory')}
							checked={form.values.action.mandatory}
							onChange={(e) =>
								form.setFieldValue('action.mandatory', e.currentTarget.checked)
							}
						/>
						<Switch
							size='sm'
							label={t('rules.editor.fields.requireAcceptance')}
							checked={form.values.action.requireAcceptance}
							onChange={(e) =>
								form.setFieldValue(
									'action.requireAcceptance',
									e.currentTarget.checked
								)
							}
						/>
						<Switch
							size='sm'
							label={t('rules.editor.fields.notifySupervisor')}
							checked={form.values.action.notifySupervisor}
							onChange={(e) =>
								form.setFieldValue(
									'action.notifySupervisor',
									e.currentTarget.checked
								)
							}
						/>
					</Stack>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('rules.editor.sections.recurrence')}
				description={t('rules.editor.sections.recurrenceDescription')}
				padding='md'
			>
				<Stack gap='sm'>
					<NumberInput
						w={160}
						label={t('rules.editor.fields.cooldown')}
						description={t('rules.editor.fields.cooldownHint')}
						min={0}
						max={365}
						value={form.values.cooldownDays}
						onChange={(v) =>
							form.setFieldValue('cooldownDays', typeof v === 'number' ? v : 0)
						}
					/>
					<Switch
						label={t('rules.editor.fields.limitPerAgent')}
						checked={form.values.limitEnabled}
						onChange={(e) =>
							form.setFieldValue('limitEnabled', e.currentTarget.checked)
						}
					/>
					{form.values.limitEnabled && (
						<NumberInput
							w={160}
							label={t('rules.editor.fields.maxTriggers')}
							description={t('rules.editor.fields.maxTriggersHint')}
							min={1}
							max={100}
							value={form.values.maxTriggersPerAgent}
							onChange={(v) =>
								form.setFieldValue(
									'maxTriggersPerAgent',
									typeof v === 'number' ? v : 1
								)
							}
						/>
					)}
				</Stack>
			</SectionCard>

			{/* Pinned to the viewport so the actions stay in reach on this long form. */}
			<Box className={styles.stickyActions}>
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleClose}>
						{t('rules.editor.footer.cancel')}
					</Button>
					{mode === 'create' ? (
						<>
							<Button variant='light' onClick={() => handleSave('DRAFT')}>
								{t('rules.editor.footer.saveDraft')}
							</Button>
							<Button onClick={() => handleSave('ACTIVE')}>
								{t('rules.editor.footer.saveActivate')}
							</Button>
						</>
					) : (
						<Button onClick={() => handleSave(rule?.status ?? 'ACTIVE')}>
							{t('rules.editor.footer.save')}
						</Button>
					)}
				</Group>
			</Box>

			<MaterialPickerModal
				opened={pickerOpen}
				onClose={() => setPickerOpen(false)}
				mode={form.values.action.kind === 'ASSIGN_PATH' ? 'path' : 'content'}
				selectedIds={
					form.values.action.kind === 'ASSIGN_PATH'
						? form.values.action.pathId
							? [form.values.action.pathId]
							: []
						: form.values.action.contentIds
				}
				initialArea={form.values.action.kind === 'ASSIGN_PATH' ? null : area}
				onConfirm={(ids) => {
					if (form.values.action.kind === 'ASSIGN_PATH') {
						form.setFieldValue('action.pathId', ids[0] ?? null);
						form.clearFieldError('action.pathId');
					} else {
						form.setFieldValue('action.contentIds', ids);
						form.clearFieldError('action.contentIds');
					}
				}}
			/>
		</Stack>
	);
}

export const metricLabelOf = (metricId: RuleCondition['metricId']) =>
	METRIC_BY_ID[metricId];
