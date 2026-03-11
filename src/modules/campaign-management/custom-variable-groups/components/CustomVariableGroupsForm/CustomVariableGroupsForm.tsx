import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type { CustomVariableTemplate } from '~/models/CustomVariableModel';
import {
	useCreateCustomVariableTemplate,
	useUpdateCustomVariableTemplate,
} from '~/queries/customVariableTemplatesQueries';
import styles from './CustomVariableGroupsForm.module.css';

interface CustomVariableGroupsFormProps {
	template?: CustomVariableTemplate;
	onSuccess: (templateId?: number) => void;
	onCancel: () => void;
}

export default function CustomVariableGroupsForm({
	template,
	onSuccess,
	onCancel,
}: CustomVariableGroupsFormProps) {
	const { t } = useTranslation('campaign-management');
	const { canPerformAction } = usePermissions();
	const createTemplate = useCreateCustomVariableTemplate();
	const updateTemplate = useUpdateCustomVariableTemplate();

	const isEditing = Boolean(template);
	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canEdit = canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.UPDATE);

	const form = useForm({
		initialValues: {
			name: template?.name || '',
		},
		validate: {
			name: (value) =>
				value.trim().length === 0
					? t('customVariables.groups.form.validation.nameRequired')
					: null,
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
			if (isEditing && template) {
				const updated = await updateTemplate.mutateAsync({
					id: template.id,
					data: { name: values.name },
				});
				notifications.show({
					title: t('status.success', { ns: 'common' }),
					message: t('customVariables.groups.notifications.updateSuccess'),
					color: 'green',
				});
				onSuccess(updated.id);
				return;
			}

			const created = await createTemplate.mutateAsync({ name: values.name });
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('customVariables.groups.notifications.createSuccess'),
				color: 'green',
			});
			onSuccess(created.id);
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message:
					getErrorMessage(error) ||
					t(
						isEditing
							? 'customVariables.groups.notifications.updateError'
							: 'customVariables.groups.notifications.createError'
					),
				color: 'red',
			});
		}
	};

	const isLoading = createTemplate.isPending || updateTemplate.isPending;
	const isAllowed = isEditing ? canEdit : canCreate;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='xs'>
				<TextInput
					size='sm'
					label={t('customVariables.groups.form.name.label')}
					placeholder={t('customVariables.groups.form.name.placeholder')}
					required
					{...form.getInputProps('name')}
				/>

				<Group justify='flex-end' gap='xs'>
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
								? 'customVariables.groups.form.actions.update'
								: 'customVariables.groups.form.actions.create'
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
