import {
	Modal,
	TextInput,
	Button,
	Stack,
	Text,
	Group,
	Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconShieldCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useVerifyOTP } from "~/queries/authQueries";
import { getErrorMessage } from "~/utils/httpClient";
import classes from "./OTPVerificationModal.module.css";

interface OTPVerificationModalProps {
	opened: boolean;
	onClose: () => void;
	userId: number;
	onSuccess?: () => void;
}

interface FormValues {
	otp: string;
}

export default function OTPVerificationModal({
	opened,
	onClose,
	userId,
	onSuccess,
}: OTPVerificationModalProps) {
	const verifyOTPMutation = useVerifyOTP();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		initialValues: {
			otp: "",
		},
		validate: {
			otp: (value) => {
				if (!value.trim()) return "OTP code is required";
				if (value.length !== 6) return "OTP code must be 6 digits";
				if (!/^\d+$/.test(value)) return "OTP code must contain only numbers";
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
			await verifyOTPMutation.mutateAsync({
				userId,
				otp: values.otp,
			});
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
				<Group gap="sm">
					<IconShieldCheck size={20} />
					<Text fw={600}>Two-Factor Authentication</Text>
				</Group>
			}
			centered
			size="sm"
			withCloseButton={!verifyOTPMutation.isPending}
			closeOnClickOutside={!verifyOTPMutation.isPending}
			closeOnEscape={!verifyOTPMutation.isPending}
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						Please enter the 6-digit verification code from your authenticator
						app.
					</Text>

					<TextInput
						label="Verification Code"
						placeholder="Enter 6-digit code"
						maxLength={6}
						className={classes.otpInput}
						{...form.getInputProps("otp")}
						disabled={verifyOTPMutation.isPending}
						autoComplete="one-time-code"
						inputMode="numeric"
						pattern="[0-9]*"
					/>

					{formError && (
						<Alert
							variant="light"
							color="red"
							title="Verification failed"
							icon={<IconAlertCircle size={18} />}
							radius="md"
						>
							{formError}
						</Alert>
					)}

					<Group justify="flex-end" mt="md">
						<Button
							variant="subtle"
							onClick={handleClose}
							disabled={verifyOTPMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							loading={verifyOTPMutation.isPending}
							leftSection={
								!verifyOTPMutation.isPending && <IconShieldCheck size={16} />
							}
							disabled={verifyOTPMutation.isPending}
						>
							Verify
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
