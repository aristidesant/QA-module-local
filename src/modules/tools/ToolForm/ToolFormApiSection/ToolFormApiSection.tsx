import { Divider, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import { HTTP_METHODS } from '../toolForm.utils';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import styles from '../ToolForm.module.css';

interface ToolFormApiSectionProps {
	form: UseFormReturnType<FormValues>;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormApiSection({
	form,
	t,
}: ToolFormApiSectionProps) {
	return (
		<Stack gap='sm' className={styles.sectionStack}>
			<ToolFormSectionHeader
				title={t('sections.api')}
				description={t('sections.apiDesc')}
				eyebrow={t('form.sectionEyebrows.required')}
				statusLabel={
					form.values.url && form.values.method
						? t('sectionStatus.configured')
						: t('sectionStatus.empty')
				}
				statusColor={form.values.url && form.values.method ? 'green' : 'gray'}
			/>
			<Group gap='sm' align='flex-start' grow className={styles.primaryGroup}>
				<Select
					label={t('form.fields.method.label')}
					data={HTTP_METHODS}
					size='sm'
					w={160}
					classNames={{ input: styles.premiumInput }}
					{...form.getInputProps('method')}
				/>
				<TextInput
					label={t('form.fields.url.label')}
					placeholder={t('form.fields.url.placeholder')}
					required
					size='sm'
					classNames={{ input: styles.premiumInput }}
					{...form.getInputProps('url')}
				/>
			</Group>
			<Text size='xs' c='dimmed'>
				{t('form.api.helper')}
			</Text>
			<Divider />
			<Stack gap='xs'>
				<Text size='xs' fw={700} tt='uppercase' c='dimmed'>
					{t('form.advanced.title')}
				</Text>
				<Group grow gap='sm'>
					<TextInput
						label={t('form.fields.timeout.label')}
						type='number'
						size='sm'
						classNames={{ input: styles.premiumInput }}
						{...form.getInputProps('responseTimeoutSecs')}
					/>
					<TextInput
						label={t('form.fields.identifier.label')}
						placeholder={t('form.fields.identifier.placeholder')}
						size='sm'
						classNames={{ input: styles.premiumInput }}
						{...form.getInputProps('identifier')}
					/>
				</Group>
			</Stack>
		</Stack>
	);
}
