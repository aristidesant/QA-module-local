import { Paper, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import {
	interpolateTemplate,
	type RuleFormValues,
} from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';
import { VariableChips } from '~/modules/qa/triggers/components/VariableChips';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

interface MessageSectionProps {
	form: UseFormReturnType<RuleFormValues>;
	type: string;
}

export function MessageSection({ form, type }: MessageSectionProps) {
	const { t } = useTranslation('qa.triggers');
	const templates = useTriggerRulesStore((s) => s.templates);

	const category = type === 'WEEKLY_SUMMARY'
		? 'SUMMARY'
		: type.startsWith('RECOGNITION')
			? 'RECOGNITION'
			: 'ALERT';

	const templateOptions = templates
		.filter((tpl) => tpl.category === category)
		.map((tpl) => ({
			label: tpl.name,
			value: tpl.id,
		}));

	const handleTemplateChange = (templateId: string | null) => {
		if (!templateId) {
			form.setFieldValue('templateId', null);
			return;
		}

		const template = templates.find((t) => t.id === templateId);
		if (template) {
			form.setFieldValue('templateId', template.id);
			form.setFieldValue('subject', template.subject);
			form.setFieldValue('body', template.body);
		}
	};

	const handleVariableInsert = (variable: string) => {
		const current = form.values.body;
		const updated =
			current + (current.endsWith(' ') || !current ? '' : ' ') +
			`{{${variable}}}`;
		form.setFieldValue('body', updated);
	};

	const preview = {
		subject: interpolateTemplate(form.values.subject),
		body: interpolateTemplate(form.values.body),
	};

	return (
		<SectionCard title={t('editor.sections.message')}>
			<Select
				label={t('editor.fields.template')}
				placeholder={t('editor.fields.templatePlaceholder')}
				data={templateOptions}
				value={form.values.templateId}
				onChange={handleTemplateChange}
				clearable
				searchable
			/>

			<TextInput
				label={t('editor.fields.subject')}
				mt='md'
				{...form.getInputProps('subject')}
			/>

			<Textarea
				label={t('editor.fields.body')}
				minRows={4}
				autosize
				mt='md'
				{...form.getInputProps('body')}
			/>

			<VariableChips onInsert={handleVariableInsert} />

			<Paper withBorder p='sm' radius='md' mt='md'>
				<Stack gap='xs'>
					<Text size='sm' fw={600}>
						{preview.subject}
					</Text>
					<Text size='sm'>{preview.body}</Text>
					<Text size='xs' c='dimmed'>
						{t('editor.preview.messagePreview')}
					</Text>
				</Stack>
			</Paper>
		</SectionCard>
	);
}
