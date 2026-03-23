import {
	Button,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	Select,
	Checkbox,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import ToolFormRepeaterRow from '../ToolFormRepeaterRow';
import styles from '../ToolForm.module.css';
import { getMethodSupportsBody } from '../toolForm.utils';

interface ToolFormBodySectionProps {
	form: UseFormReturnType<FormValues>;
	propertyTypeOptions: { value: string; label: string }[];
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormBodySection({
	form,
	propertyTypeOptions,
	t,
}: ToolFormBodySectionProps) {
	const supportsBody = getMethodSupportsBody(form.values.method);

	return (
		<Stack gap='sm' className={styles.sectionStack}>
			<ToolFormSectionHeader
				title={t('body.title')}
				description={t('sections.bodyDesc')}
				eyebrow={t('form.sectionEyebrows.optional')}
				statusLabel={
					supportsBody
						? form.values.requestBodyProperties.length > 0
							? t('sectionStatus.configured')
							: t('form.sectionStatus.optional')
						: t('form.sectionStatus.inactive')
				}
				statusColor={
					supportsBody
						? form.values.requestBodyProperties.length > 0
							? 'green'
							: 'gray'
						: 'gray'
				}
			/>
			<Group justify='space-between' align='center'>
				<Text size='xs' c='dimmed'>
					{supportsBody
						? t('body.helper', { defaultValue: t('form.api.helper') })
						: t('body.disabledHint')}
				</Text>
				<Button
					variant='light'
					size='xs'
					leftSection={<IconPlus size={12} />}
					onClick={() =>
						form.insertListItem('requestBodyProperties', {
							key: '',
							type: 'string',
							description: '',
							constantValue: '',
							dynamicVariable: '',
							required: false,
						})
					}
					disabled={!supportsBody}
				>
					{t('body.add')}
				</Button>
			</Group>
			{!supportsBody && (
				<Paper withBorder radius='md' p='sm' className={styles.helperPanel}>
					<Text size='xs' c='dimmed'>
						{t('body.disabledHint')}
					</Text>
				</Paper>
			)}
			{form.values.requestBodyProperties.length === 0 ? (
				<div className={styles.emptyState}>
					<Stack gap={4} align='center'>
						<Text size='xs' c='dimmed' ta='center'>
							{t('body.empty')}
						</Text>
						<Button
							variant='light'
							size='xs'
							leftSection={<IconPlus size={12} />}
							onClick={() =>
								form.insertListItem('requestBodyProperties', {
									key: '',
									type: 'string',
									description: '',
									constantValue: '',
									dynamicVariable: '',
									required: false,
								})
							}
							disabled={!supportsBody}
						>
							{t('body.add')}
						</Button>
					</Stack>
				</div>
			) : (
				<div className={styles.parameterList}>
					{form.values.requestBodyProperties.map((property, index) => (
						<ToolFormRepeaterRow
							key={index}
							title={
								property.key ||
								t('body.rowTitle', {
									index: index + 1,
									defaultValue: `${t('body.title')} ${index + 1}`,
								})
							}
							description={t('sections.bodyDesc')}
							statusLabel={
								property.required ? t('body.required') : t('body.optional')
							}
							statusColor={property.required ? 'blue' : 'gray'}
							onRemove={() =>
								form.removeListItem('requestBodyProperties', index)
							}
							removeLabel={t('body.remove')}
						>
							<Group
								gap='sm'
								grow
								align='flex-start'
								wrap='nowrap'
								className={styles.repeaterRowFields}
							>
								<TextInput
									placeholder={t('body.fields.keyPlaceholder')}
									size='sm'
									classNames={{ input: styles.premiumInput }}
									{...form.getInputProps(`requestBodyProperties.${index}.key`)}
								/>
								<Select
									placeholder={t('body.fields.typePlaceholder')}
									data={propertyTypeOptions}
									size='sm'
									w={140}
									classNames={{ input: styles.premiumInput }}
									{...form.getInputProps(`requestBodyProperties.${index}.type`)}
								/>
							</Group>
							<Stack gap='xs' mt='sm'>
								<Textarea
									placeholder={t('body.fields.descriptionPlaceholder')}
									size='sm'
									minRows={2}
									classNames={{ input: styles.premiumTextarea }}
									{...form.getInputProps(
										`requestBodyProperties.${index}.description`
									)}
								/>
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
									<TextInput
										placeholder={t('body.fields.constantPlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(
											`requestBodyProperties.${index}.constantValue`
										)}
									/>
									<TextInput
										placeholder={t('body.fields.dynamicPlaceholder')}
										size='sm'
										classNames={{ input: styles.premiumInput }}
										{...form.getInputProps(
											`requestBodyProperties.${index}.dynamicVariable`
										)}
									/>
								</SimpleGrid>
								<Group justify='space-between' align='center'>
									<Checkbox
										label={t('body.required')}
										size='xs'
										{...form.getInputProps(
											`requestBodyProperties.${index}.required`,
											{ type: 'checkbox' }
										)}
									/>
									<Text size='xs' c='dimmed'>
										{t('body.advancedLabel', {
											defaultValue: t('sections.bodyDesc'),
										})}
									</Text>
								</Group>
							</Stack>
						</ToolFormRepeaterRow>
					))}
				</div>
			)}
		</Stack>
	);
}
