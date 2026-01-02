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
import { useTranslation } from 'react-i18next';
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
import CategoryPickerPanel from '~/modules/campaign-management/CampaignManagementPage/components/CategoryPickerPanel';
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
	const { t } = useTranslation('campaign-management');
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
			name: (value) =>
				!value ? t('setup.objectives.form.validation.nameRequired') : null,
			// @ts-ignore
			categoryId: (value) =>
				!value ? t('setup.objectives.form.validation.categoryRequired') : null,
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
					title: t('status.success', { ns: 'common' }),
					message: t('setup.objectives.notifications.updateSuccess'),
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
					title: t('status.success', { ns: 'common' }),
					message: t('setup.objectives.notifications.createSuccess'),
					color: 'green',
				});
				onSuccess(createdObjective);
			}
			// onSuccess call moved inside existing blocks to pass specific data
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error);
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message:
					errorMessage ||
					t(
						isEditing
							? 'setup.objectives.notifications.updateError'
							: 'setup.objectives.notifications.createError'
					),
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
				label={t('setup.objectives.form.name.label')}
				placeholder={t('setup.objectives.form.name.placeholder')}
				required
				{...form.getInputProps('name')}
			/>

			<TextInput
				label={t('setup.objectives.form.category.label')}
				placeholder={t('setup.objectives.form.category.placeholder')}
				required
				readOnly
				value={selectedCategoryName}
				error={form.errors.categoryId}
				rightSection={
					<ActionIcon
						variant='subtle'
						size='sm'
						type='button'
						aria-label={t('setup.objectives.form.category.browseAria')}
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
				label={t('setup.objectives.form.description.label')}
				placeholder={t('setup.objectives.form.description.placeholder')}
				rows={3}
				{...form.getInputProps('description')}
			/>

			<Switch
				label={t('setup.objectives.form.active.label')}
				description={t('setup.objectives.form.active.description')}
				{...form.getInputProps('active', { type: 'checkbox' })}
			/>

			<Group justify='flex-end' gap='sm' className={styles.actions}>
				<Button
					variant='subtle'
					type='button'
					onClick={onCancel}
					disabled={isLoading}
				>
					{t('actions.cancel', { ns: 'common' })}
				</Button>
				<Button
					type={withinParentForm ? 'button' : 'submit'}
					loading={isLoading}
					className={styles.submitButton}
					onClick={withinParentForm ? handleClickSubmit : undefined}
				>
					{t(
						isEditing
							? 'setup.objectives.form.actions.update'
							: 'setup.objectives.form.actions.create'
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
