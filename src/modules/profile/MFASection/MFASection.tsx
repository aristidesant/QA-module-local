import { useState } from 'react';
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
} from '~/queries/userQueries';
import { useSessionStore } from '~/stores/sessionStore';
import styles from '../ProfilePage.module.css';

export const MFASection: React.FC = () => {
	const { user } = useSessionStore();
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [secret, setSecret] = useState<string | null>(null);
	const [showDisableForm, setShowDisableForm] = useState(false);

	const enableMFAMutation = useEnableMFA();
	const verifyMFAMutation = useVerifyAndEnableMFA();
	const disableMFAMutation = useDisableMFA();

	// Check if MFA is enabled from user data or auth response
	const isMFAEnabled = user?.mfaEnabled || false;

	const verifyForm = useForm({
		initialValues: {
			code: '',
		},
		validate: {
			code: (value) => (value.length !== 6 ? 'Code must be 6 digits' : null),
		},
	});

	const disableForm = useForm({
		initialValues: {
			password: '',
		},
		validate: {
			password: (value) => (value.length === 0 ? 'Password is required' : null),
		},
	});

	const handleEnableMFA = async () => {
		try {
			const response = await enableMFAMutation.mutateAsync();
			setQrCodeUrl(response.qrCodeUrl);
			setSecret(response.secret);
		} catch (error: any) {
			notifications.show({
				title: 'Setup Failed',
				message:
					error?.response?.data?.message ||
					'Unable to start two-factor authentication setup. Please try again in a few moments.',
				color: 'red',
				icon: <IconX size={18} />,
			});
		}
	};

	const handleVerifyMFA = verifyForm.onSubmit(async (values) => {
		try {
			await verifyMFAMutation.mutateAsync({ code: values.code });

			notifications.show({
				title: 'Two-Factor Authentication Enabled',
				message:
					"Your account is now protected with two-factor authentication. You'll need your authenticator app to sign in.",
				color: 'green',
				icon: <IconCheck size={18} />,
			});

			// Reset state
			setQrCodeUrl(null);
			setSecret(null);
			verifyForm.reset();
		} catch (error: any) {
			notifications.show({
				title: 'Verification Failed',
				message:
					error?.response?.data?.message ||
					'The code you entered is invalid or has expired. Please check your authenticator app and try again.',
				color: 'red',
				icon: <IconX size={18} />,
			});
		}
	});

	const handleDisableMFA = disableForm.onSubmit(async (values) => {
		try {
			await disableMFAMutation.mutateAsync({ password: values.password });

			notifications.show({
				title: 'Two-Factor Authentication Disabled',
				message:
					'Two-factor authentication has been turned off. Your account is now less secure. Consider re-enabling it for better protection.',
				color: 'yellow',
				icon: <IconCheck size={18} />,
			});

			disableForm.reset();
			setShowDisableForm(false);
		} catch (error: any) {
			notifications.show({
				title: 'Unable to Disable',
				message:
					error?.response?.data?.message ||
					'Cannot disable two-factor authentication. Please verify your password is correct and try again.',
				color: 'red',
				icon: <IconX size={18} />,
			});
		}
	});

	const handleCancelSetup = () => {
		setQrCodeUrl(null);
		setSecret(null);
		verifyForm.reset();
	};

	const handleCancelDisable = () => {
		setShowDisableForm(false);
		disableForm.reset();
	};

	return (
		<div className={styles.sectionCard}>
			<div className={styles.sectionHeader}>
				<IconShieldCheck className={styles.sectionIcon} size={24} />
				<div style={{ flex: 1 }}>
					<h2 className={styles.sectionTitle}>
						Two-Factor Authentication (MFA)
					</h2>
				</div>
				<div
					className={`${styles.statusBadge} ${
						isMFAEnabled ? styles.enabled : styles.disabled
					}`}
				>
					{isMFAEnabled ? (
						<>
							<IconShieldCheck size={16} />
							<span>Enabled</span>
						</>
					) : (
						<>
							<IconShieldOff size={16} />
							<span>Disabled</span>
						</>
					)}
				</div>
			</div>

			<p className={styles.sectionDescription}>
				Enhance your account security by requiring both your password and a
				time-sensitive verification code from your mobile device when signing
				in. This significantly reduces the risk of unauthorized access.
			</p>

			{!isMFAEnabled && !qrCodeUrl && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='Setup Instructions'
						color='blue'
						variant='light'
					>
						<ol className={styles.stepList}>
							<li>
								Download an authenticator app like Google Authenticator,
								Microsoft Authenticator, or Authy on your mobile device
							</li>
							<li>
								Scan the QR code with your authenticator app, or enter the
								secret key manually
							</li>
							<li>
								Enter the 6-digit verification code generated by the app to
								complete setup
							</li>
						</ol>
					</Alert>{' '}
					<div className={styles.formActions}>
						<Button
							onClick={handleEnableMFA}
							loading={enableMFAMutation.isPending}
							leftSection={<IconShieldCheck size={18} />}
						>
							Enable MFA
						</Button>
					</div>
				</>
			)}

			{qrCodeUrl && (
				<>
					<div className={styles.qrCodeContainer}>
						<p className={styles.infoText}>
							Scan this QR code using your authenticator app
						</p>
						<div className={styles.qrCode}>
							<img src={qrCodeUrl} alt='MFA QR Code' width={200} height={200} />
						</div>
						{secret && (
							<div>
								<p
									className={styles.infoText}
									style={{ marginBottom: 4, textAlign: 'center' }}
								>
									Can't scan? Enter this secret key manually in your app:
								</p>
								<div className={styles.secretKey}>{secret}</div>
							</div>
						)}
					</div>

					<form onSubmit={handleVerifyMFA} className={styles.form}>
						<TextInput
							label='Verification Code'
							placeholder='Enter 6-digit code'
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
								Verify and Enable
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelSetup}
								disabled={verifyMFAMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</form>
				</>
			)}

			{isMFAEnabled && !showDisableForm && (
				<>
					<Alert
						icon={<IconShieldCheck size={16} />}
						title='Protected and Secure'
						color='green'
						variant='light'
					>
						Your account is currently protected with two-factor authentication.
						Each time you sign in, you'll be prompted to enter a verification
						code from your authenticator app for added security.
					</Alert>{' '}
					<div className={styles.formActions}>
						<Button
							variant='outline'
							color='red'
							onClick={() => setShowDisableForm(true)}
							leftSection={<IconShieldOff size={18} />}
						>
							Disable MFA
						</Button>
					</div>
				</>
			)}

			{isMFAEnabled && showDisableForm && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='Security Warning'
						color='orange'
						variant='light'
					>
						Disabling two-factor authentication will significantly reduce your
						account's security. Your account will only be protected by your
						password. Please enter your password to confirm this action.
					</Alert>{' '}
					<form onSubmit={handleDisableMFA} className={styles.form}>
						<PasswordInput
							label='Password'
							placeholder='Enter your password'
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
								Disable MFA
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelDisable}
								disabled={disableMFAMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</form>
				</>
			)}
		</div>
	);
};
