import {
	TextInput,
	PasswordInput,
	Button,
	Paper,
	Text,
	Stack,
	Alert,
	Loader,
	Title,
	Group,
	Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconUser,
	IconLock,
	IconAlertCircle,
	IconEye,
	IconEyeOff,
	IconArrowRight,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogin } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './LoginForm.module.css';
import Logo from '~/components/Logo';
import { ClientSelectOption, MFALoginResponse } from '~/api/authApi';
import { APP_VERSION } from '~/version';
import OTPVerificationModal from './OTPVerificationModal';
import ClientSelectionModal from './ClientSelectionModal';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { usePasswordResetStore } from '~/stores/passwordResetStore';

interface FormValues {
	username: string;
	password: string;
	rememberMe: boolean;
	loginType: 'USER_PASS' | 'LDAP';
}

export function LoginForm() {
	const loginMutation = useLogin();
	const navigate = useNavigate();
	const { setPendingCredentials, clearPendingCredentials } =
		usePasswordResetStore();
	const [formError, setFormError] = useState<string | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
	const [pendingLoginData, setPendingLoginData] =
		useState<MFALoginResponse | null>(null);
	// Multi-client selection state
	const [clientSelectionModalOpened, setClientSelectionModalOpened] =
		useState(false);
	const [availableClients, setAvailableClients] = useState<
		ClientSelectOption[]
	>([]);
	const [preAuthToken, setPreAuthToken] = useState<string | null>(null);

	const isSubmitting = loginMutation.isPending;
	const isRedirecting = false;
	const isLoading = isSubmitting || isRedirecting;

	const form = useForm<FormValues>({
		initialValues: {
			username: '',
			password: '',
			rememberMe: false,
			// default to USER_PASS so existing users keep normal behavior
			loginType: 'USER_PASS',
		},
		// Ensure the form never performs native submission
		onSubmitPreventDefault: 'always',
		validate: {
			username: (value) => (!value.trim() ? 'Username is required' : null),
			password: (value) => (!value ? 'Password is required' : null),
		},
	});

	// We'll set form-level errors from the submit handler directly

	const handleOTPSuccess = () => {
		setOtpModalOpened(false);
		setPendingLoginData(null);
		navigate('/');
	};

	const handleOTPModalClose = () => {
		setOtpModalOpened(false);
		setPendingLoginData(null);
	};

	const handleClientSelectionSuccess = () => {
		setClientSelectionModalOpened(false);
		setAvailableClients([]);
		setPreAuthToken(null);
		navigate('/');
	};

	const handleClientSelectionModalClose = () => {
		setClientSelectionModalOpened(false);
		setAvailableClients([]);
		setPreAuthToken(null);
	};

	return (
		<div className={classes.wrapper}>
			<Paper className={classes.paper} radius='xl'>
				<div className={classes.header}>
					<Box className={classes.logoContainer}>
						<Logo />
					</Box>
					<div className={classes.headerText}>
						<Title order={2} className={classes.title}>
							Welcome back
						</Title>
						<Text className={classes.subtitle}>
							Sign in to manage your agents and campaigns
						</Text>
					</div>
				</div>

				<form
					className={classes.formContainer}
					onSubmit={(e) => {
						// Extra safety: prevent native submit even if Mantine config changes
						e.preventDefault();
						return form.onSubmit(async (values) => {
							setFormError(null);
							try {
								const result: MFALoginResponse =
									await loginMutation.mutateAsync({
										username: values.username,
										password: values.password,
										loginType: values.loginType,
									});

								// Case: User has access to multiple clients
								if (
									result?.requiresClientSelection &&
									result?.availableClients
								) {
									setAvailableClients(result.availableClients);
									setPreAuthToken(result.preAuthToken || null);
									setClientSelectionModalOpened(true);
									clearPendingCredentials();
									return;
								}

								if (result?.otpEnabled) {
									// Show OTP modal
									setPendingLoginData(result);
									setOtpModalOpened(true);
									clearPendingCredentials();
								} else {
									const requiresPasswordUpdate =
										result?.needToChangePassword ??
										result?.user?.needToChangePassword ??
										false;

									if (requiresPasswordUpdate) {
										setPendingCredentials(values.username, values.loginType);
										navigate('/force-password-change', {
											replace: true,
											state: {
												username: values.username,
												loginType: values.loginType,
											},
										});
									} else {
										// Direct login success, navigate to dashboard
										clearPendingCredentials();
										navigate('/');
									}
								}
							} catch (err: any) {
								setFormError(getErrorMessage(err));
							}
						})(e);
					}}
				>
					{/* Loading overlay */}
					{(isSubmitting || isRedirecting) && (
						<div className={classes.loadingOverlay}>
							<Stack gap='sm' align='center'>
								<Loader size='md' type='dots' color='blue' />
								<Text size='sm' fw={600} c='blue.7'>
									Signing in...
								</Text>
							</Stack>
						</div>
					)}
					<Stack gap='md'>
						<Box className={classes.segmentedWrapper}>
							<AppSegmentedControl
								fullWidth
								value={form.values.loginType}
								onChange={(v) => form.setFieldValue('loginType', v as any)}
								data={[
									{ label: 'Credentials', value: 'USER_PASS' },
									{ label: 'LDAP', value: 'LDAP' },
								]}
							/>
						</Box>

						<Stack gap='sm'>
							<TextInput
								required
								label='Username'
								placeholder={
									form.values.loginType === 'USER_PASS'
										? 'Enter your username'
										: 'Enter your LDAP username'
								}
								leftSection={
									<IconUser className={classes.inputIcon} stroke={1.5} />
								}
								leftSectionPointerEvents='none'
								classNames={{
									input: classes.input,
									root: classes.inputRoot,
									label: classes.inputLabel,
								}}
								{...form.getInputProps('username')}
								name='username'
								autoComplete='username'
							/>

							<PasswordInput
								required
								label='Password'
								placeholder='Enter your password'
								leftSection={
									<IconLock className={classes.inputIcon} stroke={1.5} />
								}
								leftSectionPointerEvents='none'
								visibilityToggleIcon={({ reveal }) =>
									reveal ? (
										<IconEyeOff size={18} stroke={1.5} />
									) : (
										<IconEye size={18} stroke={1.5} />
									)
								}
								classNames={{
									input: classes.input,
									root: classes.inputRoot,
									label: classes.inputLabel,
									visibilityToggle: classes.visibilityToggle,
								}}
								{...form.getInputProps('password')}
								name='password'
								autoComplete='current-password'
							/>
						</Stack>

						{/* Form error alert */}
						{formError && (
							<Alert
								variant='light'
								color='red'
								title='Unable to sign in'
								icon={<IconAlertCircle size={20} />}
								radius='lg'
								className={classes.errorMessage}
							>
								{formError}
							</Alert>
						)}

						<Button
							type='submit'
							fullWidth
							mt='sm'
							className={classes.submitButton}
							loading={isLoading}
							loaderProps={{ type: 'dots' }}
							rightSection={
								!isLoading && <IconArrowRight size={18} stroke={2} />
							}
							disabled={isLoading}
						>
							Sign in
						</Button>
					</Stack>
				</form>
			</Paper>

			<Group className={classes.footer} gap='xs'>
				<Text size='xs' className={classes.version}>
					v{APP_VERSION}
				</Text>
			</Group>

			{/* OTP Verification Modal */}
			<OTPVerificationModal
				opened={otpModalOpened}
				onClose={handleOTPModalClose}
				userId={pendingLoginData?.userId || 0}
				onSuccess={handleOTPSuccess}
			/>

			{/* Client Selection Modal */}
			<ClientSelectionModal
				opened={clientSelectionModalOpened}
				onClose={handleClientSelectionModalClose}
				availableClients={availableClients}
				preAuthToken={preAuthToken || ''}
				onSuccess={handleClientSelectionSuccess}
			/>
		</div>
	);
}
