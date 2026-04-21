import {
	TextInput,
	PasswordInput,
	Button,
	Paper,
	Text,
	Alert,
	Loader,
	Title,
	Checkbox,
	Anchor,
	Group,
	ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconUser,
	IconLock,
	IconAlertCircle,
	IconEye,
	IconEyeOff,
	IconArrowRight,
	IconShieldCheck,
	IconSun,
	IconMoon,
	IconDeviceDesktop,
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
import { usePasswordResetStore } from '~/stores/passwordResetStore';
import { useSessionStore } from '~/stores/sessionStore';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import LanguagePicker from '~/components/LanguagePicker';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';

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
	const { preference, setPreference } = useColorSchemeStore();
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

	const loginTypeOptions = [
		{
			label: t('loginType.credentials'),
			value: 'USER_PASS' as const,
			leftSection: <IconUser size={16} stroke={1.5} />,
		},
		{
			label: t('loginType.ldap'),
			value: 'LDAP' as const,
			leftSection: <IconShieldCheck size={16} stroke={1.5} />,
		},
	];

	const themeOptions = [
		{
			label: <IconSun size={16} stroke={1.5} />,
			value: 'light',
		},
		{
			label: <IconMoon size={16} stroke={1.5} />,
			value: 'dark',
		},
		{
			label: <IconDeviceDesktop size={16} stroke={1.5} />,
			value: 'auto',
		},
	];

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
			<Paper className={classes.paper} shadow='md'>
				<form
					className={classes.formContainer}
					onSubmit={form.onSubmit(handleSubmit, handleValidationFailure)}
					aria-busy={isLoading}
				>
					{(isSubmitting || isRedirecting) && (
						<div className={classes.loadingOverlay}>
							<div className={classes.loadingContent}>
								<Loader size='md' type='dots' color='blue' />
								<Text size='sm' fw={600} c='blue.7'>
									{t('actions.signingIn')}
								</Text>
							</div>
						</div>
					)}

					<div className={classes.contentGrid}>
						{/* Left Panel - Branding */}
						<section className={classes.brandingPanel}>
							<div className={classes.brandingContent}>
								<div className={classes.logoContainer}>
									<Logo />
								</div>
								<div className={classes.brandingText}>
									<Title order={1} className={classes.brandTitle}>
										<span className={classes.brandTitlePrefix}>
											{t('welcomePrefix')}
										</span>
										<span className={classes.brandTitleAccent}>
											{t('welcomeSuffix')}
										</span>
									</Title>
									<div className={classes.brandRule} />
									<Title order={2} className={classes.brandHeading}>
										{t('welcomeBack')}
									</Title>
									<Text className={classes.subtitle}>{t('subtitle')}</Text>
								</div>
								<div className={classes.waveDecoration} />
								<div className={classes.settingsRow}>
									<LanguagePicker variant='default' size='sm' />
									<AppSegmentedControl
										aria-label={t('theme.label')}
										value={preference}
										onChange={(value) =>
											setPreference(value as 'light' | 'dark' | 'auto')
										}
										data={themeOptions}
										size='sm'
									/>
								</div>
							</div>
						</section>

						{/* Right Panel - Form */}
						<section className={classes.formPanel}>
							<div className={classes.formStack}>
								{logoutReason === 'expired' && (
									<Alert
										variant='light'
										color='red'
										title={t('errors.sessionExpired.title')}
										icon={<IconAlertCircle size={20} />}
										className={classes.errorMessage}
									>
										{t('errors.sessionExpired.message')}
									</Alert>
								)}

								<AppSegmentedControl
									aria-label={t('loginType.label')}
									value={form.values.loginType}
									onChange={handleLoginTypeChange}
									data={loginTypeOptions}
									size='md'
									fullWidth
								/>

								<div className={classes.fields}>
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
								</div>

								<Group justify='space-between' align='center' gap='xs'>
									<Checkbox
										label={t('rememberMe')}
										className={classes.rememberMe}
										classNames={{
											label: classes.checkboxLabel,
										}}
									/>
									<Anchor
										component='button'
										type='button'
										size='sm'
										className={classes.forgotPasswordLink}
									>
										{t('forgotPassword')}
									</Anchor>
								</Group>

								{formError && (
									<Alert
										id='login-form-error'
										variant='light'
										color='red'
										title={t('errors.signInFailedTitle')}
										icon={<IconAlertCircle size={20} />}
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
							</div>
						</section>
					</div>
				</form>
			</Paper>

			<div className={classes.footer}>
				<Group gap='xs' justify='center'>
					<ThemeIcon
						variant='transparent'
						size='sm'
						className={classes.footerIcon}
					>
						<IconShieldCheck size={16} stroke={1.5} />
					</ThemeIcon>
					<Text size='xs' className={classes.secureConnection}>
						{t('secureConnection')}
					</Text>
				</Group>
				<Text size='xs' className={classes.version}>
					v{APP_VERSION}
				</Text>
			</div>

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
