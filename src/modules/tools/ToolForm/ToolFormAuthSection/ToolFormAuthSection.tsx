import { Stack, Text, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import styles from '../ToolForm.module.css';

interface ToolFormAuthSectionProps {
	form: UseFormReturnType<FormValues>;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormAuthSection({
	form,
	t,
}: ToolFormAuthSectionProps) {
	return (
		<Stack gap='sm' className={styles.sectionStack}>
			<ToolFormSectionHeader
				title={t('sections.auth')}
				description={t('sections.authDesc')}
				eyebrow={t('form.sectionEyebrows.optional')}
				statusLabel={
					form.values.authConnection
						? t('sectionStatus.configured')
						: t('form.sectionStatus.optional')
				}
				statusColor={form.values.authConnection ? 'green' : 'gray'}
			/>
			<Text size='xs' c='dimmed'>
				{t('form.auth.helper')}
			</Text>
			<TextInput
				label={t('form.fields.authConnection.label')}
				placeholder={t('form.fields.authConnection.placeholder')}
				size='sm'
				classNames={{ input: styles.premiumInput }}
				{...form.getInputProps('authConnection')}
			/>
		</Stack>
	);
}
