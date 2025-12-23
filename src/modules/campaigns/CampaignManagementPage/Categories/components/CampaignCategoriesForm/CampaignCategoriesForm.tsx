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
import {
	useCreateCampaignCategory,
	useUpdateCampaignCategory,
} from '~/queries/campaignCategoriesQueries';
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
	const isEditing = !!category;
	const createCategory = useCreateCampaignCategory();
	const updateCategory = useUpdateCampaignCategory();

	const form = useForm({
		initialValues: {
			name: category?.name || '',
			code: category?.code || '',
			description: category?.description || '',
			active: category?.active ?? true,
		},
		validate: {
			name: (value) => (!value ? 'Name is required' : null),
			code: (value) => (!value ? 'Code is required' : null),
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			if (isEditing) {
				const updateData: UpdateCampaignCategoryRequest = {
					name: values.name,
					code: values.code,
					description: values.description,
					active: values.active,
				};
				await updateCategory.mutateAsync({
					id: category.id,
					data: updateData,
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign category updated successfully',
					color: 'green',
				});
			} else {
				const createData: CreateCampaignCategoryRequest = {
					name: values.name,
					code: values.code,
					description: values.description,
					active: values.active,
				};
				await createCategory.mutateAsync(createData);
				notifications.show({
					title: 'Success',
					message: 'Campaign category created successfully',
					color: 'green',
				});
			}
			onSuccess();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || error?.message || '';
			notifications.show({
				title: 'Error',
				message:
					errorMessage ||
					`Failed to ${isEditing ? 'update' : 'create'} campaign category`,
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
		<Stack gap='md'>
			<TextInput
				label='Name'
				placeholder='Enter category name'
				required
				{...form.getInputProps('name')}
			/>

			<TextInput
				label='Code'
				placeholder='Enter category code'
				required
				{...form.getInputProps('code')}
			/>

			<Textarea
				label='Description'
				placeholder='Enter category description (optional)'
				rows={3}
				{...form.getInputProps('description')}
			/>

			<Switch
				label='Active'
				description='When enabled, this category will be available for use'
				{...form.getInputProps('active', { type: 'checkbox' })}
			/>

			<Group justify='flex-end' gap='sm' className={styles.actions}>
				<Button
					variant='subtle'
					type='button'
					onClick={onCancel}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type={withinParentForm ? 'button' : 'submit'}
					loading={isLoading}
					className={styles.submitButton}
					onClick={withinParentForm ? handleClickSubmit : undefined}
				>
					{isEditing ? 'Update' : 'Create'}
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
