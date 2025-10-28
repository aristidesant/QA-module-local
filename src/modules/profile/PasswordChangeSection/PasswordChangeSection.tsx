import { PasswordInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLock, IconX } from '@tabler/icons-react';
import { useChangePassword } from '~/queries/userQueries';
import styles from '../ProfilePage.module.css';

interface PasswordChangeSectionProps {
	onSuccess?: (payload: {
		currentPassword: string;
		newPassword: string;
	}) => Promise<void> | void;
	showCancelButton?: boolean;
	submitLabel?: string;
	processing?: boolean;
}

export const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
	onSuccess,
	showCancelButton = true,
	submitLabel = 'Change Password',
	processing = false,
}) => {
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
			newPassword: (value, values) => {
				if (value.length < 8) {
					return 'New password must be at least 8 characters';
				}

				if (value === values.currentPassword) {
					return 'New password must be different from your current password';
				}

				return null;
			},
			confirmPassword: (value, values) =>
				value !== values.newPassword ? 'Passwords do not match' : null,
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	const handleSubmit = form.onSubmit(async (values) => {
		if (values.newPassword !== values.confirmPassword) {
			form.setFieldError('confirmPassword', 'Passwords do not match');
			return;
		}

		if (values.newPassword === values.currentPassword) {
			form.setFieldError(
				'newPassword',
				'New password must be different from your current password'
			);
			return;
		}

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

			if (onSuccess) {
				await onSuccess({
					currentPassword: values.currentPassword,
					newPassword: values.newPassword,
				});
			}

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
						loading={changePasswordMutation.isPending || processing}
						disabled={!form.isValid() || processing}
					>
						{submitLabel}
					</Button>
					{showCancelButton && (
						<Button
							type='button'
							variant='outline'
							onClick={() => form.reset()}
							disabled={changePasswordMutation.isPending || processing}
						>
							Cancel
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};
