import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUser, IconCheck, IconX } from '@tabler/icons-react';
import {
	useCurrentUser,
	useUpdateCurrentUserName,
} from '~/queries/userQueries';
import { SectionCard } from '~/components/SectionCard/SectionCard';
import pageStyles from '../ProfilePage.module.css';
import styles from './NameChangeSection.module.css';

export const NameChangeSection: React.FC = () => {
	const { t } = useTranslation('profile');
	const { data: user } = useCurrentUser();
	const updateNameMutation = useUpdateCurrentUserName();
	const [isEditing, setIsEditing] = useState(false);

	const form = useForm({
		initialValues: {
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
		},
		validate: {
			firstName: (value) => {
				if (!value || value.trim().length === 0) {
					return t('name_change.validation.first_name_required');
				}
				if (value.trim().length < 2) {
					return t('name_change.validation.first_name_min');
				}
				if (value.trim().length > 50) {
					return t('name_change.validation.first_name_max');
				}
				return null;
			},
			lastName: (value) => {
				if (!value || value.trim().length === 0) {
					return t('name_change.validation.last_name_required');
				}
				if (value.trim().length < 2) {
					return t('name_change.validation.last_name_min');
				}
				if (value.trim().length > 50) {
					return t('name_change.validation.last_name_max');
				}
				return null;
			},
		},
	});

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			await updateNameMutation.mutateAsync({
				firstName: values.firstName.trim(),
				lastName: values.lastName.trim(),
			});
			notifications.show({
				title: t('name_change.success_title'),
				message: t('name_change.success_message'),
				color: 'green',
				icon: <IconCheck size={18} />,
			});
			setIsEditing(false);
		} catch (error: any) {
			notifications.show({
				title: t('name_change.error_title'),
				message:
					error.response?.data?.message || t('name_change.error_message'),
				color: 'red',
				icon: <IconX size={18} />,
			});
		}
	});

	const handleCancel = () => {
		form.setFieldValue('firstName', user?.firstName || '');
		form.setFieldValue('lastName', user?.lastName || '');
		setIsEditing(false);
	};

	// Update form when user data changes
	if (user && !isEditing) {
		if (form.values.firstName !== (user.firstName || '')) {
			form.setFieldValue('firstName', user.firstName || '');
		}
		if (form.values.lastName !== (user.lastName || '')) {
			form.setFieldValue('lastName', user.lastName || '');
		}
	}

	return (
		<SectionCard
			title={t('name_change.title')}
			description={t('name_change.description')}
			icon={IconUser}
			className={pageStyles.settingsSurface}
			padding='md'
			contentSpacing='sm'
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.nameFields}>
					<TextInput
						label={t('name_change.first_name_label')}
						placeholder={t('name_change.first_name_placeholder')}
						disabled={!isEditing}
						{...form.getInputProps('firstName')}
						classNames={{
							root: styles.nameField,
							input: isEditing ? styles.inputEditing : styles.inputDisabled,
						}}
					/>
					<TextInput
						label={t('name_change.last_name_label')}
						placeholder={t('name_change.last_name_placeholder')}
						disabled={!isEditing}
						{...form.getInputProps('lastName')}
						classNames={{
							root: styles.nameField,
							input: isEditing ? styles.inputEditing : styles.inputDisabled,
						}}
					/>
				</div>

				<div className={styles.actions}>
					{!isEditing ? (
						<Button
							variant='light'
							onClick={() => setIsEditing(true)}
							className={styles.button}
						>
							{t('name_change.edit_button')}
						</Button>
					) : (
						<>
							<Button
								variant='default'
								onClick={handleCancel}
								disabled={updateNameMutation.isPending}
								className={styles.button}
							>
								{t('name_change.cancel_button')}
							</Button>
							<Button
								type='submit'
								loading={updateNameMutation.isPending}
								className={styles.button}
							>
								{t('name_change.save_button')}
							</Button>
						</>
					)}
				</div>
			</form>
		</SectionCard>
	);
};

export default NameChangeSection;
