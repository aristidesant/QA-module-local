import {
	TextInput,
	PasswordInput,
	Button,
	Text,
	Alert,
	Loader,
	Title,
	Anchor,
	Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconUser,
	IconLock,
	IconAlertCircle,
	IconEye,
	IconEyeOff,
	IconArrowRight,
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
import { ClientSelectOption, MFALoginResponse } from '~/api/authApi';
import { APP_VERSION } from '~/version';
import OTPVerificationModal from './OTPVerificationModal';
import ClientSelectionModal from './ClientSelectionModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { usePasswordResetStore } from '~/stores/passwordResetStore';
import { useSessionStore } from '~/stores/sessionStore';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
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
	const { t, i18n } = useTranslation('auth');
	const { setToken, setUser, setTargetClient } = useSessionStore();
	const { setPendingCredentials, clearPendingCredentials } =
		usePasswordResetStore();
	const { preference, setPreference } = useColorSchemeStore();
	const [formError, setFormError] = useState<string | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
	const [pendingLoginData, setPendingLoginData] =
		useState<MFALoginResponse | null>(null);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [clientSelectionModalOpened, setClientSelectionModalOpened] =
		useState(false);
	const [availableClients, setAvailableClients] = useState<
		ClientSelectOption[]
	>([]);
	const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
	const [forgotPasswordModalOpened, setForgotPasswordModalOpened] =
		useState(false);

	const isLoading = loginMutation.isPending;
	const logoutReason = new URLSearchParams(location.search).get('reason');
	const formErrorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
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
		initialValues: { username: '', password: '', loginType: 'USER_PASS' },
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
			(f) => errors[f]
		);
		if (firstInvalidField) {
			form.getInputNode(firstInvalidField)?.focus();
		}
	};

	const handleSubmit = async (values: FormValues) => {
		if (isLoading) return;
		setFormError(null);
		try {
			const result: MFALoginResponse = await loginMutation.mutateAsync({
				username: values.username,
				password: values.password,
				loginType: values.loginType,
			});

			if (result?.requiresClientSelection && result?.availableClients) {
				setAvailableClients(result.availableClients);
				setPreAuthToken(result.preAuthToken || null);
				setClientSelectionModalOpened(true);
				clearPendingCredentials();
				return;
			}

			if (result?.otpEnabled) {
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
						state: { username: values.username, loginType: values.loginType },
					});
				} else {
					clearPendingCredentials();
					navigate('/');
				}
			}
		} catch (err: unknown) {
			setFormError(getErrorMessage(err));
		}
	};

	const clearFormError = () => {
		if (formError) setFormError(null);
	};

	const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'Enter' || event.nativeEvent.isComposing || isLoading)
			return;
		event.preventDefault();
		event.currentTarget.form?.requestSubmit();
	};

	const usernameInputProps = form.getInputProps('username');
	const passwordInputProps = form.getInputProps('password');

	const handleLoginTypeChange = (value: string) => {
		if (value !== 'USER_PASS' && value !== 'LDAP') return;
		clearFormError();
		form.setFieldValue('loginType', value);
	};

	const loginTypeOptions = [
		{
			label: t('loginType.credentials'),
			value: 'USER_PASS' as const,
		},
		{
			label: t('loginType.ldap'),
			value: 'LDAP' as const,
		},
	];

	const themeOptions = [
		{ label: <IconSun size={15} />, value: 'light' },
		{ label: <IconMoon size={15} />, value: 'dark' },
		{ label: <IconDeviceDesktop size={15} />, value: 'auto' },
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
			<div className={classes.card}>
				<form
					className={classes.formRoot}
					onSubmit={form.onSubmit(handleSubmit, handleValidationFailure)}
					aria-busy={isLoading}
					aria-label={t('actions.signIn')}
				>
					<div className={classes.contentGrid}>
						{/* LEFT: Brand panel */}
						<section className={classes.brandPanel}>
							<div className={classes.brandContent}>
								<div className={classes.brandIdentity}>
									<img
										src='/images/logo-2.png'
										alt='Newtech'
										className={classes.brandLogoImg}
									/>
									<div className={classes.brandWordmark}>
										<span className={classes.brandWordmarkMain}>
											{t('welcomePrefix')}
										</span>
										<span className={classes.brandWordmarkAccent}>
											{t('welcomeSuffix')}
										</span>
									</div>
								</div>

								<div className={classes.brandMessage}>
									<p className={classes.brandTagline}>{t('subtitle')}</p>
								</div>
							</div>

							<Text className={classes.brandVersion}>v{APP_VERSION}</Text>
						</section>

						{/* RIGHT: Form panel */}
						<section className={classes.formPanel}>
							{isLoading && (
								<div className={classes.loadingOverlay}>
									<div className={classes.loadingContent}>
										<Loader size='sm' type='dots' color='green' />
										<Text size='xs' fw={600} c='green.7'>
											{t('actions.signingIn')}
										</Text>
									</div>
								</div>
							)}

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

								<div className={classes.formHeadingGroup}>
									<Title order={2} className={classes.formHeading}>
										{t('welcomeBack')}
									</Title>

									<AppSegmentedControl
										aria-label={t('loginType.label')}
										value={form.values.loginType}
										onChange={handleLoginTypeChange}
										data={loginTypeOptions}
										size='sm'
										fullWidth
									/>
								</div>

								<div className={classes.formSection}>
									<div className={classes.fields}>
										<TextInput
											required
											label={t('username.label')}
											placeholder={
												form.values.loginType === 'USER_PASS'
													? t('username.placeholder')
													: t('username.ldapPlaceholder')
											}
											leftSection={<IconUser size={18} />}
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
											leftSection={<IconLock size={18} />}
											leftSectionPointerEvents='none'
											visibilityToggleIcon={({ reveal }) =>
												reveal ? (
													<IconEyeOff size={16} />
												) : (
													<IconEye size={16} />
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

									<Group justify='flex-end'>
										<Anchor
											component='button'
											type='button'
											size='sm'
											className={classes.forgotPasswordLink}
											onClick={() => setForgotPasswordModalOpened(true)}
										>
											{t('forgotPassword')}
										</Anchor>
									</Group>
								</div>

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
										{formError?.trim().toLowerCase() === 'unable to sign in'
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

								<div className={classes.formSettingsRow}>
									<div className={classes.settingsControl}>
										<AppSegmentedControl
											aria-label='Language'
											value={i18n.language?.split('-')[0] || 'en'}
											onChange={(value: string) => i18n.changeLanguage(value)}
											data={[
												{ label: 'EN', value: 'en' },
												{ label: 'ES', value: 'es' },
											]}
											size='xs'
										/>
									</div>
									<div className={classes.settingsDivider} />
									<div className={classes.settingsControl}>
										<AppSegmentedControl
											aria-label={t('theme.label')}
											value={preference}
											onChange={(value) =>
												setPreference(value as 'light' | 'dark' | 'auto')
											}
											data={themeOptions}
											size='xs'
										/>
									</div>
								</div>
							</div>
						</section>
					</div>
				</form>
			</div>

			<OTPVerificationModal
				opened={otpModalOpened}
				onClose={handleOTPModalClose}
				userId={pendingLoginData?.userId || 0}
				onSuccess={handleOTPSuccess}
			/>
			<ClientSelectionModal
				opened={clientSelectionModalOpened}
				onClose={handleClientSelectionModalClose}
				availableClients={availableClients}
				preAuthToken={preAuthToken || ''}
				onSuccess={handleClientSelectionSuccess}
			/>
			<ForgotPasswordModal
				opened={forgotPasswordModalOpened}
				onClose={() => setForgotPasswordModalOpened(false)}
			/>
		</div>
	);
}
