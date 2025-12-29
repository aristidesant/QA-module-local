import React from 'react';
import {
	Button,
	Group,
	Stack,
	TextInput,
	NumberInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign-management');
	const isEditing = !!promptType;
	const createPromptType = useCreateCampaignPromptType();
	const updatePromptType = useUpdateCampaignPromptType();

	const form = useForm({
		initialValues: {
			name: promptType?.name ?? '',
			icon: promptType?.icon ?? '',
			description: promptType?.description ?? '',
			order: promptType?.order ?? 1,
		},
		validate: {
			name: (value) =>
				!value.trim()
					? t('setup.promptTypes.form.validation.nameRequired')
					: null,
			icon: (value) =>
				!value.trim()
					? t('setup.promptTypes.form.validation.iconRequired')
					: null,
			order: (value) =>
				isEditing &&
				(typeof value !== 'number' || Number.isNaN(value) || value < 1)
					? t('setup.promptTypes.form.validation.orderMin')
					: null,
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		const description = values.description.trim();
		try {
			if (isEditing) {
				await updatePromptType.mutateAsync({
					id: promptType.id,
					data: {
						name: values.name.trim(),
						icon: values.icon.trim(),
						description,
						order: values.order,
					},
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('setup.promptTypes.notifications.updateSuccess'),
					color: 'green',
				});
			} else {
				await createPromptType.mutateAsync({
					name: values.name.trim(),
					icon: values.icon.trim(),
					description,
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('setup.promptTypes.notifications.createSuccess'),
					color: 'green',
				});
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const isLoading = createPromptType.isPending || updatePromptType.isPending;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='xs'>
				<TextInput
					label={t('setup.promptTypes.form.name.label')}
					placeholder={t('setup.promptTypes.form.name.placeholder')}
					size='sm'
					required
					{...form.getInputProps('name')}
				/>

				<TextInput
					label={t('setup.promptTypes.form.icon.label')}
					placeholder={t('setup.promptTypes.form.icon.placeholder')}
					size='sm'
					required
					{...form.getInputProps('icon')}
				/>

				<Textarea
					label={t('setup.promptTypes.form.description.label')}
					placeholder={t('setup.promptTypes.form.description.placeholder')}
					size='sm'
					rows={3}
					{...form.getInputProps('description')}
				/>

				{isEditing && (
					<NumberInput
						label={t('setup.promptTypes.form.order.label')}
						placeholder={t('setup.promptTypes.form.order.placeholder')}
						size='sm'
						min={1}
						required
						{...form.getInputProps('order')}
					/>
				)}

				<Group justify='flex-end' gap='xs' className={styles.actions}>
					<Button
						variant='subtle'
						size='sm'
						onClick={onCancel}
						disabled={isLoading}
					>
						{t('setup.promptTypes.form.actions.cancel')}
					</Button>
					<Button
						type='submit'
						size='sm'
						loading={isLoading}
						className={styles.submitButton}
					>
						{isEditing
							? t('setup.promptTypes.form.actions.update')
							: t('setup.promptTypes.form.actions.create')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default CampaignPromptTypesForm;
