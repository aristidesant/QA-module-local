import { PasswordInput, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLock, IconX } from '@tabler/icons-react';
import { useChangePassword } from '~/queries/userQueries';
import { SectionCard } from '~/components/SectionCard/SectionCard';
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
	submitLabel,
	processing = false,
}) => {
	const { t } = useTranslation('profile');
	const changePasswordMutation = useChangePassword();

	const form = useForm({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate: {
			currentPassword: (value) =>
				value.length === 0
					? t('password_change.validation.current_required')
					: null,
			newPassword: (value, values) => {
				if (value.length < 8) {
					return t('password_change.validation.new_min_length');
				}

				if (value === values.currentPassword) {
					return t('password_change.validation.new_different');
				}

				return null;
			},
			confirmPassword: (value, values) =>
				value !== values.newPassword
					? t('password_change.validation.confirm_mismatch')
					: null,
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	const handleSubmit = form.onSubmit(async (values) => {
		if (values.newPassword !== values.confirmPassword) {
			form.setFieldError(
				'confirmPassword',
				t('password_change.validation.confirm_mismatch')
			);
			return;
		}

		if (values.newPassword === values.currentPassword) {
			form.setFieldError(
				'newPassword',
				t('password_change.validation.new_different')
			);
			return;
		}

		try {
			await changePasswordMutation.mutateAsync({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});

			notifications.show({
				title: t('password_change.success_title'),
				message: t('password_change.success_message'),
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
				title: t('password_change.error_title'),
				message:
					error?.response?.data?.message ||
					t('password_change.error_default_message'),
				color: 'red',
				icon: <IconX size={18} />,
				autoClose: 7000,
			});
		}
	});

	return (
		<SectionCard
			title={t('password_change.title')}
			description={t('password_change.description')}
			icon={IconLock}
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<PasswordInput
					label={t('password_change.current_password_label')}
					placeholder={t('password_change.current_password_placeholder')}
					required
					{...form.getInputProps('currentPassword')}
				/>

				<PasswordInput
					label={t('password_change.new_password_label')}
					placeholder={t('password_change.new_password_placeholder')}
					required
					{...form.getInputProps('newPassword')}
				/>

				<PasswordInput
					label={t('password_change.confirm_password_label')}
					placeholder={t('password_change.confirm_password_placeholder')}
					required
					{...form.getInputProps('confirmPassword')}
				/>

				<div className={styles.formActions}>
					<Button
						type='submit'
						loading={changePasswordMutation.isPending || processing}
						disabled={!form.isValid() || processing}
					>
						{submitLabel || t('password_change.submit_button')}
					</Button>
					{showCancelButton && (
						<Button
							type='button'
							variant='outline'
							onClick={() => form.reset()}
							disabled={changePasswordMutation.isPending || processing}
						>
							{t('password_change.cancel_button')}
						</Button>
					)}
				</div>
			</form>
		</SectionCard>
	);
};
