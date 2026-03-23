import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import ToolFormRepeaterRow from '../ToolFormRepeaterRow';
import styles from '../ToolForm.module.css';

interface ToolFormHeadersSectionProps {
	form: UseFormReturnType<FormValues>;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormHeadersSection({
	form,
	t,
}: ToolFormHeadersSectionProps) {
	return (
		<Stack gap='sm' className={styles.sectionStack}>
			<ToolFormSectionHeader
				title={t('headers.title')}
				description={t('sections.headersDesc')}
				eyebrow={t('form.sectionEyebrows.optional')}
				statusLabel={
					form.values.headers.length > 0
						? t('sectionStatus.configured')
						: t('form.sectionStatus.optional')
				}
				statusColor={form.values.headers.length > 0 ? 'green' : 'gray'}
			/>
			{form.values.headers.length === 0 ? (
				<div className={styles.emptyState}>
					<Stack gap={4} align='center'>
						<Text size='xs' fw={600} ta='center'>
							{t('headers.empty')}
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							{t('sections.headersDesc')}
						</Text>
						<Button
							variant='light'
							size='xs'
							leftSection={<IconPlus size={12} />}
							onClick={() =>
								form.insertListItem('headers', { key: '', value: '' })
							}
						>
							{t('headers.add')}
						</Button>
					</Stack>
				</div>
			) : (
				<div className={styles.parameterList}>
					{form.values.headers.map((header, index) => (
						<ToolFormRepeaterRow
							key={index}
							title={t('headers.rowTitle', {
								index: index + 1,
								defaultValue: `${t('headers.title')} ${index + 1}`,
							})}
							description={header.key || t('sections.headersDesc')}
							onRemove={() => form.removeListItem('headers', index)}
							removeLabel={t('headers.remove')}
						>
							<Group
								gap='sm'
								grow
								align='flex-start'
								wrap='nowrap'
								className={styles.repeaterRowFields}
							>
								<TextInput
									placeholder={t('headers.fields.keyPlaceholder')}
									size='sm'
									classNames={{ input: styles.premiumInput }}
									{...form.getInputProps(`headers.${index}.key`)}
								/>
								<TextInput
									placeholder={t('headers.fields.valuePlaceholder')}
									size='sm'
									classNames={{ input: styles.premiumInput }}
									{...form.getInputProps(`headers.${index}.value`)}
								/>
							</Group>
						</ToolFormRepeaterRow>
					))}
				</div>
			)}
		</Stack>
	);
}
