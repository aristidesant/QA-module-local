import { Button, Group, Paper, Select, Stack, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { MessageTemplate, TemplateCategory } from '~/models/qa';
import { interpolateTemplate } from '~/modules/qa/triggers/helpers';
import { nextId, useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { NOW_ISO } from '~/modules/qa/triggers/mockData';
import AppDrawer from '~/components/AppDrawer';
import { VariableChips } from '~/modules/qa/triggers/components/VariableChips';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './TemplateEditorDrawer.module.css';

interface TemplateFormValues {
	name: string;
	category: TemplateCategory;
	subject: string;
	body: string;
}

interface TemplateEditorDrawerProps {
	opened: boolean;
	template: MessageTemplate | null;
	onClose: () => void;
	onSaved: (template: MessageTemplate) => void;
}

export default function TemplateEditorDrawer({ opened, template, onClose, onSaved }: TemplateEditorDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const addTemplate = useTriggerRulesStore((s) => s.addTemplate);
	const updateTemplate = useTriggerRulesStore((s) => s.updateTemplate);

	const isCreate = !template;
	const categoryOptions: TemplateCategory[] = ['ALERT', 'RECOGNITION', 'SUMMARY'];

	const form = useForm<TemplateFormValues>({
		initialValues: {
			name: template?.name ?? '',
			category: template?.category ?? 'ALERT',
			subject: template?.subject ?? '',
			body: template?.body ?? '',
		},
		validate: {
			name: (value) => (!value ? t('templates.editor.validation.nameRequired') : null),
			subject: (value) => (!value ? t('templates.editor.validation.subjectRequired') : null),
			body: (value) => (!value ? t('templates.editor.validation.bodyRequired') : null),
		},
	});

	const handleCancel = () => {
		form.reset();
		onClose();
	};

	const handleVariableInsert = (variable: string) => {
		const current = form.values.body;
		const updated =
			current + (current.endsWith(' ') || !current ? '' : ' ') +
			`{{${variable}}}`;
		form.setFieldValue('body', updated);
	};

	const handleSave = async () => {
		if (!form.validate().hasErrors) {
			const newTemplate: MessageTemplate = isCreate
				? {
						id: nextId('TPL'),
						name: form.values.name,
						category: form.values.category,
						subject: form.values.subject,
						body: form.values.body,
						isDefault: false,
						usageCount: 0,
						updatedAt: NOW_ISO,
					}
				: {
						...template!,
						name: form.values.name,
						category: form.values.category,
						subject: form.values.subject,
						body: form.values.body,
						updatedAt: NOW_ISO,
					};

			if (isCreate) {
				addTemplate(newTemplate);
				notifySuccess(t('templates.notifications.created'));
			} else {
				updateTemplate(newTemplate);
				notifySuccess(t('templates.notifications.updated'));
			}

			onSaved(newTemplate);
			form.reset();
			onClose();
		}
	};

	const preview = {
		subject: interpolateTemplate(form.values.subject),
		body: interpolateTemplate(form.values.body),
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={handleCancel}
			title={isCreate ? t('templates.editor.createTitle') : t('templates.editor.editTitle')}
			size='lg'
			position='right'
		>
			<Stack gap='md' className={classes.body}>
				<TextInput
					label={t('templates.editor.fields.name')}
					placeholder={t('templates.editor.fields.name')}
					{...form.getInputProps('name')}
				/>

				<Select
					label={t('templates.editor.fields.category')}
					data={categoryOptions.map((cat) => ({
						label: t(`templateCategories.${cat}`),
						value: cat,
					}))}
					value={form.values.category}
					onChange={(value) => value && form.setFieldValue('category', value as TemplateCategory)}
				/>

				<TextInput
					label={t('templates.editor.fields.subject')}
					{...form.getInputProps('subject')}
				/>

				<Textarea
					label={t('templates.editor.fields.body')}
					minRows={6}
					autosize
					mt='md'
					{...form.getInputProps('body')}
				/>

				<VariableChips onInsert={handleVariableInsert} />

				<Switch
					label={t('templates.editor.preview')}
					checked={form.values.subject !== '' || form.values.body !== ''}
					disabled
				/>

				{(form.values.subject !== '' || form.values.body !== '') && (
					<Paper withBorder p='sm' radius='md' className={classes.preview}>
						<Stack gap='xs'>
							<Text size='sm' fw={600}>
								{preview.subject}
							</Text>
							<Text size='sm'>{preview.body}</Text>
						</Stack>
					</Paper>
				)}
			</Stack>

			<Group justify='flex-end' gap='xs' className={classes.footer}>
				<Button variant='subtle' onClick={handleCancel}>
					{t('common.cancel')}
				</Button>
				<Button onClick={handleSave}>
					{t('common.save')}
				</Button>
			</Group>
		</AppDrawer>
	);
}
