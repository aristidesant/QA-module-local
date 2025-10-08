import React from 'react';
import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Switch,
	Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useCreateCampaignObjective,
	useUpdateCampaignObjective,
} from '~/queries/campaignObjectivesQueries';
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import {
	CampaignObjective,
	CreateCampaignObjectiveRequest,
	UpdateCampaignObjectiveRequest,
} from '~/models/CampaignObjectiveModel';
import styles from './CampaignObjectivesForm.module.css';

interface CampaignObjectivesFormProps {
	objective?: CampaignObjective;
	onSuccess: () => void;
	onCancel: () => void;
}

export const CampaignObjectivesForm: React.FC<CampaignObjectivesFormProps> = ({
	objective,
	onSuccess,
	onCancel,
}) => {
	const isEditing = !!objective;
	const createObjective = useCreateCampaignObjective();
	const updateObjective = useUpdateCampaignObjective();

	// Get categories for the select
	const { data: categoriesResponse } = useGetCampaignCategories();
	const categories = categoriesResponse?.data || [];

	const form = useForm({
		initialValues: {
			name: objective?.name || '',
			description: objective?.description || '',
			categoryId: objective?.categoryId?.toString() || '',
			active: objective?.active ?? true,
		},
		validate: {
			name: (value) => (!value ? 'Name is required' : null),
			categoryId: (value) => (!value ? 'Category is required' : null),
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			if (isEditing) {
				const updateData: UpdateCampaignObjectiveRequest = {
					name: values.name,
					description: values.description,
					categoryId: parseInt(values.categoryId),
					active: values.active,
				};
				await updateObjective.mutateAsync({
					id: objective.id,
					data: updateData,
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign objective updated successfully',
					color: 'green',
				});
			} else {
				const createData: CreateCampaignObjectiveRequest = {
					name: values.name,
					description: values.description,
					categoryId: parseInt(values.categoryId),
					active: values.active,
				};
				await createObjective.mutateAsync(createData);
				notifications.show({
					title: 'Success',
					message: 'Campaign objective created successfully',
					color: 'green',
				});
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to ${isEditing ? 'update' : 'create'} campaign objective`,
				color: 'red',
			});
		}
	};

	const isLoading = createObjective.isPending || updateObjective.isPending;

	// Transform categories for select options
	const categoryOptions = categories.map((category) => ({
		value: category.id.toString(),
		label: category.name,
	}));

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<TextInput
					label='Name'
					placeholder='Enter objective name'
					required
					{...form.getInputProps('name')}
				/>

				<Select
					label='Category'
					placeholder='Select a category'
					required
					data={categoryOptions}
					{...form.getInputProps('categoryId')}
				/>

				<Textarea
					label='Description'
					placeholder='Enter objective description (optional)'
					rows={3}
					{...form.getInputProps('description')}
				/>

				<Switch
					label='Active'
					description='When enabled, this objective will be available for use'
					{...form.getInputProps('active', { type: 'checkbox' })}
				/>

				<Group justify='flex-end' gap='sm' className={styles.actions}>
					<Button variant='subtle' onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						type='submit'
						loading={isLoading}
						className={styles.submitButton}
					>
						{isEditing ? 'Update' : 'Create'}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};
