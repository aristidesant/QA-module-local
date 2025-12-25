import { useState } from 'react';
import { Alert, Button, Group, Loader, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle } from '@tabler/icons-react';
import {
	useGetContactGroupContactsWithPhoneValidationErrors,
	useGetContactGroupContacts,
} from '~/queries/contactsQueries';
import { useQueryClient } from '@tanstack/react-query';
import FaultyPhonesModal from '../FaultyPhonesModal';
import styles from './FaultyPhonesAlert.module.css';

interface FaultyPhonesAlertProps {
	contactGroupId: number;
}

const FaultyPhonesAlert = ({ contactGroupId }: FaultyPhonesAlertProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const [modalOpened, setModalOpened] = useState(false);

	const {
		data: faultyContacts,
		isLoading,
		isFetching,
		refetch: refetchFaulty,
	} = useGetContactGroupContactsWithPhoneValidationErrors(contactGroupId);

	// Optionally prime main contact group contacts query for refetch on edit
	const { refetch: refetchGroupContacts } = useGetContactGroupContacts(
		contactGroupId,
		{ limit: 25, offset: 0 }
	);

	const queryClient = useQueryClient();

	if (isLoading) {
		return (
			<Alert
				color='gray'
				variant='light'
				className={styles.alert}
				icon={<Loader size='sm' />}
			>
				<Text size='sm'>{t('faultyPhones.checking')}</Text>
			</Alert>
		);
	}

	if (!faultyContacts || faultyContacts.length === 0) {
		return null;
	}

	const totalFaultyPhones = faultyContacts.reduce((count, contact) => {
		const errorCount =
			contact.phoneNumbers?.filter((phone) => phone.validationError).length ||
			0;
		return count + errorCount;
	}, 0);

	const handleAfterUpdate = () => {
		// Refetch validation errors & main contacts list for fresh state
		refetchFaulty();
		refetchGroupContacts();
		// Ensure any cached queries also considered stale
		queryClient.invalidateQueries({
			queryKey: [
				'contactGroupContactsWithPhoneValidationErrors',
				contactGroupId,
			],
		});
		queryClient.invalidateQueries({
			queryKey: ['contactGroupContacts', contactGroupId],
		});
	};

	return (
		<>
			{isFetching && (
				<Alert
					color='gray'
					variant='light'
					className={styles.alert}
					icon={<Loader size='sm' />}
				>
					<Text size='sm'>{t('faultyPhones.refreshing')}</Text>
				</Alert>
			)}
			<Alert
				color='orange'
				variant='light'
				title={t('faultyPhones.title')}
				className={styles.alert}
				icon={<IconAlertTriangle size={20} />}
			>
				<Group justify='space-between' align='center'>
					<Text size='sm'>
						{t('faultyPhones.message', {
							total: totalFaultyPhones,
							unit: t(
								`faultyPhones.unit_${totalFaultyPhones === 1 ? 'one' : 'other'}`
							),
							count: faultyContacts.length,
							plural: faultyContacts.length === 1 ? '' : 's',
						})}
					</Text>
					<Button
						variant='light'
						color='orange'
						size='sm'
						onClick={() => setModalOpened(true)}
					>
						{t('faultyPhones.viewDetails')}
					</Button>
				</Group>
			</Alert>

			<FaultyPhonesModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				contacts={faultyContacts}
				contactGroupId={contactGroupId}
				onAfterUpdate={handleAfterUpdate}
			/>
		</>
	);
};

export default FaultyPhonesAlert;
