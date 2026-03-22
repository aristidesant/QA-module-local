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
	Grid,
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
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLogin } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { useTranslation } from 'react-i18next';
import classes from './LoginForm.module.css';
import Logo from '~/components/Logo';
import { ClientSelectOption, MFALoginResponse } from '~/api/authApi';
import { APP_VERSION } from '~/version';
import OTPVerificationModal from './OTPVerificationModal';
import ClientSelectionModal from './ClientSelectionModal';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { usePasswordResetStore } from '~/stores/passwordResetStore';
import { useSessionStore } from '~/stores/sessionStore';
import LanguagePicker from '~/components/LanguagePicker';

type LoginType = 'USER_PASS' | 'LDAP';

interface FormValues {
	username: string;
	password: string;
	loginType: LoginType;
}

export function LoginForm() {
	const loginMutation = useLogin();
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation('auth');
	const { setToken, setUser, setTargetClient } = useSessionStore();
	const { setPendingCredentials, clearPendingCredentials } =
		usePasswordResetStore();
	const [formError, setFormError] = useState<string | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
	const [pendingLoginData, setPendingLoginData] =
		useState<MFALoginResponse | null>(null);
	const [passwordVisible, setPasswordVisible] = useState(false);
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
	const logoutReason = new URLSearchParams(location.search).get('reason');
	const formErrorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Defensive: ensure no stale token remains when landing on /login.
		try {
			window.sessionStorage.removeItem('accessToken');
		} catch {
			// ignore storage errors
		}
		setUser(null);
		setTargetClient(null);
		setToken(null);
	}, [setTargetClient, setToken, setUser]);

	const form = useForm<FormValues>({
		initialValues: {
			username: '',
			password: '',
			// default to USER_PASS so existing users keep normal behavior
			loginType: 'USER_PASS',
		},
		// Ensure the form never performs native submission
		onSubmitPreventDefault: 'always',
		validate: {
			username: (value) => (!value.trim() ? t('username.required') : null),
			password: (value) => (!value ? t('password.required') : null),
		},
	});

	useEffect(() => {
		if (formError) {
			formErrorRef.current?.focus();
		}
	}, [formError]);

	const handleValidationFailure = (
		errors: Partial<Record<keyof FormValues, string>>
	) => {
		const firstInvalidField = (['username', 'password'] as const).find(
			(field) => errors[field]
		);
		if (firstInvalidField) {
			form.getInputNode(firstInvalidField)?.focus();
		}
	};

	const handleSubmit = async (values: FormValues) => {
		if (isLoading) {
			return;
		}

		setFormError(null);
		try {
			const result: MFALoginResponse = await loginMutation.mutateAsync({
				username: values.username,
				password: values.password,
				loginType: values.loginType,
			});

			// Case: User has access to multiple clients
			if (result?.requiresClientSelection && result?.availableClients) {
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
		} catch (err: unknown) {
			setFormError(getErrorMessage(err));
		}
	};

	const clearFormError = () => {
		if (formError) {
			setFormError(null);
		}
	};

	const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'Enter' || event.nativeEvent.isComposing || isLoading) {
			return;
		}

		event.preventDefault();
		event.currentTarget.form?.requestSubmit();
	};

	const usernameInputProps = form.getInputProps('username');
	const passwordInputProps = form.getInputProps('password');

	const handleLoginTypeChange = (value: string) => {
		if (value !== 'USER_PASS' && value !== 'LDAP') {
			return;
		}
		clearFormError();
		form.setFieldValue('loginType', value);
	};

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
				<form
					className={classes.formContainer}
					onSubmit={form.onSubmit(handleSubmit, handleValidationFailure)}
					aria-busy={isLoading}
				>
					{(isSubmitting || isRedirecting) && (
						<div className={classes.loadingOverlay}>
							<Stack gap='sm' align='center'>
								<Loader size='md' type='dots' color='blue' />
								<Text size='sm' fw={600} c='blue.7'>
									{t('actions.signingIn')}
								</Text>
							</Stack>
						</div>
					)}

					<Grid gutter={{ base: 'lg', md: 'xl' }} align='stretch'>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<div className={classes.header}>
								<Box className={classes.logoContainer}>
									<Logo />
								</Box>
								<div className={classes.headerText}>
									<Title order={2} className={classes.title}>
										{t('welcome')}
									</Title>
									<Text className={classes.subtitle}>{t('subtitle')}</Text>
								</div>

								<div className={classes.languagePicker}>
									<LanguagePicker variant='subtle' size='sm' />
								</div>
							</div>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 7 }}>
							<Stack gap='md' className={classes.formColumn}>
								{logoutReason === 'expired' && (
									<Alert
										variant='light'
										color='red'
										title={t('errors.sessionExpired.title')}
										icon={<IconAlertCircle size={20} />}
										radius='lg'
										className={classes.errorMessage}
									>
										{t('errors.sessionExpired.message')}
									</Alert>
								)}

								<Box className={classes.segmentedWrapper}>
									<AppSegmentedControl
										fullWidth
										value={form.values.loginType}
										onChange={handleLoginTypeChange}
										data={[
											{ label: t('loginType.credentials'), value: 'USER_PASS' },
											{ label: t('loginType.ldap'), value: 'LDAP' },
										]}
									/>
								</Box>

								<Stack gap='sm'>
									<TextInput
										required
										label={t('username.label')}
										placeholder={
											form.values.loginType === 'USER_PASS'
												? t('username.placeholder')
												: t('username.ldapPlaceholder')
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
										{...usernameInputProps}
										onChange={(event) => {
											clearFormError();
											usernameInputProps.onChange(event);
										}}
										onKeyDown={handleFieldKeyDown}
										name='username'
										autoComplete='username'
										autoFocus
									/>

									<PasswordInput
										required
										label={t('password.label')}
										placeholder={t('password.placeholder')}
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
										{...passwordInputProps}
										onChange={(event) => {
											clearFormError();
											passwordInputProps.onChange(event);
										}}
										onKeyDown={handleFieldKeyDown}
										visibilityToggleButtonProps={{
											'aria-label': passwordVisible
												? t('password.visibility.hide')
												: t('password.visibility.show'),
										}}
										visible={passwordVisible}
										onVisibilityChange={setPasswordVisible}
										name='password'
										autoComplete='current-password'
										aria-describedby={
											formError ? 'login-form-error' : undefined
										}
									/>
								</Stack>

								{formError && (
									<Alert
										id='login-form-error'
										variant='light'
										color='red'
										title={t('errors.signInFailedTitle')}
										icon={<IconAlertCircle size={20} />}
										radius='lg'
										className={classes.errorMessage}
										role='alert'
										aria-live='assertive'
										tabIndex={-1}
										ref={formErrorRef}
									>
										{formError === 'Unable to sign in'
											? t('errors.unableToSignIn')
											: formError}
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
									{t('actions.signIn')}
								</Button>
							</Stack>
						</Grid.Col>
					</Grid>
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
