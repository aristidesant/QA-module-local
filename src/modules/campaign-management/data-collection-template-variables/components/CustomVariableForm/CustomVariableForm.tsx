import {
	Button,
	Group,
	Select,
	SimpleGrid,
	Stack,
	TagsInput,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import type {
	CustomVariable,
	CustomVariableValue,
} from '~/models/CustomVariableModel';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import {
	useCreateTemplateVariable,
	useUpdateTemplateVariable,
} from '~/queries/customVariableTemplatesQueries';
import styles from './CustomVariableForm.module.css';

interface CustomVariableFormProps {
	templateId: number;
	variable?: CustomVariable;
	onSuccess: () => void;
	onCancel: () => void;
}

type CustomVariableFormValues = {
	label: string;
	categoryId: string | null;
	type: string;
	description: string;
	enumValues: string[];
};

const DEFAULT_VALUE_TYPE = 'llm_type';

const toIdentifier = (label: string): string => {
	return label
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');
};

const mapValueToForm = (
	value?: CustomVariableValue
): Omit<CustomVariableFormValues, 'label' | 'categoryId'> => ({
	type: value?.type || 'string',
	description: value?.description || '',
	enumValues: value?.enum || [],
});

const mapFormToValue = (
	values: CustomVariableFormValues
): CustomVariableValue => ({
	type: values.type,
	description: values.description || undefined,
	enum:
		values.type === 'string' && values.enumValues.length > 0
			? values.enumValues
			: undefined,
	is_system_provided: false,
	dynamic_variable: '',
	constant_value: '',
	value_type: DEFAULT_VALUE_TYPE,
});

export default function CustomVariableForm({
	templateId,
	variable,
	onSuccess,
	onCancel,
}: CustomVariableFormProps) {
	const { t } = useTranslation('campaign-management');
	const { canPerformAction } = usePermissions();
	const createVariable = useCreateTemplateVariable();
	const updateVariable = useUpdateTemplateVariable();
	const [categorySearch, setCategorySearch] = useState('');
	const { data: categoriesResponse } = useGetCampaignCategories({
		limit: 10,
		offset: 0,
		active: true,
		...(categorySearch.trim() ? { name: categorySearch.trim() } : {}),
	});

	const isEditing = Boolean(variable);
	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canEdit = canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.UPDATE);
	const isAllowed = isEditing ? canEdit : canCreate;

	const categoryOptions = useMemo(
		() =>
			(categoriesResponse?.data || []).map((category) => ({
				value: String(category.id),
				label: category.name,
			})),
		[categoriesResponse?.data]
	);

	const form = useForm<CustomVariableFormValues>({
		initialValues: {
			label: variable?.label || variable?.name || '',
			categoryId: variable?.categoryId ? String(variable.categoryId) : null,
			...mapValueToForm(variable?.value),
		},
		validate: {
			label: (value) => {
				if (value.trim().length === 0) {
					return t('customVariables.variables.form.validation.labelRequired');
				}
				if (!toIdentifier(value)) {
					return t(
						'customVariables.variables.form.validation.generatedNameInvalid'
					);
				}
				return null;
			},
			type: (value) =>
				value.trim().length === 0
					? t('customVariables.variables.form.validation.typeRequired')
					: null,
		},
	});

	useEffect(() => {
		if (form.values.type !== 'string' && form.values.enumValues.length > 0) {
			form.setFieldValue('enumValues', []);
		}
	}, [form, form.values.enumValues, form.values.type]);

	const getErrorMessage = (error: unknown) => {
		if (!error || typeof error !== 'object') return '';
		const response = (error as { response?: { data?: { message?: string } } })
			.response;
		if (response?.data?.message) return response.data.message;
		if (
			'message' in error &&
			typeof (error as { message?: string }).message === 'string'
		) {
			return (error as { message?: string }).message ?? '';
		}
		return '';
	};

	const handleSubmit = async (values: CustomVariableFormValues) => {
		const generatedName = toIdentifier(values.label);
		const payload = {
			label: values.label.trim(),
			name: generatedName,
			categoryId: values.categoryId ? Number(values.categoryId) : null,
			value: mapFormToValue(values),
		};

		try {
			if (isEditing && variable) {
				await updateVariable.mutateAsync({
					templateId,
					variableId: variable.id,
					data: payload,
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('customVariables.variables.notifications.updateSuccess'),
					color: 'green',
				});
				onSuccess();
				return;
			}

			await createVariable.mutateAsync({
				templateId,
				data: payload,
			});
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.variables.notifications.createSuccess'),
				color: 'green',
			});
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message:
					getErrorMessage(error) ||
					t(
						isEditing
							? 'customVariables.variables.notifications.updateError'
							: 'customVariables.variables.notifications.createError'
					),
				color: 'red',
			});
		}
	};

	const isLoading = createVariable.isPending || updateVariable.isPending;
	const identifier = toIdentifier(form.values.label);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='sm'>
				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('customVariables.variables.form.sections.basicInfo')}
					</Text>
					<SimpleGrid
						cols={{ base: 1, sm: 2 }}
						spacing='xs'
						className={styles.gridTwo}
					>
						<TextInput
							size='sm'
							label={t('customVariables.variables.form.label.label')}
							placeholder={t(
								'customVariables.variables.form.label.placeholder'
							)}
							required
							{...form.getInputProps('label')}
						/>
						<Select
							size='sm'
							label={t('customVariables.variables.form.category.label')}
							placeholder={t(
								'customVariables.variables.form.category.placeholder'
							)}
							data={categoryOptions}
							clearable
							searchable
							searchValue={categorySearch}
							onSearchChange={setCategorySearch}
							{...form.getInputProps('categoryId')}
						/>
					</SimpleGrid>
				</div>

				<div className={styles.section}>
					<Text size='sm' fw={600} className={styles.sectionTitle}>
						{t('customVariables.variables.form.sections.llmSchema')}
					</Text>
					<div className={styles.identifierBlock}>
						<Text size='sm' fw={500} className={styles.identifierLabel}>
							{t('customVariables.variables.form.identifierPreview')}
						</Text>
						<Text
							size='sm'
							className={`${styles.identifierValue} ${!identifier ? styles.identifierEmpty : ''}`}
						>
							{identifier ||
								t('customVariables.variables.form.identifierEmpty')}
						</Text>
					</div>

					<Select
						size='sm'
						label={t('customVariables.variables.form.value.typeLabel')}
						placeholder={t(
							'customVariables.variables.form.value.typePlaceholder'
						)}
						data={[
							{
								value: 'string',
								label: t(
									'customVariables.variables.form.value.typeOptions.string'
								),
							},
							{
								value: 'number',
								label: t(
									'customVariables.variables.form.value.typeOptions.number'
								),
							},
							{
								value: 'integer',
								label: t(
									'customVariables.variables.form.value.typeOptions.integer'
								),
							},
							{
								value: 'boolean',
								label: t(
									'customVariables.variables.form.value.typeOptions.boolean'
								),
							},
						]}
						required
						mt='xs'
						{...form.getInputProps('type')}
					/>

					<Textarea
						size='sm'
						label={t('customVariables.variables.form.value.descriptionLabel')}
						placeholder={t(
							'customVariables.variables.form.value.descriptionPlaceholder'
						)}
						minRows={4}
						mt='xs'
						{...form.getInputProps('description')}
					/>
					<Text size='xs' c='dimmed' className={styles.sectionHint}>
						{t('customVariables.variables.form.hints.description')}
					</Text>
				</div>

				{form.values.type === 'string' && (
					<div className={styles.section}>
						<Text size='sm' fw={600} className={styles.sectionTitle}>
							{t('customVariables.variables.form.sections.enumValues')}
						</Text>
						<TagsInput
							size='sm'
							label={t('customVariables.variables.form.value.enumLabel')}
							placeholder={t(
								'customVariables.variables.form.value.enumPlaceholder'
							)}
							{...form.getInputProps('enumValues')}
						/>
						<Text size='xs' c='dimmed' className={styles.sectionHint}>
							{t('customVariables.variables.form.hints.enum')}
						</Text>
					</div>
				)}

				<Group justify='flex-end' gap='xs' className={styles.actions}>
					<Button
						size='sm'
						variant='subtle'
						type='button'
						onClick={onCancel}
						disabled={isLoading}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						size='sm'
						type='submit'
						loading={isLoading}
						disabled={!isAllowed}
					>
						{t(
							isEditing
								? 'customVariables.variables.form.actions.update'
								: 'customVariables.variables.form.actions.create'
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
