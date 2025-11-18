import { useState } from 'react';
import { Alert, Button, Group, Loader, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useGetContactGroupContactsWithPhoneValidationErrors } from '~/queries/contactsQueries';
import FaultyPhonesModal from '../FaultyPhonesModal';
import styles from './FaultyPhonesAlert.module.css';

interface FaultyPhonesAlertProps {
	contactGroupId: number;
}

const FaultyPhonesAlert = ({ contactGroupId }: FaultyPhonesAlertProps) => {
	const [modalOpened, setModalOpened] = useState(false);

	const { data: faultyContacts, isLoading } =
		useGetContactGroupContactsWithPhoneValidationErrors(contactGroupId);

	if (isLoading) {
		return (
			<Alert
				color='gray'
				variant='light'
				className={styles.alert}
				icon={<Loader size='sm' />}
			>
				<Text size='sm'>Checking for phone number validation errors...</Text>
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

	return (
		<>
			<Alert
				color='orange'
				variant='light'
				title='Phone Number Validation Errors'
				className={styles.alert}
				icon={<IconAlertTriangle size={20} />}
			>
				<Group justify='space-between' align='center'>
					<Text size='sm'>
						{faultyContacts.length}{' '}
						{faultyContacts.length === 1 ? 'contact has' : 'contacts have'}{' '}
						{totalFaultyPhones} faulty phone{' '}
						{totalFaultyPhones === 1 ? 'number' : 'numbers'} that need
						attention. These contacts may not receive calls until the phone
						numbers are corrected.
					</Text>
					<Button
						variant='light'
						color='orange'
						size='sm'
						onClick={() => setModalOpened(true)}
					>
						View Details
					</Button>
				</Group>
			</Alert>

			<FaultyPhonesModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				contacts={faultyContacts}
			/>
		</>
	);
};

export default FaultyPhonesAlert;
