import {
	TextInput,
	PasswordInput,
	Button,
	Paper,
	Text,
	Stack,
	Alert,
	Loader,
	Group,
	Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconAt,
	IconLock,
	IconAlertCircle,
	IconEye,
	IconEyeOff,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogin } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './LoginForm.module.css';
import Logo from '~/components/Logo';
import { MFALoginResponse } from '~/api/authApi';
import { APP_VERSION } from '~/version';
import OTPVerificationModal from './OTPVerificationModal';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';

interface FormValues {
	username: string;
	password: string;
	rememberMe: boolean;
	loginType: 'USER_PASS' | 'LDAP';
}

export function LoginForm() {
	const loginMutation = useLogin();
	const navigate = useNavigate();
	const [formError, setFormError] = useState<string | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
	const [pendingLoginData, setPendingLoginData] =
		useState<MFALoginResponse | null>(null);

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

	return (
		<div className={classes.wrapper}>
			<Paper className={classes.paper} radius='xl'>
				<div className={classes.header}>
					<div className={classes.logo}>
						<Logo />
					</div>
					<Text className={classes.subtitle} size='sm' c='dimmed'>
						Sign in to manage your agents and campaigns
					</Text>
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

								if (result?.otpEnabled) {
									// Show OTP modal
									setPendingLoginData(result);
									setOtpModalOpened(true);
								} else {
									// Direct login success, navigate to dashboard
									navigate('/');
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
							<Group gap='sm'>
								<Loader size='sm' />
								<Text size='sm' c='dimmed'>
									Signing in...
								</Text>
							</Group>
						</div>
					)}
					<Stack gap='xs'>
						<AppSegmentedControl
							fullWidth
							value={form.values.loginType}
							onChange={(v) => form.setFieldValue('loginType', v as any)}
							data={[
								{ label: 'Credentials', value: 'USER_PASS' },
								{ label: 'LDAP', value: 'LDAP' },
							]}
						/>
						<Divider className={classes.sectionDivider} />
						<div>
							<Text className={classes.inputLabel} mb={4}>
								Username <span className={classes.requiredMark}>*</span>
							</Text>
							<TextInput
								required
								placeholder={
									form.values.loginType === 'USER_PASS'
										? 'Enter your username'
										: 'Enter your LDAP username'
								}
								leftSection={
									<IconAt className={classes.inputIcon} stroke={1.5} />
								}
								leftSectionPointerEvents='none'
								classNames={{
									input: classes.input,
									root: classes.inputRoot,
								}}
								{...form.getInputProps('username')}
								name='username'
								autoComplete='username'
							/>
						</div>

						<div>
							<Text className={classes.inputLabel} mb={4}>
								Password <span className={classes.requiredMark}>*</span>
							</Text>
							<PasswordInput
								required
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
									visibilityToggle: classes.visibilityToggle,
								}}
								{...form.getInputProps('password')}
								name='password'
								autoComplete='current-password'
							/>
						</div>

						{/* loginType is selected at the top of the form */}
						{/* Form error alert */}
						{formError && (
							<Alert
								variant='light'
								color='red'
								title='Login failed'
								icon={<IconAlertCircle size={18} />}
								mb='md'
								radius='md'
								p='sm'
								className={classes.errorMessage}
							>
								{formError}
							</Alert>
						)}

						<Button
							type='submit'
							fullWidth
							mt='md'
							className={classes.submitButton}
							loading={isLoading}
							loaderProps={{ type: 'dots' }}
							leftSection={!isLoading && <IconLock size={18} stroke={1.5} />}
							disabled={isLoading}
						>
							Sign in
						</Button>
					</Stack>
				</form>
			</Paper>
			<div className={classes.footer}>
				<Text size='xs' c='dimmed' className={classes.version}>
					Version {APP_VERSION}
				</Text>
			</div>

			{/* OTP Verification Modal */}
			<OTPVerificationModal
				opened={otpModalOpened}
				onClose={handleOTPModalClose}
				userId={pendingLoginData?.userId || 0}
				onSuccess={handleOTPSuccess}
			/>
		</div>
	);
}
