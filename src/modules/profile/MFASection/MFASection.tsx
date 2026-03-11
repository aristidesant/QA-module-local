import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, TextInput, PasswordInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconShieldCheck,
	IconCheck,
	IconX,
	IconShieldOff,
} from '@tabler/icons-react';
import {
	useEnableMFA,
	useVerifyAndEnableMFA,
	useDisableMFA,
	useCurrentUser,
} from '~/queries/userQueries';
import { useSessionStore } from '~/stores/sessionStore';
import styles from './MFASection.module.css';

export const MFASection: React.FC = () => {
	const { t } = useTranslation('profile');
	const { user, setUser } = useSessionStore();
	const [showDisableForm, setShowDisableForm] = useState(false);
	const [showEnableForm, setShowEnableForm] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const enableMFAMutation = useEnableMFA();
	const verifyMFAMutation = useVerifyAndEnableMFA();
	const disableMFAMutation = useDisableMFA();
	const currentUserQuery = useCurrentUser();

	// Check if MFA is enabled from user data or auth response
	const isMFAEnabled = user?.mfaEnabled || false;

	const enableForm = useForm({
		initialValues: {
			password: '',
		},
		validate: {
			password: (value) =>
				value.length === 0 ? t('mfa.password_form.validation.required') : null,
		},
	});

	const verifyForm = useForm({
		initialValues: {
			code: '',
		},
		validate: {
			code: (value) =>
				value.length !== 6 ? t('mfa.verify_form.validation.code_length') : null,
		},
	});

	const disableForm = useForm({
		initialValues: {
			password: '',
		},
		validate: {
			password: (value) =>
				value.length === 0 ? t('mfa.password_form.validation.required') : null,
		},
	});

	const handleEnableMFA = enableForm.onSubmit(async (values) => {
		try {
			const response = await enableMFAMutation.mutateAsync({
				password: values.password,
			});

			notifications.show({
				title: t('mfa.notifications.enabled_title'),
				message: t('mfa.notifications.enabled_message'),
				color: 'blue',
				icon: <IconCheck size={18} />,
				autoClose: 5000,
			});

			setQrCodeUrl(response.qrCodeUrl);
			setShowEnableForm(false);
			const updatedUser = (await currentUserQuery.refetch())?.data;
			if (updatedUser) {
				setUser(updatedUser);
			}

			enableForm.reset();
		} catch (error: any) {
			notifications.show({
				title: t('mfa.notifications.auth_failed_title'),
				message:
					error?.response?.data?.message ||
					t('mfa.notifications.auth_failed_message'),
				color: 'red',
				icon: <IconX size={18} />,
				autoClose: 7000,
			});
		}
	});

	const handleVerifyMFA = verifyForm.onSubmit(async (values) => {
		try {
			await verifyMFAMutation.mutateAsync({ code: values.code });

			notifications.show({
				title: t('mfa.notifications.verified_title'),
				message: t('mfa.notifications.verified_message'),
				color: 'green',
				icon: <IconShieldCheck size={18} />,
				autoClose: 8000,
			});

			// Reset state
			setQrCodeUrl(null);
			verifyForm.reset();
		} catch (error: any) {
			notifications.show({
				title: t('mfa.notifications.verify_failed_title'),
				message:
					error?.response?.data?.message ||
					t('mfa.notifications.verify_failed_message'),
				color: 'red',
				icon: <IconX size={18} />,
				autoClose: 7000,
			});
		}
	});

	const handleDisableMFA = disableForm.onSubmit(async (values) => {
		try {
			await disableMFAMutation.mutateAsync({ password: values.password });

			notifications.show({
				title: t('mfa.notifications.disabled_title'),
				message: t('mfa.notifications.disabled_message'),
				color: 'orange',
				icon: <IconShieldOff size={18} />,
				autoClose: 8000,
			});

			disableForm.reset();
			setShowDisableForm(false);
		} catch (error: any) {
			notifications.show({
				title: t('mfa.notifications.auth_failed_title'),
				message:
					error?.response?.data?.message ||
					t('mfa.notifications.auth_failed_message'),
				color: 'red',
				icon: <IconX size={18} />,
				autoClose: 7000,
			});
		}
	});

	const handleCancelSetup = () => {
		setQrCodeUrl(null);
		verifyForm.reset();
	};

	const handleCancelEnable = () => {
		setShowEnableForm(false);
		enableForm.reset();
	};

	const handleCancelDisable = () => {
		setShowDisableForm(false);
		disableForm.reset();
	};

	const showSetupForm = !isMFAEnabled && showEnableForm && !qrCodeUrl;
	const showVerifyForm = Boolean(qrCodeUrl);
	const showDisableFormState = isMFAEnabled && showDisableForm;

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<div className={styles.headerMain}>
					<div className={styles.headerTitleRow}>
						<div
							className={`${styles.iconShell} ${isMFAEnabled ? styles.iconShellEnabled : ''}`}
						>
							{isMFAEnabled ? (
								<IconShieldCheck size={16} stroke={1.8} />
							) : (
								<IconShieldOff size={16} stroke={1.8} />
							)}
						</div>
						<div className={styles.headerCopy}>
							<Text component='p' className={styles.label}>
								{t('mfa.title')}
							</Text>
							<Text component='p' className={styles.message}>
								{isMFAEnabled
									? t('mfa.inline.enabled_message')
									: t('mfa.inline.disabled_message')}
							</Text>
						</div>
					</div>
					<div
						className={`${styles.statusBadge} ${
							isMFAEnabled ? styles.statusEnabled : styles.statusDisabled
						}`}
					>
						{isMFAEnabled ? t('mfa.status_enabled') : t('mfa.status_disabled')}
					</div>
				</div>
				<div className={styles.headerAction}>
					{isMFAEnabled ? (
						<Button
							variant='default'
							size='sm'
							onClick={() => setShowDisableForm(true)}
							disabled={showDisableFormState}
						>
							{t('mfa.disable_button')}
						</Button>
					) : (
						<Button
							size='sm'
							onClick={() => setShowEnableForm(true)}
							disabled={showSetupForm || showVerifyForm}
						>
							{t('mfa.enable_button')}
						</Button>
					)}
				</div>
			</div>

			{showSetupForm && (
				<div className={styles.expandedPanel}>
					<div className={styles.expandedCopy}>
						<Text component='p' className={styles.expandedTitle}>
							{t('mfa.confirm_identity.title')}
						</Text>
						<Text component='p' className={styles.expandedMessage}>
							{t('mfa.inline.enable_prompt')}
						</Text>
					</div>
					<form onSubmit={handleEnableMFA} className={styles.form}>
						<PasswordInput
							label={t('mfa.password_form.label')}
							placeholder={t('mfa.password_form.placeholder')}
							required
							size='sm'
							{...enableForm.getInputProps('password')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								size='sm'
								loading={enableMFAMutation.isPending}
								disabled={!enableForm.isValid()}
							>
								{t('mfa.password_form.continue_button')}
							</Button>
							<Button
								type='button'
								variant='default'
								size='sm'
								onClick={handleCancelEnable}
								disabled={enableMFAMutation.isPending}
							>
								{t('mfa.password_form.cancel_button')}
							</Button>
						</div>
					</form>
				</div>
			)}

			{showVerifyForm && (
				<div className={styles.expandedPanel}>
					<div className={styles.expandedCopy}>
						<Text component='p' className={styles.expandedTitle}>
							{t('mfa.code_sent.title')}
						</Text>
						<Text component='div' className={styles.expandedMessage}>
							<Trans
								i18nKey='mfa.code_sent.message'
								values={{ email: user?.email }}
								components={{ strong: <strong /> }}
							/>
						</Text>
					</div>
					<form onSubmit={handleVerifyMFA} className={styles.form}>
						<TextInput
							label={t('mfa.verify_form.code_label')}
							placeholder={t('mfa.verify_form.code_placeholder')}
							required
							size='sm'
							maxLength={6}
							{...verifyForm.getInputProps('code')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								size='sm'
								loading={verifyMFAMutation.isPending}
								disabled={!verifyForm.isValid()}
							>
								{t('mfa.verify_form.verify_button')}
							</Button>
							<Button
								type='button'
								variant='default'
								size='sm'
								onClick={handleCancelSetup}
								disabled={verifyMFAMutation.isPending}
							>
								{t('mfa.verify_form.cancel_button')}
							</Button>
						</div>
					</form>
				</div>
			)}

			{showDisableFormState && (
				<div className={`${styles.expandedPanel} ${styles.warningPanel}`}>
					<div className={styles.expandedCopy}>
						<Text component='p' className={styles.expandedTitle}>
							{t('mfa.disable_warning.title')}
						</Text>
						<Text component='p' className={styles.expandedMessage}>
							{t('mfa.inline.disable_prompt')}
						</Text>
					</div>
					<form onSubmit={handleDisableMFA} className={styles.form}>
						<PasswordInput
							label={t('mfa.password_form.label')}
							placeholder={t('mfa.password_form.placeholder')}
							required
							size='sm'
							{...disableForm.getInputProps('password')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								color='red'
								size='sm'
								loading={disableMFAMutation.isPending}
								disabled={!disableForm.isValid()}
							>
								{t('mfa.password_form.disable_submit')}
							</Button>
							<Button
								type='button'
								variant='default'
								size='sm'
								onClick={handleCancelDisable}
								disabled={disableMFAMutation.isPending}
							>
								{t('mfa.password_form.cancel_button')}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default MFASection;
