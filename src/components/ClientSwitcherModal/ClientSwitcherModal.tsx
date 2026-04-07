import { Modal, Stack, Alert, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { ClientSelectOption } from '~/api/authApi';
import { useAvailableClients, useChangeClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { useSessionStore } from '~/stores/sessionStore';
import ClientSelectionPanel from '~/components/ClientSelectionPanel';
import OTPVerificationModal from '~/modules/auth/LoginForm/OTPVerificationModal';

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

	const availableClients = data?.availableClients ?? [];

	// Refetch the list every time the modal opens
	useEffect(() => {
		if (opened) {
			refetch();
		}
	}, [opened, refetch]);

	const handleClose = useCallback(() => {
		setFormError(null);
		setSelectedClient(null);
		setOtpModalOpened(false);
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
				centered
				size='lg'
				padding='lg'
				overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
				withCloseButton={false}
				closeOnClickOutside={!isMutating}
				closeOnEscape={!isMutating}
			>
				<Stack gap='md'>
					<ClientSelectionPanel
						title={t('userMenu.clientSwitcher.title')}
						description={t('userMenu.clientSwitcher.description')}
						searchPlaceholder={t('actions.search')}
						countLabel={t('userMenu.clientSwitcher.count', {
							count: availableClients.length,
						})}
						selectedLabel={t('userMenu.clientSwitcher.selectedLabel')}
						emptyTitle={t('userMenu.clientSwitcher.emptyState.title')}
						emptyDescription={t(
							'userMenu.clientSwitcher.emptyState.description'
						)}
						loadingLabel={t('status.loading')}
						currentClientLabel={t('userMenu.clientSwitcher.currentClient')}
						currentClientTooltip={t(
							'userMenu.clientSwitcher.currentClientTooltip'
						)}
						clients={availableClients}
						selectedClientId={selectedClient?.clientId}
						currentClientId={currentClientId}
						isLoading={isLoadingClients}
						isMutating={isMutating}
						onSelect={handleClientSelect}
					/>

					{formError && (
						<Alert
							variant='light'
							color='red'
							title={t('status.error')}
							icon={<IconAlertCircle size={16} />}
						>
							{formError}
						</Alert>
					)}

					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={handleClose}
							disabled={isMutating}
						>
							{t('actions.cancel')}
						</Button>
					</Group>
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
