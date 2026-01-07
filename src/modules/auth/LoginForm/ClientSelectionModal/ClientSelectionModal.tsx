import {
	Modal,
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
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconAlertCircle,
	IconBuilding,
	IconCheck,
	IconSearch,
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { ClientSelectOption } from '~/api/authApi';
import { useSelectClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import EmptyState from '~/components/EmptyState';
import OTPVerificationModal from '../OTPVerificationModal';
import classes from './ClientSelectionModal.module.css';

interface ClientSelectionModalProps {
	opened: boolean;
	onClose: () => void;
	availableClients: ClientSelectOption[];
	preAuthToken: string;
	onSuccess?: () => void;
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
	const [selectedClient, setSelectedClient] =
		useState<ClientSelectOption | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
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

	const handleClose = () => {
		setFormError(null);
		setSelectedClient(null);
		setOtpModalOpened(false);
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
				// Show OTP modal
				setOtpModalOpened(true);
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

	const handleOtpVerify = async (otp: string) => {
		if (!selectedClient) return;

		try {
			const response = await selectClientMutation.mutateAsync({
				preAuthToken,
				clientId: selectedClient.clientId,
				otp,
			});

			if (response.accessToken) {
				// Close both modals
				setOtpModalOpened(false);
				handleClose();
				onSuccess?.();
			}
		} catch (err: any) {
			// Throwing the error so OTPVerificationModal can catch it and display the error
			throw err;
		}
	};

	const handleOtpModalClose = () => {
		setOtpModalOpened(false);
		// Do not clear selected client immediately so user can try selecting again if they want,
		// but typically cancelling OTP means they might want to select another client or just cancelled the action.
		// If we want to reset selection on cancel:
		setSelectedClient(null);
		setFormError(null);
	};

	const isLoading = selectClientMutation.isPending;

	return (
		<>
			<Modal
				opened={opened}
				onClose={handleClose}
				title={
					<Group gap='xs'>
						<IconBuilding size={16} />
						<Text fw={600} size='sm'>
							{t('clientSelection.title')}
						</Text>
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
			</Modal>

			<OTPVerificationModal
				opened={otpModalOpened}
				onClose={handleOtpModalClose}
				onSubmit={handleOtpVerify}
				isLoading={isLoading}
			/>
		</>
	);
}
