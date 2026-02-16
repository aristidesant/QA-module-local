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
	Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconAlertCircle,
	IconBuilding,
	IconCheck,
	IconSearch,
} from '@tabler/icons-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { ClientSelectOption } from '~/api/authApi';
import { useAvailableClients, useChangeClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { useSessionStore } from '~/stores/sessionStore';
import EmptyState from '~/components/EmptyState';
import OTPVerificationModal from '~/modules/auth/LoginForm/OTPVerificationModal';
import classes from './ClientSwitcherModal.module.css';

interface ClientSwitcherModalProps {
	opened: boolean;
	onClose: () => void;
}

export default function ClientSwitcherModal({
	opened,
	onClose,
}: ClientSwitcherModalProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useSessionStore();
	const currentClientId = user?.client?.id;
	const {
		data,
		isLoading: isLoadingClients,
		refetch,
	} = useAvailableClients(opened);
	const changeClientMutation = useChangeClient();
	const [formError, setFormError] = useState<string | null>(null);
	const [selectedClient, setSelectedClient] =
		useState<ClientSelectOption | null>(null);
	const [otpModalOpened, setOtpModalOpened] = useState(false);
	const [search, setSearch] = useState('');

	const availableClients = data?.availableClients ?? [];

	// Refetch the list every time the modal opens
	useEffect(() => {
		if (opened) {
			refetch();
		}
	}, [opened, refetch]);

	const filteredClients = useMemo(() => {
		if (!search.trim()) return availableClients;
		const query = search.toLowerCase();
		return availableClients.filter(
			(client) =>
				client.clientName.toLowerCase().includes(query) ||
				client.clientIdentifier.toLowerCase().includes(query)
		);
	}, [availableClients, search]);

	const handleClose = useCallback(() => {
		setFormError(null);
		setSelectedClient(null);
		setOtpModalOpened(false);
		setSearch('');
		onClose();
	}, [onClose]);

	const handleClientSelect = async (client: ClientSelectOption) => {
		setFormError(null);
		setSelectedClient(client);

		try {
			const response = await changeClientMutation.mutateAsync({
				clientId: client.clientId,
			});

			if (response.otpRequired) {
				setOtpModalOpened(true);
			} else if (response.accessToken) {
				handleClose();
				navigate('/');
			}
		} catch (err) {
			setFormError(getErrorMessage(err));
			setSelectedClient(null);
		}
	};

	const handleOtpVerify = async (otp: string) => {
		if (!selectedClient) return;

		try {
			const response = await changeClientMutation.mutateAsync({
				clientId: selectedClient.clientId,
				otp,
			});

			if (response.accessToken) {
				setOtpModalOpened(false);
				handleClose();
				navigate('/');
			}
		} catch (err) {
			throw err;
		}
	};

	const handleOtpModalClose = () => {
		setOtpModalOpened(false);
		setSelectedClient(null);
		setFormError(null);
	};

	const isMutating = changeClientMutation.isPending;

	return (
		<>
			<Modal
				opened={opened}
				onClose={handleClose}
				title={
					<Group gap='xs'>
						<IconBuilding size={16} />
						<Text fw={600} size='sm'>
							{t('userMenu.clientSwitcher.title')}
						</Text>
					</Group>
				}
				centered
				size='lg'
				radius='sm'
				padding='md'
				overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
				withCloseButton={!isMutating}
				closeOnClickOutside={!isMutating}
				closeOnEscape={!isMutating}
			>
				<Stack gap='xs'>
					<Text size='sm' c='dimmed'>
						{t('userMenu.clientSwitcher.description')}
					</Text>

					{isLoadingClients ? (
						<Group justify='center' py='xl'>
							<Loader size='sm' />
							<Text size='sm' c='dimmed'>
								{t('status.loading')}
							</Text>
						</Group>
					) : (
						<>
							{availableClients.length > 5 && (
								<TextInput
									placeholder={t('actions.search')}
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
									style={{
										minHeight: availableClients.length > 5 ? 450 : 'auto',
									}}
								>
									{filteredClients.length > 0 ? (
										<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
											{filteredClients.map((client) => {
												const isCurrentClient =
													client.clientId === currentClientId;
												const isDisabled = isMutating || isCurrentClient;

												return (
													<Tooltip
														key={client.clientId}
														label={t(
															'userMenu.clientSwitcher.currentClientTooltip'
														)}
														disabled={!isCurrentClient}
														position='top'
														withArrow
													>
														<Card
															className={classes.clientCard}
															padding='sm'
															radius='sm'
															withBorder
															onClick={() =>
																!isDisabled && handleClientSelect(client)
															}
															data-selected={
																selectedClient?.clientId === client.clientId
															}
															data-disabled={isDisabled}
															data-current={isCurrentClient}
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
																isMutating ? (
																	<Loader size='xs' />
																) : (
																	<IconCheck
																		size={16}
																		className={classes.checkIcon}
																		data-visible={
																			selectedClient?.clientId ===
																			client.clientId
																		}
																	/>
																)}
															</Group>
														</Card>
													</Tooltip>
												);
											})}
										</SimpleGrid>
									) : (
										<EmptyState
											icon={<IconBuilding size={32} />}
											message={t('userMenu.clientSwitcher.emptyState.title')}
											description={t(
												'userMenu.clientSwitcher.emptyState.description'
											)}
										/>
									)}
								</Box>
							</ScrollArea>
						</>
					)}

					{formError && (
						<Alert
							variant='light'
							color='red'
							title={t('status.error')}
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
				isLoading={isMutating}
			/>
		</>
	);
}
