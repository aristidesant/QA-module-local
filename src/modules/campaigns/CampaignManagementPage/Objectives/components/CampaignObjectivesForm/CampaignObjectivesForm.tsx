import React from 'react';
import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Switch,
	ActionIcon,
	Collapse,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronRight } from '@tabler/icons-react';
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
import CategoryPickerPanel from '~/modules/campaigns/CampaignManagementPage/components/CategoryPickerPanel';
import styles from './CampaignObjectivesForm.module.css';

interface CampaignObjectivesFormProps {
	objective?: CampaignObjective;
	onSuccess: (objective?: CampaignObjective) => void;
	onCancel: () => void;
	withinParentForm?: boolean;
}

export const CampaignObjectivesForm: React.FC<CampaignObjectivesFormProps> = ({
	objective,
	onSuccess,
	onCancel,
	withinParentForm = false,
}) => {
	const isEditing = !!objective;
	const [categoryPickerOpen, setCategoryPickerOpen] = React.useState(false);
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
			// @ts-ignore
			name: (value) => (!value ? 'Name is required' : null),
			// @ts-ignore
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
				const updatedObjective = await updateObjective.mutateAsync({
					id: objective.id,
					data: updateData,
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign objective updated successfully',
					color: 'green',
				});
				onSuccess(updatedObjective);
			} else {
				const createData: CreateCampaignObjectiveRequest = {
					name: values.name,
					description: values.description,
					categoryId: parseInt(values.categoryId),
					active: values.active,
				};
				const createdObjective = await createObjective.mutateAsync(createData);
				notifications.show({
					title: 'Success',
					message: 'Campaign objective created successfully',
					color: 'green',
				});
				onSuccess(createdObjective);
			}
			// onSuccess call moved inside existing blocks to pass specific data
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || error?.message || '';
			notifications.show({
				title: 'Error',
				message:
					errorMessage ||
					`Failed to ${isEditing ? 'update' : 'create'} campaign objective`,
				color: 'red',
			});
		}
	};

	const isLoading = createObjective.isPending || updateObjective.isPending;

	const selectedCategoryName =
		categories.find(
			(category) => category.id.toString() === form.values.categoryId
		)?.name || '';

	const handleClickSubmit = () => {
		const validation = form.validate();
		if (validation.hasErrors) return;
		void handleSubmit(form.values);
	};

	const content = (
		<Stack gap='md'>
			<TextInput
				label='Name'
				placeholder='Enter objective name'
				required
				{...form.getInputProps('name')}
			/>

			<TextInput
				label='Category'
				placeholder='Select a category'
				required
				readOnly
				value={selectedCategoryName}
				error={form.errors.categoryId}
				rightSection={
					<ActionIcon
						variant='subtle'
						size='sm'
						type='button'
						aria-label='Browse categories'
						onClick={() => setCategoryPickerOpen((v) => !v)}
					>
						<IconChevronRight size={16} />
					</ActionIcon>
				}
				onClick={() => setCategoryPickerOpen(true)}
			/>

			<Collapse in={categoryPickerOpen}>
				<CategoryPickerPanel
					selectedCategoryId={
						form.values.categoryId ? parseInt(form.values.categoryId, 10) : null
					}
					onSelect={(category) => {
						form.setFieldValue('categoryId', category.id.toString());
						setCategoryPickerOpen(false);
					}}
					onClose={() => setCategoryPickerOpen(false)}
				/>
			</Collapse>

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
