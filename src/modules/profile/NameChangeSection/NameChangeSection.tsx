import { useState } from 'react';
import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUser, IconCheck, IconX } from '@tabler/icons-react';
import {
	useCurrentUser,
	useUpdateCurrentUserName,
} from '~/queries/userQueries';
import { SectionCard } from '~/components/SectionCard/SectionCard';
import styles from './NameChangeSection.module.css';

export const NameChangeSection: React.FC = () => {
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
					return 'First name is required';
				}
				if (value.trim().length < 2) {
					return 'First name must be at least 2 characters';
				}
				if (value.trim().length > 50) {
					return 'First name must be less than 50 characters';
				}
				return null;
			},
			lastName: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Last name is required';
				}
				if (value.trim().length < 2) {
					return 'Last name must be at least 2 characters';
				}
				if (value.trim().length > 50) {
					return 'Last name must be less than 50 characters';
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
				title: 'Success',
				message: 'Your name has been updated successfully',
				color: 'green',
				icon: <IconCheck size={18} />,
			});
			setIsEditing(false);
		} catch (error: any) {
			notifications.show({
				title: 'Error',
				message: error.response?.data?.message || 'Failed to update name',
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
			title='Display Name'
			description='Update your first and last name that others will see'
			icon={IconUser}
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.nameFields}>
					<TextInput
						label='First Name'
						placeholder='Enter your first name'
						disabled={!isEditing}
						{...form.getInputProps('firstName')}
						classNames={{
							root: styles.nameField,
							input: isEditing ? styles.inputEditing : styles.inputDisabled,
						}}
					/>
					<TextInput
						label='Last Name'
						placeholder='Enter your last name'
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
							Edit Name
						</Button>
					) : (
						<>
							<Button
								variant='default'
								onClick={handleCancel}
								disabled={updateNameMutation.isPending}
								className={styles.button}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								loading={updateNameMutation.isPending}
								className={styles.button}
							>
								Save Changes
							</Button>
						</>
					)}
				</div>
			</form>
		</SectionCard>
	);
};

export default NameChangeSection;
