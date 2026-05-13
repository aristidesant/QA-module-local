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
import { ClientSelectOption, MFALoginResponse } from '~/api/authApi';
import { APP_VERSION } from '~/version';
import OTPVerificationModal from './OTPVerificationModal';
import ClientSelectionModal from './ClientSelectionModal';
import ForgotPasswordModal from './ForgotPasswordModal';
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
			leftSection: <IconUser size={16} stroke={1.5} />,
		},
		{
			label: t('loginType.ldap'),
			value: 'LDAP' as const,
			leftSection: <IconShieldCheck size={16} stroke={1.5} />,
		},
	];

	const themeOptions = [
		{ label: <IconSun size={15} stroke={1.5} />, value: 'light' },
		{ label: <IconMoon size={15} stroke={1.5} />, value: 'dark' },
		{ label: <IconDeviceDesktop size={15} stroke={1.5} />, value: 'auto' },
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
				>
					<div className={classes.contentGrid}>
						{/* LEFT: Brand panel */}
						<section
							className={classes.brandPanel}
							aria-label='Newtech Unified CXM'
						>
							<svg
								className={classes.nodeMotif}
								viewBox='0 0 300 720'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								aria-hidden='true'
								preserveAspectRatio='xMidYMid slice'
							>
								<line
									x1='40'
									y1='110'
									x2='160'
									y2='200'
									stroke='rgba(255,255,255,0.10)'
									strokeWidth='1'
								/>
								<line
									x1='160'
									y1='200'
									x2='255'
									y2='130'
									stroke='rgba(255,255,255,0.10)'
									strokeWidth='1'
								/>
								<line
									x1='160'
									y1='200'
									x2='120'
									y2='340'
									stroke='rgba(255,255,255,0.11)'
									strokeWidth='1'
								/>
								<line
									x1='120'
									y1='340'
									x2='230'
									y2='420'
									stroke='rgba(255,255,255,0.09)'
									strokeWidth='1'
								/>
								<line
									x1='255'
									y1='130'
									x2='280'
									y2='280'
									stroke='rgba(255,255,255,0.07)'
									strokeWidth='1'
								/>
								<line
									x1='280'
									y1='280'
									x2='230'
									y2='420'
									stroke='rgba(255,255,255,0.09)'
									strokeWidth='1'
								/>
								<line
									x1='28'
									y1='390'
									x2='120'
									y2='340'
									stroke='rgba(255,255,255,0.07)'
									strokeWidth='1'
								/>
								<line
									x1='28'
									y1='390'
									x2='75'
									y2='520'
									stroke='rgba(255,255,255,0.07)'
									strokeWidth='1'
								/>
								<line
									x1='230'
									y1='420'
									x2='255'
									y2='555'
									stroke='rgba(255,255,255,0.07)'
									strokeWidth='1'
								/>
								<line
									x1='18'
									y1='210'
									x2='40'
									y2='110'
									stroke='rgba(255,255,255,0.06)'
									strokeWidth='1'
								/>
								<line
									x1='75'
									y1='520'
									x2='140'
									y2='630'
									stroke='rgba(255,255,255,0.05)'
									strokeWidth='1'
								/>
								<line
									x1='255'
									y1='555'
									x2='195'
									y2='645'
									stroke='rgba(255,255,255,0.05)'
									strokeWidth='1'
								/>
								<circle
									cx='160'
									cy='200'
									r='7'
									fill='rgba(255,255,255,0.16)'
									stroke='rgba(255,255,255,0.28)'
									strokeWidth='1.5'
								/>
								<circle
									cx='230'
									cy='420'
									r='6'
									fill='rgba(255,255,255,0.14)'
									stroke='rgba(255,255,255,0.22)'
									strokeWidth='1.5'
								/>
								<circle
									cx='40'
									cy='110'
									r='4.5'
									fill='rgba(255,255,255,0.13)'
								/>
								<circle cx='255' cy='130' r='4' fill='rgba(255,255,255,0.12)' />
								<circle cx='120' cy='340' r='5' fill='rgba(255,255,255,0.13)' />
								<circle
									cx='280'
									cy='280'
									r='3.5'
									fill='rgba(255,255,255,0.10)'
								/>
								<circle
									cx='28'
									cy='390'
									r='3.5'
									fill='rgba(255,255,255,0.10)'
								/>
								<circle cx='75' cy='520' r='4' fill='rgba(255,255,255,0.10)' />
								<circle
									cx='255'
									cy='555'
									r='3.5'
									fill='rgba(255,255,255,0.08)'
								/>
								<circle cx='140' cy='630' r='3' fill='rgba(255,255,255,0.07)' />
								<circle cx='195' cy='645' r='3' fill='rgba(255,255,255,0.06)' />
								<circle cx='18' cy='210' r='3' fill='rgba(255,255,255,0.08)' />
							</svg>

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
									<div className={classes.brandRule} />
									<p className={classes.brandTagline}>{t('subtitle')}</p>
								</div>
							</div>

							<div className={classes.brandFooter}>
								<IconShieldCheck size={13} stroke={1.5} aria-hidden='true' />
								<span className={classes.brandSecureText}>
									{t('secureConnection')}
								</span>
							</div>
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

							<div className={classes.formSettingsBar}>
								<LanguagePicker variant='default' size='xs' />
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

								<div className={classes.formHeadingBlock}>
									<Title order={2} className={classes.formHeading}>
										{t('welcomeBack')}
									</Title>
								</div>

								<AppSegmentedControl
									aria-label={t('loginType.label')}
									value={form.values.loginType}
									onChange={handleLoginTypeChange}
									data={loginTypeOptions}
									size='sm'
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

								<Text className={classes.versionText}>v{APP_VERSION}</Text>
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
