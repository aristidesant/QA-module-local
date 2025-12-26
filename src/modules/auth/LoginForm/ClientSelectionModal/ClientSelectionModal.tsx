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
	ScrollArea,
	SimpleGrid,
	PinInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation, Trans } from 'react-i18next';
import {
	IconAlertCircle,
	IconBuilding,
	IconShieldCheck,
	IconCheck,
	IconSearch,
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { ClientSelectOption } from '~/api/authApi';
import { useSelectClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import EmptyState from '~/components/EmptyState';
import classes from './ClientSelectionModal.module.css';

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
	const { t } = useTranslation('auth');
	const selectClientMutation = useSelectClient();
	const [formError, setFormError] = useState<string | null>(null);
	const [step, setStep] = useState<ModalStep>('select-client');
	const [selectedClient, setSelectedClient] =
		useState<ClientSelectOption | null>(null);
	const [search, setSearch] = useState('');

	const filteredClients = useMemo(() => {
		if (!search.trim()) return availableClients;
		const query = search.toLowerCase();
		return availableClients.filter(
			(client) =>
				client.clientName.toLowerCase().includes(query) ||
				client.clientIdentifier.toLowerCase().includes(query)
		);
	}, [availableClients, search]);

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
		} catch (err) {
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
		} catch (err) {
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
				<Group gap='xs'>
					{step === 'select-client' ? (
						<>
							<IconBuilding size={16} />
							<Text fw={600} size='sm'>
								{t('clientSelection.title')}
							</Text>
						</>
					) : (
						<>
							<IconShieldCheck size={16} />
							<Text fw={600} size='sm'>
								{t('otp.title')}
							</Text>
						</>
					)}
				</Group>
			}
			centered
			size='lg'
			radius='sm'
			padding='md'
			overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
			withCloseButton={!isLoading}
			closeOnClickOutside={!isLoading}
			closeOnEscape={!isLoading}
		>
			{step === 'select-client' ? (
				<Stack gap='xs'>
					<Text size='sm' c='dimmed'>
						{t('clientSelection.description')}
					</Text>

					{availableClients.length > 5 && (
						<TextInput
							placeholder={t('clientSelection.searchPlaceholder')}
							leftSection={<IconSearch size={14} />}
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
							size='sm'
							autoFocus
						/>
					)}

					<ScrollArea
						h={availableClients.length > 10 ? 450 : 'auto'}
						type='auto'
						offsetScrollbars
					>
						<Box
							style={{ minHeight: availableClients.length > 5 ? 450 : 'auto' }}
						>
							{filteredClients.length > 0 ? (
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
									{filteredClients.map((client) => (
										<Card
											key={client.clientId}
											className={classes.clientCard}
											padding='sm'
											radius='sm'
											withBorder
											onClick={() => !isLoading && handleClientSelect(client)}
											data-selected={
												selectedClient?.clientId === client.clientId
											}
											data-disabled={isLoading}
										>
											<Group
												justify='space-between'
												wrap='nowrap'
												align='center'
												className={classes.cardContent}
											>
												<Group gap='sm' wrap='nowrap' align='center'>
													<div className={classes.iconWrapper}>
														<IconBuilding size={16} stroke={1.5} />
													</div>
													<Box style={{ flex: 1, minWidth: 0 }}>
														<Text size='sm' fw={500} truncate>
															{client.clientName}
														</Text>
														<Group gap={4}>
															{client.roles.map((role) => (
																<Badge
																	key={role}
																	size='xs'
																	variant='dot'
																	color='blue'
																	styles={{
																		label: {
																			textTransform: 'none',
																			fontWeight: 400,
																		},
																	}}
																>
																	{role}
																</Badge>
															))}
														</Group>
													</Box>
												</Group>
												{selectedClient?.clientId === client.clientId &&
												isLoading ? (
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
								</SimpleGrid>
							) : (
								<EmptyState
									icon={<IconBuilding size={32} />}
									message={t('clientSelection.emptyState.title')}
									description={t('clientSelection.emptyState.description')}
								/>
							)}
						</Box>
					</ScrollArea>

					{formError && (
						<Alert
							variant='light'
							color='red'
							title={t('clientSelection.error')}
							icon={<IconAlertCircle size={16} />}
							radius='sm'
						>
							{formError}
						</Alert>
					)}
				</Stack>
			) : (
				<form onSubmit={form.onSubmit(handleOTPSubmit)}>
					<Stack gap='xs' style={{ minHeight: 450 }}>
						<Text size='sm' c='dimmed'>
							<Trans
								i18nKey='clientSelection.otpDescription'
								ns='auth'
								values={{ clientName: selectedClient?.clientName }}
								components={{
									bold: <Text span fw={500} size='sm' />,
								}}
							/>
						</Text>

						<Stack align='center' gap='md' py='md'>
							<PinInput
								length={6}
								type='number'
								oneTimeCode
								autoFocus
								disabled={isLoading}
								{...form.getInputProps('otp')}
								size='md'
								aria-label={t('otp.label')}
								onComplete={(value) => {
									form.setFieldValue('otp', value);
									form.onSubmit(handleOTPSubmit)();
								}}
							/>
							{form.errors.otp && (
								<Text size='xs' c='red'>
									{form.errors.otp}
								</Text>
							)}
						</Stack>

						{formError && (
							<Alert
								variant='light'
								color='red'
								title={t('otp.verificationFailed')}
								icon={<IconAlertCircle size={16} />}
								radius='sm'
							>
								{formError}
							</Alert>
						)}

						<Group justify='space-between' mt='auto' pt='md'>
							<Button
								variant='subtle'
								onClick={handleBackToClientSelection}
								disabled={isLoading}
								size='sm'
							>
								{t('actions.back')}
							</Button>
							<Group gap='xs'>
								<Button
									variant='subtle'
									onClick={handleClose}
									disabled={isLoading}
									size='sm'
								>
									{t('actions.cancel')}
								</Button>
								<Button
									type='submit'
									loading={isLoading}
									leftSection={!isLoading && <IconShieldCheck size={14} />}
									disabled={isLoading}
									size='sm'
								>
									{t('actions.verify')}
								</Button>
							</Group>
						</Group>
					</Stack>
				</form>
			)}
		</Modal>
	);
}
