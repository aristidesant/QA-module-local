import { Modal, Stack, Alert, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { ClientSelectOption } from '~/api/authApi';
import { useSelectClient } from '~/queries/authQueries';
import { getErrorMessage } from '~/utils/httpClient';
import ClientSelectionPanel from '~/components/ClientSelectionPanel';
import OTPVerificationModal from '../OTPVerificationModal';

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
				centered
				size='lg'
				padding='lg'
				overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
				withCloseButton={false}
				closeOnClickOutside={!isLoading}
				closeOnEscape={!isLoading}
			>
				<Stack gap='md'>
					<ClientSelectionPanel
						title={t('clientSelection.title')}
						description={t('clientSelection.description')}
						searchPlaceholder={t('clientSelection.searchPlaceholder')}
						countLabel={t('clientSelection.count', {
							count: availableClients.length,
						})}
						selectedLabel={t('clientSelection.selectedLabel')}
						emptyTitle={t('clientSelection.emptyState.title')}
						emptyDescription={t('clientSelection.emptyState.description')}
						clients={availableClients}
						selectedClientId={selectedClient?.clientId}
						isMutating={isLoading}
						onSelect={handleClientSelect}
					/>

					{formError && (
						<Alert
							variant='light'
							color='red'
							title={t('clientSelection.error')}
							icon={<IconAlertCircle size={16} />}
						>
							{formError}
						</Alert>
					)}

					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={handleClose}
							disabled={isLoading}
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
				isLoading={isLoading}
			/>
		</>
	);
}
