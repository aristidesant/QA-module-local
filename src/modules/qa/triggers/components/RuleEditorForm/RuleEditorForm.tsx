import { Box, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import type { TriggerRule, RuleType } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	buildRuleFormValues,
	formValuesToRule,
	type RuleFormValues,
} from '~/modules/qa/triggers/helpers';
import { RULE_TYPE_META } from '~/modules/qa/triggers/constants';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { nextId } from '~/stores/qa/triggerRulesStore';
import { BasicsSection } from './sections/BasicsSection';
import { ConditionSection } from './sections/ConditionSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { ScopeSection } from './sections/ScopeSection';
import { DeliverySection } from './sections/DeliverySection';
import { MessageSection } from './sections/MessageSection';
import { FrequencySection } from './sections/FrequencySection';
import { RecognitionSection } from './sections/RecognitionSection';
import { PreviewPanel } from '~/modules/qa/triggers/components/PreviewPanel';
import classes from './RuleEditorForm.module.css';

interface RuleEditorFormProps {
	mode: 'create' | 'edit';
	type: RuleType;
	rule: TriggerRule | null;
	role: 'supervisor' | 'qaManager';
	/** Prefilled values for a new rule, for example the conditions of a badge. */
	preset?: Partial<RuleFormValues>;
	onClose: () => void;
	onSaved: (rule: TriggerRule) => void;
}

/** The trigger rule form, rendered on its own page: preview, eight sections and a pinned action bar. */
export function RuleEditorForm({
	mode,
	type,
	rule,
	role,
	preset,
	onClose,
	onSaved,
}: RuleEditorFormProps) {
	const { t } = useTranslation('qa.triggers');
	const addRule = useTriggerRulesStore((s) => s.addRule);
	const updateRule = useTriggerRulesStore((s) => s.updateRule);
	const templates = useTriggerRulesStore((s) => s.templates);

	const defaultSupervisorIds = role === 'supervisor' ? ['SUP-001'] : [];
	const meta = RULE_TYPE_META[type];
	const kind = meta.kind;

	const form = useForm<RuleFormValues>({
		initialValues: buildRuleFormValues(
			type,
			rule,
			templates,
			defaultSupervisorIds,
			preset
		),
		validate: {
			name: (value) => {
				if (!value) return t('editor.validation.nameRequired');
				if (value.length > 80)
					return t('editor.validation.nameMax', { count: 80 });
				return null;
			},
			conditions: (value) => {
				if (meta.hasConditions && value.length === 0) {
					return t('editor.validation.conditionRequired');
				}
				return null;
			},
			recipients: (value) =>
				value.length === 0 ? t('editor.validation.recipientsRequired') : null,
			channels: (value) =>
				value.length === 0 ? t('editor.validation.channelsRequired') : null,
			subject: (value) =>
				!value ? t('editor.validation.subjectRequired') : null,
			body: (value) => (!value ? t('editor.validation.bodyRequired') : null),
		},
	});

	/** DRAFT skips validation (create only); every other status validates first. */
	const handleSave = (status: TriggerRule['status']) => {
		if (status !== 'DRAFT') {
			const errors = form.validate();
			if (errors.hasErrors) return;

			// Validate RANGE values
			for (let i = 0; i < form.values.conditions.length; i++) {
				const cond = form.values.conditions[i];
				if (
					cond.mode === 'RANGE' &&
					cond.value2 !== null &&
					cond.value2 <= cond.value
				) {
					form.setFieldError(
						`conditions.${i}.value2`,
						t('editor.validation.rangeInvalid')
					);
					return;
				}
			}

			// Validate WEEKLY_SUMMARY time
			if (type === 'WEEKLY_SUMMARY' && !form.values.schedule.time) {
				form.setFieldError(
					'schedule.time',
					t('editor.validation.timeRequired')
				);
				return;
			}
		}

		const ruleId =
			mode === 'create' ? nextId(kind === 'ALERT' ? 'ALR' : 'REC') : rule!.id;
		const createdBy = role === 'supervisor' ? 'Maria García' : 'Laura Gómez';
		const createdByRole =
			role === 'supervisor' ? ('SUPERVISOR' as const) : ('QA_MANAGER' as const);

		const newRule = formValuesToRule(form.values, rule, {
			id: ruleId,
			createdBy,
			createdByRole,
			status,
		});

		if (mode === 'create') {
			addRule(newRule);
			notifySuccess(t('rules.notifications.created'));
		} else {
			updateRule(newRule);
			notifySuccess(t('rules.notifications.updated'));
		}

		onSaved(newRule);
	};

	const handleClose = () => {
		if (form.isDirty()) {
			modals.openConfirmModal({
				title: t('editor.discard'),
				children: t('editor.discardDescription'),
				labels: {
					confirm: t('editor.discardConfirm'),
					cancel: t('common.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: () => onClose(),
			});
		} else {
			onClose();
		}
	};

	return (
		<Stack gap='md'>
			<PreviewPanel
				values={{
					type: form.values.type,
					conditions: form.values.conditions,
					conditionLogic: form.values.conditionLogic,
					scope: form.values.scope,
				}}
			/>

			<BasicsSection
				form={form}
				type={form.values.type}
				kind={kind}
				templates={templates}
				defaultSupervisorIds={defaultSupervisorIds}
			/>

			{type === 'WEEKLY_SUMMARY' ? (
				<ScheduleSection form={form} />
			) : (
				<ConditionSection form={form} type={form.values.type} />
			)}

			<ScopeSection form={form} role={role} />
			<DeliverySection form={form} kind={kind} />
			<MessageSection form={form} type={form.values.type} />
			<FrequencySection form={form} />

			{kind === 'RECOGNITION' && <RecognitionSection form={form} />}

			{/* Pinned to the viewport so the actions stay in reach on this long form. */}
			<Box className={classes.stickyActions}>
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleClose}>
						{t('common.cancel')}
					</Button>

					{mode === 'create' ? (
						<>
							<Button variant='light' onClick={() => handleSave('DRAFT')}>
								{t('editor.footer.saveDraft')}
							</Button>
							<Button onClick={() => handleSave('ACTIVE')}>
								{t('editor.footer.saveActivate')}
							</Button>
						</>
					) : (
						<Button onClick={() => handleSave(rule?.status ?? 'ACTIVE')}>
							{t('editor.footer.save')}
						</Button>
					)}
				</Group>
			</Box>
		</Stack>
	);
}
