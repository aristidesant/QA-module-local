import {
	Modal,
	Button,
	Stack,
	Text,
	Group,
	Alert,
	PinInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconShieldCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVerifyOTP } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './OTPVerificationModal.module.css';

interface OTPVerificationModalProps {
	opened: boolean;
	onClose: () => void;
	userId?: number;
	onSuccess?: () => void;
	onSubmit?: (otp: string) => Promise<void>;
	isLoading?: boolean;
}

interface FormValues {
	otp: string;
}

export default function OTPVerificationModal({
	opened,
	onClose,
	userId,
	onSuccess,
	onSubmit,
	isLoading: externalLoading,
}: OTPVerificationModalProps) {
	const { t } = useTranslation('auth');
	const verifyOTPMutation = useVerifyOTP();
	const [formError, setFormError] = useState<string | null>(null);

	const isLoading = externalLoading || verifyOTPMutation.isPending;

	const form = useForm<FormValues>({
		initialValues: {
			otp: '',
		},
		validate: {
			otp: (value) => {
				if (!value.trim()) return t('otp.required');
				if (value.length !== 6) return t('otp.mustBeSixDigits');
				if (!/^\d+$/.test(value)) return t('otp.mustBeNumeric');
				return null;
			},
		},
	});

	const handleClose = () => {
		form.reset();
		setFormError(null);
		onClose();
	};

	const handleSubmit = async (values: FormValues) => {
		setFormError(null);
		try {
			if (onSubmit) {
				await onSubmit(values.otp);
			} else if (userId) {
				await verifyOTPMutation.mutateAsync({
					userId,
					otp: values.otp,
				});
			} else {
				throw new Error('Missing configuration for OTP verification');
			}
			handleClose();
			onSuccess?.();
		} catch (err: any) {
			setFormError(getErrorMessage(err));
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap='sm'>
					<IconShieldCheck size={20} />
					<Text fw={600}>{t('otp.title')}</Text>
				</Group>
			}
			centered
			size='sm'
			withCloseButton={!isLoading}
			closeOnClickOutside={!isLoading}
			closeOnEscape={!isLoading}
			radius='md'
			overlayProps={{ opacity: 0.45, blur: 2 }}
			classNames={{
				header: classes.modalHeader,
				title: classes.modalTitle,
				body: classes.modalBody,
				content: classes.modalContent,
			}}
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						{t('otp.description')}
					</Text>

					<Group justify='center'>
						<PinInput
							length={6}
							type='number'
							oneTimeCode
							autoFocus
							disabled={isLoading}
							{...form.getInputProps('otp')}
							error={!!form.errors.otp}
							aria-label={t('otp.label')}
							onComplete={(value) => {
								form.setFieldValue('otp', value);
								form.onSubmit(handleSubmit)();
							}}
						/>
					</Group>
					{form.errors.otp && (
						<Text size='xs' c='red' mt='xs' ta='center'>
							{form.errors.otp}
						</Text>
					)}

					{formError && (
						<Alert
							variant='light'
							color='red'
							title={t('otp.verificationFailed')}
							icon={<IconAlertCircle size={18} />}
							radius='md'
						>
							{formError}
						</Alert>
					)}

					<Group justify='flex-end' mt='md'>
						<Button variant='subtle' onClick={handleClose} disabled={isLoading}>
							{t('actions.cancel')}
						</Button>
						<Button
							type='submit'
							loading={isLoading}
							leftSection={!isLoading && <IconShieldCheck size={16} />}
							disabled={isLoading}
						>
							{t('actions.verify')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
