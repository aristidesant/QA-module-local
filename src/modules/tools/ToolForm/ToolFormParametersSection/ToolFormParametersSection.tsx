import { Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import ToolFormRepeaterRow from '../ToolFormRepeaterRow';
import styles from '../ToolForm.module.css';

interface ToolFormParametersSectionProps {
	form: UseFormReturnType<FormValues>;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormParametersSection({
	form,
	t,
}: ToolFormParametersSectionProps) {
	return (
		<Stack gap='md' className={styles.sectionStack}>
			<Stack gap='sm'>
				<ToolFormSectionHeader
					title={t('parameters.path.title')}
					description={t('sections.parametersDesc')}
					eyebrow={t('form.sectionEyebrows.optional')}
					statusLabel={
						form.values.pathParameters.length > 0
							? t('sectionStatus.configured')
							: t('form.sectionStatus.optional')
					}
					statusColor={form.values.pathParameters.length > 0 ? 'green' : 'gray'}
				/>
				{form.values.pathParameters.length === 0 ? (
					<div className={styles.emptyState}>
						<Stack gap={4} align='center'>
							<Text size='xs' c='dimmed' ta='center'>
								{t('parameters.path.empty')}
							</Text>
							<Text size='xs' c='dimmed' ta='center'>
								{t('parameters.path.helper', {
									defaultValue: t('sections.parametersDesc'),
								})}
							</Text>
							<Button
								variant='light'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={() =>
									form.insertListItem('pathParameters', { key: '', value: '' })
								}
							>
								{t('parameters.add')}
							</Button>
						</Stack>
					</div>
				) : (
					<div className={styles.parameterList}>
						{form.values.pathParameters.map((param, index) => (
							<ToolFormRepeaterRow
								key={index}
								title={t('parameters.path.rowTitle', {
									index: index + 1,
									defaultValue: `${t('parameters.path.title')} ${index + 1}`,
								})}
								description={
									param.key ||
									t('parameters.path.helper', {
										defaultValue: t('sections.parametersDesc'),
									})
								}
								onRemove={() => form.removeListItem('pathParameters', index)}
								removeLabel={t('parameters.remove')}
								compact
							>
								<Group
									gap='sm'
									grow
									align='flex-start'
									wrap='nowrap'
									className={styles.repeaterRowFields}
								>
									<TextInput
										placeholder={t('parameters.path.fields.keyPlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(`pathParameters.${index}.key`)}
									/>
									<TextInput
										placeholder={t('parameters.path.fields.valuePlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(`pathParameters.${index}.value`)}
									/>
								</Group>
							</ToolFormRepeaterRow>
						))}
					</div>
				)}
			</Stack>

			<Divider />

			<Stack gap='xs'>
				<ToolFormSectionHeader
					title={t('parameters.query.title')}
					description={t('sections.parametersDesc')}
					eyebrow={t('form.sectionEyebrows.optional')}
					statusLabel={
						form.values.queryParameters.length > 0
							? t('sectionStatus.configured')
							: t('form.sectionStatus.optional')
					}
					statusColor={
						form.values.queryParameters.length > 0 ? 'green' : 'gray'
					}
				/>
				{form.values.queryParameters.length === 0 ? (
					<div className={styles.emptyState}>
						<Stack gap={4} align='center'>
							<Text size='xs' c='dimmed' ta='center'>
								{t('parameters.query.empty')}
							</Text>
							<Text size='xs' c='dimmed' ta='center'>
								{t('parameters.query.helper', {
									defaultValue: t('sections.parametersDesc'),
								})}
							</Text>
							<Button
								variant='light'
								size='xs'
								leftSection={<IconPlus size={12} />}
								onClick={() =>
									form.insertListItem('queryParameters', { key: '', value: '' })
								}
							>
								{t('parameters.add')}
							</Button>
						</Stack>
					</div>
				) : (
					<div className={styles.parameterList}>
						{form.values.queryParameters.map((param, index) => (
							<ToolFormRepeaterRow
								key={index}
								title={t('parameters.query.rowTitle', {
									index: index + 1,
									defaultValue: `${t('parameters.query.title')} ${index + 1}`,
								})}
								description={
									param.key ||
									t('parameters.query.helper', {
										defaultValue: t('sections.parametersDesc'),
									})
								}
								onRemove={() => form.removeListItem('queryParameters', index)}
								removeLabel={t('parameters.remove')}
								compact
							>
								<Group
									gap='sm'
									grow
									align='flex-start'
									wrap='nowrap'
									className={styles.repeaterRowFields}
								>
									<TextInput
										placeholder={t('parameters.query.fields.keyPlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(`queryParameters.${index}.key`)}
									/>
									<TextInput
										placeholder={t('parameters.query.fields.valuePlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(`queryParameters.${index}.value`)}
									/>
								</Group>
							</ToolFormRepeaterRow>
						))}
					</div>
				)}
			</Stack>
		</Stack>
	);
}
