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
	useCurrentUser,
} from '~/queries/userQueries';
import { useSessionStore } from '~/stores/sessionStore';
import { SectionCard } from '~/components/SectionCard/SectionCard';
import styles from '../ProfilePage.module.css';

export const MFASection: React.FC = () => {
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
			password: (value) => (value.length === 0 ? 'Password is required' : null),
		},
	});

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

	const handleEnableMFA = enableForm.onSubmit(async (values) => {
		try {
			const response = await enableMFAMutation.mutateAsync({
				password: values.password,
			});

			notifications.show({
				title: 'MFA Setup Enabled',
				message: `Next time you log in, you'll need to enter a verification code from your email.`,
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
				title: 'Authentication Failed',
				message:
					error?.response?.data?.message ||
					'Unable to verify your password. Please check your password and try again.',
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
				title: '✓ Two-Factor Authentication Enabled',
				message:
					"Success! Your account is now protected with two-factor authentication. You'll need to enter a verification code from your email each time you sign in.",
				color: 'green',
				icon: <IconShieldCheck size={18} />,
				autoClose: 8000,
			});

			// Reset state
			setQrCodeUrl(null);
			verifyForm.reset();
		} catch (error: any) {
			notifications.show({
				title: 'Verification Failed',
				message:
					error?.response?.data?.message ||
					'The verification code you entered is invalid or has expired. Please request a new code or check your email for the most recent one.',
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
				title: 'Two-Factor Authentication Disabled',
				message:
					'Two-factor authentication has been successfully turned off. Your account security has been reduced. We strongly recommend re-enabling MFA to protect your account.',
				color: 'orange',
				icon: <IconShieldOff size={18} />,
				autoClose: 8000,
			});

			disableForm.reset();
			setShowDisableForm(false);
		} catch (error: any) {
			notifications.show({
				title: 'Authentication Failed',
				message:
					error?.response?.data?.message ||
					'Unable to disable two-factor authentication. Please verify your password is correct and try again.',
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
			title='Two-Factor Authentication (MFA)'
			description='Enhance your account security by requiring both your password and a verification code sent to your email address when signing in. This significantly reduces the risk of unauthorized access.'
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
							<span>Enabled</span>
						</>
					) : (
						<>
							<IconShieldOff size={16} />
							<span>Disabled</span>
						</>
					)}
				</div>
			}
		>
			{!isMFAEnabled && !qrCodeUrl && !showEnableForm && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='How Email-Based OTP Works'
						color='blue'
						variant='light'
					>
						<ol className={styles.stepList}>
							<li>Click "Enable MFA" to start the setup process</li>
							<li>Enter your password to confirm your identity</li>
							<li>
								A 6-digit verification code will be sent to your registered
								email address
							</li>
							<li>
								Enter the code from your email to complete the setup and
								activate MFA
							</li>
							<li>
								Future logins will require a code sent to your email for
								verification
							</li>
						</ol>
					</Alert>{' '}
					<div className={styles.formActions}>
						<Button
							onClick={() => setShowEnableForm(true)}
							leftSection={<IconShieldCheck size={18} />}
						>
							Enable MFA
						</Button>
					</div>
				</>
			)}
			{!isMFAEnabled && showEnableForm && !qrCodeUrl && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='Confirm Your Identity'
						color='blue'
						variant='light'
					>
						To enable two-factor authentication, please enter your current
						password to confirm your identity. This is an important security
						measure to ensure you're the account owner.
					</Alert>{' '}
					<form onSubmit={handleEnableMFA} className={styles.form}>
						<PasswordInput
							label='Password'
							placeholder='Enter your password'
							required
							{...enableForm.getInputProps('password')}
						/>

						<div className={styles.formActions}>
							<Button
								type='submit'
								loading={enableMFAMutation.isPending}
								disabled={!enableForm.isValid()}
							>
								Continue
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancelEnable}
								disabled={enableMFAMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</form>
				</>
			)}{' '}
			{qrCodeUrl && (
				<>
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='Verification Code Sent'
						color='blue'
						variant='light'
					>
						A 6-digit verification code has been sent to your email address{' '}
						<strong>{user?.email}</strong>. Please check your inbox (and spam
						folder) and enter the code below to complete the setup.
					</Alert>

					<form onSubmit={handleVerifyMFA} className={styles.form}>
						<TextInput
							label='Verification Code from Email'
							placeholder='Enter 6-digit code from your email'
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
						Each time you sign in, a verification code will be sent to your
						registered email address for added security.
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
		</SectionCard>
	);
};
