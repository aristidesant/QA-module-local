import { Select, SimpleGrid, Stack, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormValues } from '../toolForm.types';
import ToolFormSectionHeader from '../ToolFormSectionHeader/ToolFormSectionHeader';
import { CONFIG_TYPE_OPTIONS } from '../toolForm.utils';
import styles from '../ToolForm.module.css';

interface ToolFormBasicSectionProps {
	form: UseFormReturnType<FormValues>;
	categoryOptions: { value: string; label: string }[];
	isLoadingCategories: boolean;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormBasicSection({
	form,
	categoryOptions,
	isLoadingCategories,
	t,
}: ToolFormBasicSectionProps) {
	return (
		<Stack gap='sm' className={styles.sectionStack}>
			<ToolFormSectionHeader
				title={t('sections.basic')}
				description={t('sections.basicDesc')}
				eyebrow={t('form.sectionEyebrows.required')}
				statusLabel={
					form.values.name && form.values.categoryId
						? t('sectionStatus.configured')
						: t('sectionStatus.empty')
				}
				statusColor={
					form.values.name && form.values.categoryId ? 'green' : 'gray'
				}
			/>
			<TextInput
				label={t('form.fields.name.label')}
				placeholder={t('form.fields.name.placeholder')}
				required
				size='sm'
				classNames={{ input: styles.premiumInput }}
				{...form.getInputProps('name')}
			/>
			<Textarea
				label={t('form.fields.description.label')}
				placeholder={t('form.fields.description.placeholder')}
				required
				size='sm'
				minRows={2}
				classNames={{ input: styles.premiumTextarea }}
				{...form.getInputProps('description')}
			/>
			<Textarea
				label={t('form.fields.prompt.label')}
				placeholder={t('form.fields.prompt.placeholder')}
				required
				size='sm'
				minRows={3}
				classNames={{ input: styles.premiumTextarea }}
				{...form.getInputProps('prompt')}
			/>
			<SimpleGrid cols={{ base: 1, md: 3 }} spacing='sm'>
				<Select
					label={t('form.fields.configType.label')}
					placeholder={t('form.fields.configType.placeholder')}
					required
					size='sm'
					data={CONFIG_TYPE_OPTIONS.map((opt) => ({
						...opt,
						label: t(`form.configTypes.${opt.value}`, {
							defaultValue: opt.label,
						}),
					}))}
					classNames={{ input: styles.premiumInput }}
					{...form.getInputProps('configType')}
				/>
				<Select
					label={t('form.fields.category.label')}
					placeholder={t('form.fields.category.placeholder')}
					required
					size='sm'
					data={categoryOptions}
					disabled={isLoadingCategories}
					classNames={{ input: styles.premiumInput }}
					{...form.getInputProps('categoryId')}
				/>
				<Select
					label={t('form.fields.status.label')}
					size='sm'
					data={[
						{ value: 'active', label: t('status.active') },
						{ value: 'inactive', label: t('status.inactive') },
					]}
					{...form.getInputProps('status')}
				/>
			</SimpleGrid>
		</Stack>
	);
}
