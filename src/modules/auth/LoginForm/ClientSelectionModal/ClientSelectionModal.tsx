import {
	Modal,
	Button,
	Stack,
	Text,
	Group,
	Alert,
	Card,
	Badge,
	TextInput,
	Loader,
	Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconAlertCircle,
	IconBuilding,
	IconShieldCheck,
	IconCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { ClientSelectOption } from '~/api/authApi';
import { useSelectClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ClientSelectionModal.module.css';

export const validateOtpValue = (value: string) => {
	if (!value.trim()) return 'OTP code is required';
	if (value.length !== 6) return 'OTP code must be 6 digits';
	if (!/^\d+$/.test(value)) return 'OTP code must contain only numbers';
	return null;
};

interface ClientSelectionModalProps {
	opened: boolean;
	onClose: () => void;
	availableClients: ClientSelectOption[];
	preAuthToken: string;
	onSuccess?: () => void;
}

type ModalStep = 'select-client' | 'enter-otp';

interface FormValues {
	otp: string;
}

export default function ClientSelectionModal({
	opened,
	onClose,
	availableClients,
	preAuthToken,
	onSuccess,
}: ClientSelectionModalProps) {
	const selectClientMutation = useSelectClient();
	const [formError, setFormError] = useState<string | null>(null);
	const [step, setStep] = useState<ModalStep>('select-client');
	const [selectedClient, setSelectedClient] =
		useState<ClientSelectOption | null>(null);

	const form = useForm<FormValues>({
		initialValues: {
			otp: '',
		},
		validate: {
			otp: validateOtpValue,
		},
	});

	const handleClose = () => {
		form.reset();
		setFormError(null);
		setStep('select-client');
		setSelectedClient(null);
		onClose();
	};

	const handleClientSelect = async (client: ClientSelectOption) => {
		setFormError(null);
		setSelectedClient(client);

		try {
			const response = await selectClientMutation.mutateAsync({
				preAuthToken,
				clientId: client.clientId,
			});

			if (response.otpRequired) {
				// MFA is enabled, need to show OTP input
				setStep('enter-otp');
			} else if (response.accessToken) {
				// Login successful
				handleClose();
				onSuccess?.();
			}
		} catch (err: any) {
			setFormError(getErrorMessage(err));
			setSelectedClient(null);
		}
	};

	const handleOTPSubmit = async (values: FormValues) => {
		if (!selectedClient) return;

		setFormError(null);
		try {
			const response = await selectClientMutation.mutateAsync({
				preAuthToken,
				clientId: selectedClient.clientId,
				otp: values.otp,
			});

			if (response.accessToken) {
				handleClose();
				onSuccess?.();
			}
		} catch (err: any) {
			setFormError(getErrorMessage(err));
		}
	};

	const handleBackToClientSelection = () => {
		form.reset();
		setFormError(null);
		setStep('select-client');
		setSelectedClient(null);
	};

	const isLoading = selectClientMutation.isPending;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap='sm'>
					{step === 'select-client' ? (
						<>
							<IconBuilding size={20} />
							<Text fw={600}>Select Organization</Text>
						</>
					) : (
						<>
							<IconShieldCheck size={20} />
							<Text fw={600}>Two-Factor Authentication</Text>
						</>
					)}
				</Group>
			}
			centered
			size='md'
			withCloseButton={!isLoading}
			closeOnClickOutside={!isLoading}
			closeOnEscape={!isLoading}
		>
			{step === 'select-client' ? (
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						You have access to multiple organizations. Please select which one
						you would like to sign in to.
					</Text>

					<Stack gap='xs'>
						{availableClients.map((client) => (
							<Card
								key={client.clientId}
								className={classes.clientCard}
								padding='sm'
								radius='md'
								withBorder
								onClick={() => !isLoading && handleClientSelect(client)}
								data-selected={selectedClient?.clientId === client.clientId}
								data-disabled={isLoading}
							>
								<Group justify='space-between' wrap='nowrap'>
									<Box style={{ flex: 1, minWidth: 0 }}>
										<Group gap='xs' wrap='nowrap'>
											<IconBuilding
												size={16}
												className={classes.clientIcon}
												stroke={1.5}
											/>
											<Text size='sm' fw={500} truncate>
												{client.clientName}
											</Text>
										</Group>
										<Group gap={4} mt={4}>
											{client.roles.map((role) => (
												<Badge
													key={role}
													size='xs'
													variant='light'
													color='blue'
												>
													{role}
												</Badge>
											))}
										</Group>
									</Box>
									{selectedClient?.clientId === client.clientId && isLoading ? (
										<Loader size='xs' />
									) : (
										<IconCheck
											size={16}
											className={classes.checkIcon}
											data-visible={
												selectedClient?.clientId === client.clientId
											}
										/>
									)}
								</Group>
							</Card>
						))}
					</Stack>

					{formError && (
						<Alert
							variant='light'
							color='red'
							title='Unable to select organization'
							icon={<IconAlertCircle size={18} />}
							radius='md'
						>
							{formError}
						</Alert>
					)}
				</Stack>
			) : (
				<form onSubmit={form.onSubmit(handleOTPSubmit)}>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							Please enter the 6-digit verification code sent to your email to
							continue signing in to{' '}
							<Text span fw={500}>
								{selectedClient?.clientName}
							</Text>
							.
						</Text>

						<TextInput
							label='Verification Code'
							placeholder='Enter 6-digit code'
							maxLength={6}
							className={classes.otpInput}
							{...form.getInputProps('otp')}
							disabled={isLoading}
							autoComplete='one-time-code'
							inputMode='numeric'
							pattern='[0-9]*'
						/>

						{formError && (
							<Alert
								variant='light'
								color='red'
								title='Verification failed'
								icon={<IconAlertCircle size={18} />}
								radius='md'
							>
								{formError}
							</Alert>
						)}

						<Group justify='space-between' mt='md'>
							<Button
								variant='subtle'
								onClick={handleBackToClientSelection}
								disabled={isLoading}
								size='sm'
							>
								Back
							</Button>
							<Group gap='xs'>
								<Button
									variant='subtle'
									onClick={handleClose}
									disabled={isLoading}
									size='sm'
								>
									Cancel
								</Button>
								<Button
									type='submit'
									loading={isLoading}
									leftSection={!isLoading && <IconShieldCheck size={16} />}
									disabled={isLoading}
									size='sm'
								>
									Verify
								</Button>
							</Group>
						</Group>
					</Stack>
				</form>
			)}
		</Modal>
	);
}
