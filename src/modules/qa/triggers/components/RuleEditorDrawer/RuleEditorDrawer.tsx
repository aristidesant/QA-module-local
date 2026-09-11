import { Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TriggerRule, RuleType } from '~/models/qa';
import { AppDrawer } from '~/components/AppDrawer';
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
import classes from './RuleEditorDrawer.module.css';

interface RuleEditorDrawerProps {
	opened: boolean;
	mode: 'create' | 'edit';
	type: RuleType;
	rule: TriggerRule | null;
	onClose: () => void;
	onSaved: (rule: TriggerRule) => void;
	role: 'supervisor' | 'qaManager';
}

export function RuleEditorDrawer({
	opened,
	mode,
	type,
	rule,
	onClose,
	onSaved,
	role,
}: RuleEditorDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const addRule = useTriggerRulesStore((s) => s.addRule);
	const updateRule = useTriggerRulesStore((s) => s.updateRule);
	const templates = useTriggerRulesStore((s) => s.templates);

	const defaultSupervisorIds = role === 'supervisor' ? ['SUP-001'] : [];
	const meta = RULE_TYPE_META[type];
	const kind = meta.kind;

	const form = useForm<RuleFormValues>({
		mode: 'uncontrolled',
		initialValues: buildRuleFormValues(type, rule, templates, defaultSupervisorIds),
		validate: {
			name: (value) => {
				if (!value) return t('editor.validation.nameRequired');
				if (value.length > 80) return t('editor.validation.nameMax', { count: 80 });
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
			body: (value) =>
				!value ? t('editor.validation.bodyRequired') : null,
		},
	});

	// Re-initialize form when opened/rule/type changes
	useEffect(() => {
		if (opened) {
			const initialValues = buildRuleFormValues(
				type,
				rule,
				templates,
				defaultSupervisorIds
			);
			form.setValues(initialValues);
			form.resetDirty();
		}
	}, [opened, rule?.id, type]);

	const handleSave = () => {
		const errors = form.validate();
		if (errors.hasErrors) return;

		// Validate RANGE values
		for (let i = 0; i < form.values.conditions.length; i++) {
			const cond = form.values.conditions[i];
			if (cond.mode === 'RANGE' && cond.value2 !== null && cond.value2 <= cond.value) {
				form.setFieldError(`conditions.${i}.value2`, t('editor.validation.rangeInvalid'));
				return;
			}
		}

		// Validate WEEKLY_SUMMARY time
		if (type === 'WEEKLY_SUMMARY' && !form.values.schedule.time) {
			form.setFieldError('schedule.time', t('editor.validation.timeRequired'));
			return;
		}

		const ruleId = mode === 'create' ? nextId(kind === 'ALERT' ? 'ALR' : 'REC') : rule!.id;
		const createdBy = role === 'supervisor' ? 'Maria García' : 'Laura Gómez';
		const createdByRole = role === 'supervisor' ? 'SUPERVISOR' as const : 'QA_MANAGER' as const;

		const newRule = formValuesToRule(form.values, rule, {
			id: ruleId,
			createdBy,
			createdByRole,
			status: mode === 'create' ? 'ACTIVE' : rule!.status,
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
				title: t('common.cancel'),
				children: 'Are you sure you want to discard your changes?',
				labels: { confirm: t('common.cancel'), cancel: t('common.close') },
				confirmProps: { color: 'red' },
				onConfirm: () => onClose(),
			});
		} else {
			onClose();
		}
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={handleClose}
			size='xl'
			position='right'
			title={
				mode === 'create'
					? t('editor.createTitle', { type: t(`types.${type}.label`) })
					: t('editor.editTitle')
			}
			icon={<meta.icon size={18} />}
			iconColor={meta.color}
			classNames={{ body: classes.body }}
		>
			<Stack gap='md' className={classes.container}>
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

				{kind === 'RECOGNITION' && (
					<RecognitionSection form={form} />
				)}

				<div className={classes.footer}>
					<Group justify='flex-end'>
						<Button variant='subtle' onClick={handleClose}>
							{t('common.cancel')}
						</Button>

						{mode === 'create' ? (
							<>
								<Button
									variant='light'
									onClick={() => {
										const ruleId = nextId(kind === 'ALERT' ? 'ALR' : 'REC');
										const createdBy = role === 'supervisor' ? 'Maria García' : 'Laura Gómez';
										const createdByRole = role === 'supervisor' ? 'SUPERVISOR' as const : 'QA_MANAGER' as const;

										const newRule = formValuesToRule(form.values, null, {
											id: ruleId,
											createdBy,
											createdByRole,
											status: 'DRAFT',
										});

										addRule(newRule);
										notifySuccess(t('rules.notifications.created'));
										onSaved(newRule);
									}}
								>
									{t('editor.footer.saveDraft')}
								</Button>
								<Button onClick={handleSave}>
									{t('editor.footer.saveActivate')}
								</Button>
							</>
						) : (
							<Button onClick={handleSave}>
								{t('editor.footer.save')}
							</Button>
						)}
					</Group>
				</div>
			</Stack>
		</AppDrawer>
	);
}
