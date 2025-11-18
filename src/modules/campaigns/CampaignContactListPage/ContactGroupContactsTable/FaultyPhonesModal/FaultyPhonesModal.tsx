import { Modal, Title, Text, Badge, Group, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import type { Contact } from '~/models/ContactsModel';
import BaseTable from '~/components/BaseTable';
import type { ColumnDef } from '@tanstack/react-table';
import styles from './FaultyPhonesModal.module.css';

interface FaultyPhonesModalProps {
	opened: boolean;
	onClose: () => void;
	contacts: Contact[];
}

interface FaultyPhoneRow {
	contactId: number;
	contactName: string;
	phoneNumber: string;
	errorCode: string;
	errorMessage: string;
}

const FaultyPhonesModal = ({
	opened,
	onClose,
	contacts,
}: FaultyPhonesModalProps) => {
	const faultyPhoneRows = useMemo(() => {
		const rows: FaultyPhoneRow[] = [];

		contacts.forEach((contact) => {
			contact.phoneNumbers?.forEach((phoneEntry) => {
				if (phoneEntry.validationError) {
					rows.push({
						contactId: contact.id,
						contactName: `${contact.firstName} ${contact.lastName}`,
						phoneNumber: phoneEntry.validationError.rawPhone,
						errorCode: phoneEntry.validationError.code,
						errorMessage: phoneEntry.validationError.message,
					});
				}
			});
		});

		return rows;
	}, [contacts]);

	const columns = useMemo<ColumnDef<FaultyPhoneRow>[]>(
		() => [
			{
				accessorKey: 'contactName',
				header: 'Contact',
				cell: ({ getValue }) => (
					<Text size='sm' fw={500}>
						{getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'phoneNumber',
				header: 'Phone Number',
				cell: ({ getValue }) => (
					<Text size='sm' c='red' fw={600} className={styles.phoneNumber}>
						{getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'errorCode',
				header: 'Error Code',
				cell: ({ getValue }) => (
					<Badge color='red' variant='light' size='sm'>
						{getValue() as string}
					</Badge>
				),
			},
			{
				accessorKey: 'errorMessage',
				header: 'Error Message',
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed'>
						{getValue() as string}
					</Text>
				),
			},
		],
		[]
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<IconAlertCircle size={20} color='var(--mantine-color-red-6)' />
					<Title order={4}>Faulty Phone Numbers</Title>
				</Group>
			}
			centered
			size='50vw'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					The following phone numbers have validation errors and need attention.
					These contacts may not receive calls until the phone numbers are
					corrected.
				</Text>

				<BaseTable
					data={faultyPhoneRows}
					columns={columns}
					enablePagination={false}
				/>

				<Text size='xs' c='dimmed' ta='center'>
					Total: {faultyPhoneRows.length} faulty phone{' '}
					{faultyPhoneRows.length === 1 ? 'number' : 'numbers'}
				</Text>
			</Stack>
		</Modal>
	);
};

export default FaultyPhonesModal;
