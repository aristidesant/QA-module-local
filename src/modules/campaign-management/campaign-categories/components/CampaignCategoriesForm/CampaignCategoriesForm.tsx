import React from 'react';
import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateCampaignCategory,
	useUpdateCampaignCategory,
} from '~/queries/campaignCategoriesQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	CampaignCategory,
	CreateCampaignCategoryRequest,
	UpdateCampaignCategoryRequest,
} from '~/models/CampaignCategoryModel';
import styles from './CampaignCategoriesForm.module.css';

interface CampaignCategoriesFormProps {
	category?: CampaignCategory;
	onSuccess: () => void;
	onCancel: () => void;
	withinParentForm?: boolean;
}

export const CampaignCategoriesForm: React.FC<CampaignCategoriesFormProps> = ({
	category,
	onSuccess,
	onCancel,
	withinParentForm = false,
}) => {
	const { t } = useTranslation('campaign-management');
	const isEditing = !!category;
	const createCategory = useCreateCampaignCategory();
	const updateCategory = useUpdateCampaignCategory();
	const { canPerformAction } = usePermissions();

	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canEdit = canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.UPDATE);
	const isAllowed = isEditing ? canEdit : canCreate;

	const form = useForm({
		initialValues: {
			name: category?.name || '',
			description: category?.description || '',
			active: category?.active ?? true,
		},
		validate: {
			name: (value) =>
				!value ? t('setup.categories.form.validation.nameRequired') : null,
		},
	});

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

	const handleSubmit = async (values: typeof form.values) => {
		try {
			if (isEditing) {
				const updateData: UpdateCampaignCategoryRequest = {
					name: values.name,
					description: values.description,
					active: values.active,
				};
				await updateCategory.mutateAsync({
					id: category.id,
					data: updateData,
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('setup.categories.notifications.updateSuccess'),
					color: 'green',
				});
			} else {
				const createData: CreateCampaignCategoryRequest = {
					name: values.name,
					description: values.description,
					active: values.active,
				};
				await createCategory.mutateAsync(createData);
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('setup.categories.notifications.createSuccess'),
					color: 'green',
				});
			}
			onSuccess();
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error);
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message:
					errorMessage ||
					t(
						isEditing
							? 'setup.categories.notifications.updateError'
							: 'setup.categories.notifications.createError'
					),
				color: 'red',
			});
		}
	};

	const isLoading = createCategory.isPending || updateCategory.isPending;

	const handleClickSubmit = () => {
		const validation = form.validate();
		if (validation.hasErrors) return;
		void handleSubmit(form.values);
	};

	const content = (
		<Stack gap='xs'>
			<TextInput
				size='sm'
				label={t('setup.categories.form.name.label')}
				placeholder={t('setup.categories.form.name.placeholder')}
				required
				{...form.getInputProps('name')}
			/>

			<Textarea
				size='sm'
				label={t('setup.categories.form.description.label')}
				placeholder={t('setup.categories.form.description.placeholder')}
				rows={3}
				{...form.getInputProps('description')}
			/>

			<Switch
				size='sm'
				label={t('setup.categories.form.active.label')}
				description={t('setup.categories.form.active.description')}
				{...form.getInputProps('active', { type: 'checkbox' })}
			/>

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
					type={withinParentForm ? 'button' : 'submit'}
					loading={isLoading}
					disabled={!isAllowed}
					className={styles.submitButton}
					onClick={withinParentForm ? handleClickSubmit : undefined}
				>
					{t(
						isEditing
							? 'setup.categories.form.actions.update'
							: 'setup.categories.form.actions.create'
					)}
				</Button>
			</Group>
		</Stack>
	);

	if (withinParentForm) {
		return <div className={styles.form}>{content}</div>;
	}

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			{content}
		</form>
	);
};
