import { useEffect, useMemo, useRef } from 'react';
import {
	Button,
	Group,
	MultiSelect,
	NumberInput,
	Select,
	Stack,
	Switch,
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
import { ConditionRow } from '~/modules/qa/triggers/components/ConditionRow';
import {
	CAMPAIGN_TYPES,
	LINES_OF_BUSINESS,
	METRIC_BY_ID,
	TRIGGER_METRIC_CATALOG,
} from '~/modules/qa/triggers/constants';
import { TRIGGER_CAMPAIGNS } from '~/modules/qa/triggers/mockData';
import { useLmsStore, selectContent, selectPaths } from '~/stores/qa/lmsStore';
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
	showAllContent: boolean;
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
			showAllContent: false,
		},
	});

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
				showAllContent: false,
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
				showAllContent: false,
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

	const contentOptions = useMemo(() => {
		const pool = content.filter(
			(c) =>
				c.status === 'PUBLISHED' &&
				(form.values.showAllContent || c.area === area)
		);
		return pool.map((c) => ({
			value: c.id,
			label: `${c.title} · ${t(`formats.${c.format}`, { ns: 'qa.lms' })} · ${c.durationMin} min`,
		}));
	}, [content, form.values.showAllContent, area, t]);

	const validate = (): string | null => {
		if (!form.values.name.trim()) return t('rules.editor.validation.name');
		if (form.values.conditions.length === 0)
			return t('rules.editor.validation.condition');
		if (
			form.values.action.kind === 'ASSIGN_CONTENT' &&
			form.values.action.contentIds.length === 0
		) {
			return t('rules.editor.validation.content');
		}
		if (
			form.values.action.kind === 'ASSIGN_PATH' &&
			!form.values.action.pathId
		) {
			return t('rules.editor.validation.path');
		}
		if (form.values.action.dueInDays < 1 || form.values.action.dueInDays > 90) {
			return t('rules.editor.validation.due');
		}
		return null;
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
		const error = validate();
		if (error) {
			notifyWarning(error);
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
						value={form.values.name}
						onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
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

			<SectionCard
				title={t('rules.editor.sections.condition')}
				description={t('rules.editor.sections.conditionDescription')}
				padding='md'
			>
				<Stack gap='md'>
					{form.values.conditions.length > 1 && (
						<AppSegmentedControl
							size='xs'
							value={form.values.conditionLogic}
							onChange={(v) =>
								form.setFieldValue('conditionLogic', v as ConditionLogic)
							}
							data={[
								{ label: 'ALL', value: 'ALL' },
								{ label: 'ANY', value: 'ANY' },
							]}
						/>
					)}
					{form.values.conditions.map((condition, index) => (
						<ConditionRow
							key={condition.id}
							condition={condition}
							scoreOnlyAreas={['SENTIMENT_EMOTION']}
							allowedModes={[
								'THRESHOLD',
								'RANGE',
								'PERCENT_CHANGE',
								'CONSECUTIVE',
							]}
							onChange={(updated) =>
								form.setFieldValue(`conditions.${index}`, updated)
							}
							onRemove={() => form.removeListItem('conditions', index)}
							canRemove={form.values.conditions.length > 1}
						/>
					))}
					<Button
						variant='light'
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={addCondition}
						disabled={form.values.conditions.length >= MAX_RULE_CONDITIONS}
					>
						{t('rules.editor.fields.addCondition')}
					</Button>
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

					{form.values.action.kind === 'ASSIGN_CONTENT' ? (
						<>
							<MultiSelect
								label={t('rules.editor.fields.content')}
								data={contentOptions}
								value={form.values.action.contentIds}
								onChange={(v) => form.setFieldValue('action.contentIds', v)}
								searchable
								clearable
							/>
							<Switch
								size='xs'
								label={t('rules.editor.fields.showAllContent')}
								checked={form.values.showAllContent}
								onChange={(e) =>
									form.setFieldValue('showAllContent', e.currentTarget.checked)
								}
							/>
						</>
					) : (
						<Select
							label={t('rules.editor.fields.path')}
							data={paths
								.filter((p) => p.status === 'PUBLISHED')
								.map((p) => ({ value: p.id, label: p.title }))}
							value={form.values.action.pathId}
							onChange={(v) => form.setFieldValue('action.pathId', v)}
						/>
					)}

					<NumberInput
						label={t('rules.editor.fields.dueInDays')}
						min={1}
						max={90}
						value={form.values.action.dueInDays}
						onChange={(v) =>
							form.setFieldValue(
								'action.dueInDays',
								typeof v === 'number' ? v : 14
							)
						}
					/>

					<Switch
						label={t('rules.editor.fields.mandatory')}
						checked={form.values.action.mandatory}
						onChange={(e) =>
							form.setFieldValue('action.mandatory', e.currentTarget.checked)
						}
					/>
					<Switch
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
			</SectionCard>

			<SectionCard
				title={t('rules.editor.sections.recurrence')}
				description={t('rules.editor.sections.recurrenceDescription')}
				padding='md'
			>
				<Stack gap='sm'>
					<NumberInput
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

			<SectionCard title={t('rules.editor.sections.scope')} padding='md'>
				<Stack gap='sm'>
					<MultiSelect
						label={t('rules.editor.scope.lob')}
						placeholder={t('rules.editor.scope.everyone')}
						data={LINES_OF_BUSINESS}
						value={form.values.scope.linesOfBusiness}
						onChange={(v) => form.setFieldValue('scope.linesOfBusiness', v)}
						clearable
					/>
					<MultiSelect
						label='Campaign type'
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
				</Stack>
			</SectionCard>

			<Group justify='flex-end'>
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
		</Stack>
	);
}

export const metricLabelOf = (metricId: RuleCondition['metricId']) =>
	METRIC_BY_ID[metricId];
