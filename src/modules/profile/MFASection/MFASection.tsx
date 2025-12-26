import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, TextInput, PasswordInput, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconShieldCheck,
	IconCheck,
	IconX,
	IconInfoCircle,
	IconShieldOff,
} from '@tabler/icons-react';
import {
	useEnableMFA,
	useVerifyAndEnableMFA,
	useDisableMFA,
	useCurrentUser,
} from '~/queries/userQueries';
import { useSessionStore } from '~/stores/sessionStore';
import { SectionCard } from '~/components/SectionCard/SectionCard';
import styles from '../ProfilePage.module.css';

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

	return (
		<SectionCard
			title={t('mfa.title')}
			description={t('mfa.description')}
			icon={IconShieldCheck}
			headerActions={
				<div
					className={`${styles.statusBadge} ${
						isMFAEnabled ? styles.enabled : styles.disabled
					}`}
				>
					{isMFAEnabled ? (
						<>
							<IconShieldCheck size={16} />
							<span>{t('mfa.status_enabled')}</span>
						</>
					) : (
						<>
							<IconShieldOff size={16} />
							<span>{t('mfa.status_disabled')}</span>
						</>
					)}
				</div>
			}
		>
			{!isMFAEnabled && !qrCodeUrl && !showEnableForm && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('mfa.how_it_works.title')}
						color='blue'
						variant='light'
					>
						<ol className={styles.stepList}>
							<li>{t('mfa.how_it_works.step1')}</li>
							<li>{t('mfa.how_it_works.step2')}</li>
							<li>{t('mfa.how_it_works.step3')}</li>
							<li>{t('mfa.how_it_works.step4')}</li>
							<li>{t('mfa.how_it_works.step5')}</li>
						</ol>
					</Alert>{' '}
					<div className={styles.formActions}>
						<Button
							onClick={() => setShowEnableForm(true)}
							leftSection={<IconShieldCheck size={18} />}
						>
							{t('mfa.enable_button')}
						</Button>
					</div>
				</>
			)}
			{!isMFAEnabled && showEnableForm && !qrCodeUrl && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('mfa.confirm_identity.title')}
						color='blue'
						variant='light'
					>
						{t('mfa.confirm_identity.message')}
					</Alert>{' '}
					<form onSubmit={handleEnableMFA} className={styles.form}>
						<PasswordInput
							label={t('mfa.password_form.label')}
							placeholder={t('mfa.password_form.placeholder')}
							required
							{...enableForm.getInputProps('password')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								loading={enableMFAMutation.isPending}
								disabled={!enableForm.isValid()}
							>
								{t('mfa.password_form.continue_button')}
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelEnable}
								disabled={enableMFAMutation.isPending}
							>
								{t('mfa.password_form.cancel_button')}
							</Button>
						</div>
					</form>
				</>
			)}{' '}
			{qrCodeUrl && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('mfa.code_sent.title')}
						color='blue'
						variant='light'
					>
						<Trans
							i18nKey='mfa.code_sent.message'
							values={{ email: user?.email }}
							components={{ strong: <strong /> }}
						/>
					</Alert>

					<form onSubmit={handleVerifyMFA} className={styles.form}>
						<TextInput
							label={t('mfa.verify_form.code_label')}
							placeholder={t('mfa.verify_form.code_placeholder')}
							required
							maxLength={6}
							{...verifyForm.getInputProps('code')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								loading={verifyMFAMutation.isPending}
								disabled={!verifyForm.isValid()}
							>
								{t('mfa.verify_form.verify_button')}
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelSetup}
								disabled={verifyMFAMutation.isPending}
							>
								{t('mfa.verify_form.cancel_button')}
							</Button>
						</div>
					</form>
				</>
			)}
			{isMFAEnabled && !showDisableForm && (
				<>
					<Alert
						icon={<IconShieldCheck size={16} />}
						title={t('mfa.protected.title')}
						color='green'
						variant='light'
					>
						{t('mfa.protected.message')}
					</Alert>{' '}
					<div className={styles.formActions}>
						<Button
							variant='outline'
							color='red'
							onClick={() => setShowDisableForm(true)}
							leftSection={<IconShieldOff size={18} />}
						>
							{t('mfa.disable_button')}
						</Button>
					</div>
				</>
			)}
			{isMFAEnabled && showDisableForm && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('mfa.disable_warning.title')}
						color='orange'
						variant='light'
					>
						{t('mfa.disable_warning.message')}
					</Alert>{' '}
					<form onSubmit={handleDisableMFA} className={styles.form}>
						<PasswordInput
							label={t('mfa.password_form.label')}
							placeholder={t('mfa.password_form.placeholder')}
							required
							{...disableForm.getInputProps('password')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								color='red'
								loading={disableMFAMutation.isPending}
								disabled={!disableForm.isValid()}
							>
								{t('mfa.password_form.disable_submit')}
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelDisable}
								disabled={disableMFAMutation.isPending}
							>
								{t('mfa.password_form.cancel_button')}
							</Button>
						</div>
					</form>
				</>
			)}
		</SectionCard>
	);
};
