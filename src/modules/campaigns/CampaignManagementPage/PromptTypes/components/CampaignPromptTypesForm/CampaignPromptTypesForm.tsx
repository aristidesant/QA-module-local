import React from 'react';
import { Button, Group, Stack, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useCreateCampaignPromptType,
	useUpdateCampaignPromptType,
} from '~/queries/campaignPromptTypeQueries';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { getErrorMessage } from '~/utils/httpClient';
import styles from './CampaignPromptTypesForm.module.css';

interface CampaignPromptTypesFormProps {
	promptType?: CampaignPromptTypeModel;
	onSuccess: () => void;
	onCancel: () => void;
}

const CampaignPromptTypesForm: React.FC<CampaignPromptTypesFormProps> = ({
	promptType,
	onSuccess,
	onCancel,
}) => {
	const isEditing = !!promptType;
	const createPromptType = useCreateCampaignPromptType();
	const updatePromptType = useUpdateCampaignPromptType();

	const form = useForm({
		initialValues: {
			name: promptType?.name ?? '',
			icon: promptType?.icon ?? '',
			order: promptType?.order ?? 1,
		},
		validate: {
			name: (value) => (!value.trim() ? 'Name is required' : null),
			icon: (value) => (!value.trim() ? 'Icon is required' : null),
			order: (value) =>
				isEditing &&
				(typeof value !== 'number' || Number.isNaN(value) || value < 1)
					? 'Order must be 1 or greater'
					: null,
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			if (isEditing) {
				await updatePromptType.mutateAsync({
					id: promptType.id,
					data: {
						name: values.name.trim(),
						icon: values.icon.trim(),
						order: values.order,
					},
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign prompt type updated successfully',
					color: 'green',
				});
			} else {
				await createPromptType.mutateAsync({
					name: values.name.trim(),
					icon: values.icon.trim(),
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign prompt type created successfully',
					color: 'green',
				});
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const isLoading = createPromptType.isPending || updatePromptType.isPending;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<TextInput
					label='Name'
					placeholder='Enter prompt type name'
					required
					{...form.getInputProps('name')}
				/>

				<TextInput
					label='Icon'
					placeholder='Enter icon name (e.g., IconSparkles)'
					required
					{...form.getInputProps('icon')}
				/>

				{isEditing && (
					<NumberInput
						label='Order'
						placeholder='1'
						min={1}
						required
						{...form.getInputProps('order')}
					/>
				)}

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

export default CampaignPromptTypesForm;
