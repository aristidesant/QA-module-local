import { PasswordInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLock, IconX } from '@tabler/icons-react';
import { useChangePassword } from '~/queries/userQueries';
import styles from '../ProfilePage.module.css';

export const PasswordChangeSection: React.FC = () => {
	const changePasswordMutation = useChangePassword();

	const form = useForm({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate: {
			currentPassword: (value) =>
				value.length === 0 ? 'Current password is required' : null,
			newPassword: (value) =>
				value.length < 8 ? 'New password must be at least 8 characters' : null,
			confirmPassword: (value, values) =>
				value !== values.newPassword ? 'Passwords do not match' : null,
		},
	});

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			await changePasswordMutation.mutateAsync({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});

			notifications.show({
				title: '✓ Password Successfully Updated',
				message:
					'Your password has been changed successfully. Make sure to use your new password the next time you sign in.',
				color: 'green',
				icon: <IconLock size={18} />,
				autoClose: 6000,
			});

			form.reset();
		} catch (error: any) {
			notifications.show({
				title: 'Password Change Failed',
				message:
					error?.response?.data?.message ||
					'Unable to update your password. Please verify your current password is correct and ensure your new password meets the security requirements.',
				color: 'red',
				icon: <IconX size={18} />,
				autoClose: 7000,
			});
		}
	});

	return (
		<div className={styles.sectionCard}>
			<div className={styles.sectionHeader}>
				<IconLock className={styles.sectionIcon} size={24} />
				<h2 className={styles.sectionTitle}>Change Password</h2>
			</div>
			<p className={styles.sectionDescription}>
				Keep your account secure by regularly updating your password. Use a
				strong, unique password with at least 8 characters that includes a mix
				of letters, numbers, and symbols.
			</p>

			<form onSubmit={handleSubmit} className={styles.form}>
				<PasswordInput
					label='Current Password'
					placeholder='Enter your current password'
					required
					{...form.getInputProps('currentPassword')}
				/>

				<PasswordInput
					label='New Password'
					placeholder='Enter your new password'
					required
					{...form.getInputProps('newPassword')}
				/>

				<PasswordInput
					label='Confirm New Password'
					placeholder='Confirm your new password'
					required
					{...form.getInputProps('confirmPassword')}
				/>

				<div className={styles.formActions}>
					<Button
						type='submit'
						loading={changePasswordMutation.isPending}
						disabled={!form.isValid()}
					>
						Change Password
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={() => form.reset()}
						disabled={changePasswordMutation.isPending}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
};
