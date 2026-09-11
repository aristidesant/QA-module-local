import { Grid, SegmentedControl, Select, Stack, Text, Textarea, TextInput, ThemeIcon, Paper } from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { buildRuleFormValues, ruleTypesForKind, type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';
import type { RuleType, MessageTemplate } from '~/models/qa';

interface BasicsSectionProps {
	form: UseFormReturnType<RuleFormValues>;
	type: RuleType;
	kind: 'ALERT' | 'RECOGNITION';
	templates: MessageTemplate[];
	defaultSupervisorIds: string[];
}

export function BasicsSection({
	form,
	type,
	kind,
	templates,
	defaultSupervisorIds,
}: BasicsSectionProps) {
	const { t } = useTranslation('qa.triggers');

	const typeOptions = ruleTypesForKind(kind).map((ruleType) => ({
		label: t(`types.${ruleType}.label`),
		value: ruleType,
	}));

	const severityOptions = ['INFO', 'WARNING', 'CRITICAL'] as const;

	const handleTypeChange = (newType: string) => {
		const newFormValues = buildRuleFormValues(
			newType as RuleType,
			null,
			templates,
			defaultSupervisorIds
		);
		form.setFieldValue('type', newType as RuleType);
		form.setFieldValue('conditions', newFormValues.conditions);
		form.setFieldValue('severity', newFormValues.severity);
		form.setFieldValue('conditionLogic', 'ALL');
	};

	return (
		<SectionCard title={t('editor.sections.basics')}>
			<TextInput
				label={t('editor.fields.name')}
				placeholder={t('editor.fields.namePlaceholder')}
				{...form.getInputProps('name')}
			/>

			<Textarea
				label={t('editor.fields.description')}
				minRows={2}
				autosize
				{...form.getInputProps('description')}
				mt='md'
			/>

			<Grid mt='md'>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Select
						label={t('editor.fields.type')}
						data={typeOptions}
						value={form.values.type}
						onChange={(v) => v && handleTypeChange(v)}
						searchable
					/>
				</Grid.Col>

				{kind === 'ALERT' && (
					<Grid.Col span={{ base: 12, md: 6 }}>
						<Stack gap='xs'>
							<Text size='sm' fw={500}>{t('editor.fields.severity')}</Text>
							<SegmentedControl
								data={severityOptions.map((s) => ({
									label: t(`severity.${s}`),
									value: s,
								}))}
								value={form.values.severity}
								onChange={(v) => form.setFieldValue('severity', v as any)}
								fullWidth
							/>
						</Stack>
					</Grid.Col>
				)}
			</Grid>

			{type === 'BURNOUT_RISK' && (
				<Stack gap='md' mt='md'>
					<Select
						label={t('editor.fields.burnoutLevel')}
						data={['LOW', 'MEDIUM', 'HIGH'].map((level) => ({
							label: t(`burnoutLevels.${level}`),
							value: level,
						}))}
						value={form.values.burnoutLevel}
						onChange={(v) => v && form.setFieldValue('burnoutLevel', v as any)}
					/>
					<Paper withBorder p='sm' radius='md' bg='red.0'>
						<Stack gap='xs'>
							<div style={{ display: 'flex', gap: 'var(--mantine-spacing-xs)', alignItems: 'flex-start' }}>
								<ThemeIcon size='md' color='red' variant='light' radius='md'>
									<IconFlame size={14} />
								</ThemeIcon>
								<Stack gap={0}>
									<Text size='sm' fw={600}>{t('editor.burnoutNotice.title')}</Text>
									<Text size='xs' c='dimmed'>{t('editor.burnoutNotice.description')}</Text>
								</Stack>
							</div>
						</Stack>
					</Paper>
				</Stack>
			)}
		</SectionCard>
	);
}
