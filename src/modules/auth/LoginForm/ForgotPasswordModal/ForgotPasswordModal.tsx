import {
	Modal,
	Button,
	Stack,
	Text,
	Group,
	Alert,
	TextInput,
	PasswordInput,
	PinInput,
	Stepper,
	ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconAlertCircle,
	IconAt,
	IconCheck,
	IconLock,
	IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	useRequestPasswordReset,
	useResetPassword,
} from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { validateStrongPassword } from '~/utils/passwordHelper';
import classes from './ForgotPasswordModal.module.css';

interface ForgotPasswordModalProps {
	opened: boolean;
	onClose: () => void;
}

type Step = 0 | 1 | 2 | 3; // 0=email, 1=otp, 2=new-password, 3=success

interface EmailFormValues {
	email: string;
}

interface OtpFormValues {
	otp: string;
}

interface PasswordFormValues {
	newPassword: string;
	confirmPassword: string;
}

export default function ForgotPasswordModal({
	opened,
	onClose,
}: ForgotPasswordModalProps) {
	const { t } = useTranslation('auth');
	const requestResetMutation = useRequestPasswordReset();
	const resetPasswordMutation = useResetPassword();

	const [step, setStep] = useState<Step>(0);
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [stepError, setStepError] = useState<string | null>(null);

	const emailForm = useForm<EmailFormValues>({
		initialValues: { email: '' },
		validate: {
			email: (value) => {
				if (!value.trim()) return t('forgotPasswordFlow.step1.emailRequired');
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
					return t('forgotPasswordFlow.step1.emailInvalid');
				return null;
			},
		},
	});

	const otpForm = useForm<OtpFormValues>({
		initialValues: { otp: '' },
		validate: {
			otp: (value) => {
				if (!value.trim()) return t('otp.required');
				if (value.length !== 6) return t('otp.mustBeSixDigits');
				if (!/^\d+$/.test(value)) return t('otp.mustBeNumeric');
				return null;
			},
		},
	});

	const passwordForm = useForm<PasswordFormValues>({
		initialValues: { newPassword: '', confirmPassword: '' },
		validate: {
			newPassword: (value) => {
				if (!value) return t('forgotPasswordFlow.step3.newPasswordRequired');
				const result = validateStrongPassword(value);
				if (!result.isValid) return t('forgotPasswordFlow.step3.passwordWeak');
				return null;
			},
			confirmPassword: (value, values) => {
				if (!value)
					return t('forgotPasswordFlow.step3.confirmPasswordRequired');
				if (value !== values.newPassword)
					return t('forgotPasswordFlow.step3.passwordMismatch');
				return null;
			},
		},
		validateInputOnBlur: true,
	});

	const handleClose = () => {
		// Reset all state on close
		setStep(0);
		setEmail('');
		setOtp('');
		setStepError(null);
		emailForm.reset();
		otpForm.reset();
		passwordForm.reset();
		onClose();
	};

	// Step 1: Request OTP
	const handleEmailSubmit = async (values: EmailFormValues) => {
		setStepError(null);
		try {
			await requestResetMutation.mutateAsync({ email: values.email });
			setEmail(values.email);
			setStep(1);
		} catch (err) {
			// Even on error we move forward — neutral UX, no enumeration
			setEmail(values.email);
			setStep(1);
		}
	};

	// Step 2: Validate OTP (client-side only, real validation happens on submit)
	const handleOtpSubmit = async (values: OtpFormValues) => {
		setStepError(null);
		setOtp(values.otp);
		setStep(2);
	};

	// Step 3: Reset password
	const handlePasswordSubmit = async (values: PasswordFormValues) => {
		setStepError(null);
		try {
			await resetPasswordMutation.mutateAsync({
				email,
				otp,
				newPassword: values.newPassword,
			});
			setStep(3);
		} catch (err) {
			const msg = getErrorMessage(err);
			// Map neutral 401 / invalid OTP back to step 2 with error
			const isOtpError =
				msg?.toLowerCase().includes('otp') ||
				msg?.toLowerCase().includes('invalid') ||
				msg?.toLowerCase().includes('expired') ||
				(err as any)?.response?.status === 401;

			if (isOtpError) {
				otpForm.reset();
				setOtp('');
				setStepError(t('forgotPasswordFlow.errors.invalidOtp'));
				setStep(1);
			} else {
				setStepError(msg || t('forgotPasswordFlow.errors.genericError'));
			}
		}
	};

	const isEmailLoading = requestResetMutation.isPending;
	const isPasswordLoading = resetPasswordMutation.isPending;

	const stepTitles: Record<Exclude<Step, 3>, string> = {
		0: t('forgotPasswordFlow.step1.title'),
		1: t('forgotPasswordFlow.step2.title'),
		2: t('forgotPasswordFlow.step3.title'),
	};

	const modalTitle =
		step === 3
			? t('forgotPasswordFlow.success.title')
			: stepTitles[step as Exclude<Step, 3>];

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap='sm'>
					<IconShieldCheck size={20} />
					<Text fw={600}>{modalTitle}</Text>
				</Group>
			}
			centered
			size='sm'
			withCloseButton={!isEmailLoading && !isPasswordLoading}
			closeOnClickOutside={!isEmailLoading && !isPasswordLoading}
			closeOnEscape={!isEmailLoading && !isPasswordLoading}
			radius='md'
			overlayProps={{ opacity: 0.45, blur: 2 }}
			classNames={{
				header: classes.modalHeader,
				title: classes.modalTitle,
				body: classes.modalBody,
				content: classes.modalContent,
			}}
		>
			{/* Stepper indicator (steps 0–2 only) */}
			{step < 3 && (
				<Stepper active={step} size='xs' classNames={{ root: classes.stepper }}>
					<Stepper.Step label={t('forgotPasswordFlow.steps.email')} />
					<Stepper.Step label={t('forgotPasswordFlow.steps.code')} />
					<Stepper.Step label={t('forgotPasswordFlow.steps.password')} />
				</Stepper>
			)}

			{/* ── Step 0: Email ── */}
			{step === 0 && (
				<form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
					<Stack gap='md' mt='md'>
						<Text size='sm' c='dimmed'>
							{t('forgotPasswordFlow.step1.description')}
						</Text>

						<TextInput
							required
							label={t('forgotPasswordFlow.step1.emailLabel')}
							placeholder={t('forgotPasswordFlow.step1.emailPlaceholder')}
							leftSection={<IconAt size={16} stroke={1.5} />}
							leftSectionPointerEvents='none'
							autoFocus
							autoComplete='email'
							{...emailForm.getInputProps('email')}
						/>

						<Group justify='flex-end' mt='xs'>
							<Button
								variant='subtle'
								onClick={handleClose}
								disabled={isEmailLoading}
							>
								{t('actions.cancel')}
							</Button>
							<Button
								type='submit'
								loading={isEmailLoading}
								loaderProps={{ type: 'dots' }}
							>
								{isEmailLoading
									? t('forgotPasswordFlow.step1.sending')
									: t('forgotPasswordFlow.step1.sendCode')}
							</Button>
						</Group>
					</Stack>
				</form>
			)}

			{/* ── Step 1: OTP ── */}
			{step === 1 && (
				<form onSubmit={otpForm.onSubmit(handleOtpSubmit)}>
					<Stack gap='md' mt='md'>
						<Text size='sm' c='dimmed'>
							{t('forgotPasswordFlow.step2.description')}
						</Text>

						{stepError && (
							<Alert
								variant='light'
								color='red'
								title={t('otp.verificationFailed')}
								icon={<IconAlertCircle size={18} />}
								radius='md'
							>
								{stepError}
							</Alert>
						)}

						<Group justify='center'>
							<PinInput
								length={6}
								type='number'
								oneTimeCode
								autoFocus
								{...otpForm.getInputProps('otp')}
								error={!!otpForm.errors.otp}
								aria-label={t('otp.label')}
								onComplete={(value) => {
									otpForm.setFieldValue('otp', value);
									otpForm.onSubmit(handleOtpSubmit)();
								}}
								classNames={{ input: classes.pinInput }}
							/>
						</Group>
						{otpForm.errors.otp && (
							<Text size='xs' c='red' ta='center'>
								{otpForm.errors.otp}
							</Text>
						)}

						<Group justify='space-between' mt='xs'>
							<Button
								variant='subtle'
								size='sm'
								onClick={() => {
									setStepError(null);
									otpForm.reset();
									setStep(0);
								}}
							>
								{t('actions.back')}
							</Button>
							<Button type='submit' leftSection={<IconShieldCheck size={16} />}>
								{t('actions.verify')}
							</Button>
						</Group>
					</Stack>
				</form>
			)}

			{/* ── Step 2: New Password ── */}
			{step === 2 && (
				<form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
					<Stack gap='md' mt='md'>
						<Text size='sm' c='dimmed'>
							{t('forgotPasswordFlow.step3.description')}
						</Text>

						{stepError && (
							<Alert
								variant='light'
								color='red'
								icon={<IconAlertCircle size={18} />}
								radius='md'
							>
								{stepError}
							</Alert>
						)}

						<PasswordInput
							required
							label={t('forgotPasswordFlow.step3.newPasswordLabel')}
							placeholder={t('forgotPasswordFlow.step3.newPasswordPlaceholder')}
							leftSection={<IconLock size={16} stroke={1.5} />}
							leftSectionPointerEvents='none'
							autoFocus
							autoComplete='new-password'
							{...passwordForm.getInputProps('newPassword')}
						/>

						<PasswordInput
							required
							label={t('forgotPasswordFlow.step3.confirmPasswordLabel')}
							placeholder={t(
								'forgotPasswordFlow.step3.confirmPasswordPlaceholder'
							)}
							leftSection={<IconLock size={16} stroke={1.5} />}
							leftSectionPointerEvents='none'
							autoComplete='new-password'
							{...passwordForm.getInputProps('confirmPassword')}
						/>

						<Group justify='space-between' mt='xs'>
							<Button
								variant='subtle'
								size='sm'
								onClick={() => {
									setStepError(null);
									passwordForm.reset();
									setStep(1);
								}}
								disabled={isPasswordLoading}
							>
								{t('actions.back')}
							</Button>
							<Button
								type='submit'
								loading={isPasswordLoading}
								loaderProps={{ type: 'dots' }}
							>
								{isPasswordLoading
									? t('forgotPasswordFlow.step3.submitting')
									: t('forgotPasswordFlow.step3.submit')}
							</Button>
						</Group>
					</Stack>
				</form>
			)}

			{/* ── Step 3: Success ── */}
			{step === 3 && (
				<Stack gap='md' mt='md' align='center'>
					<ThemeIcon
						size={56}
						radius='xl'
						variant='light'
						color='green'
						className={classes.successIcon}
					>
						<IconCheck size={28} stroke={2} />
					</ThemeIcon>

					<Text size='sm' c='dimmed' ta='center'>
						{t('forgotPasswordFlow.success.description')}
					</Text>

					<Button fullWidth mt='xs' onClick={handleClose}>
						{t('forgotPasswordFlow.success.backToLogin')}
					</Button>
				</Stack>
			)}
		</Modal>
	);
}
