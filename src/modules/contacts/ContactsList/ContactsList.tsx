import { useMemo } from 'react';
import { modals } from '@mantine/modals';
import {
	Table,
	Button,
	Group,
	Loader,
	Text,
	LoadingOverlay,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useGetAllContacts, useDeleteContact } from '~/queries/contactsQueries';
import type { Contact } from '~/models/ContactsModel';
import classes from './ContactsList.module.css';
import { notifications } from '@mantine/notifications';
import { IconUserOff, IconRefresh } from '@tabler/icons-react';

interface ContactsListProps {
	search: string;
	onEdit: (id: number) => void;
	selectedContactId: number | null;
}

export default function ContactsList({
	search,
	onEdit,
	selectedContactId,
}: ContactsListProps) {
	const {
		data,
		isLoading,
		isFetching,
		isError,
		refetch: reloadList,
	} = useGetAllContacts(search ? { search } : undefined);
	const deleteContact = useDeleteContact();

	const filteredContacts = useMemo(() => {
		if (!data) return [];
		if (!search) return data;
		const lower = search.toLowerCase();
		return data.filter(
			(c: Contact) =>
				c.firstName.toLowerCase().includes(lower) ||
				c.lastName.toLowerCase().includes(lower) ||
				c.emails?.[0].toLowerCase().includes(lower) ||
				c.phoneNumbers?.[0]?.phoneNumber.toLowerCase().includes(lower)
		);
	}, [data, search]);

	if (isLoading) {
		return (
			<Group justify='center' py='xl'>
				<Loader />
			</Group>
		);
	}

	if (isError) {
		return (
			<Group justify='center' py='xl'>
				<Text c='red'>Failed to load contacts.</Text>
			</Group>
		);
	}

	// Show fancy empty state inside the table
	const showEmpty = !filteredContacts.length && !isFetching;

	return (
		<>
			<LoadingOverlay
				visible={deleteContact.isPending || isLoading || isFetching}
			/>
			<Table striped highlightOnHover withTableBorder className={classes.table}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>First Name</Table.Th>
						<Table.Th>Last Name</Table.Th>
						<Table.Th>Email</Table.Th>
						<Table.Th>Phone</Table.Th>
						<Table.Th>Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{showEmpty ? (
						<Table.Tr>
							<Table.Td colSpan={5}>
								<div className={classes.noContactsTableWrapper}>
									<IconUserOff
										size={48}
										stroke={1.5}
										className={classes.noContactsIcon}
									/>
									<Text ta='center' fw={600} fz='lg' mb={4} mt={8}>
										No contacts found
									</Text>
									<Text ta='center' c='dimmed' fz='sm' mb={12}>
										It looks like you don’t have any contacts yet. Add new
										contacts to get started!
									</Text>
									<Button
										variant='light'
										leftSection={<IconRefresh size={16} />}
										onClick={() => reloadList()}
									>
										Reload
									</Button>
								</div>
							</Table.Td>
						</Table.Tr>
					) : (
						filteredContacts.map((contact: Contact) => (
							<Table.Tr
								key={contact.id}
								className={
									selectedContactId === contact.id
										? classes.selectedRow
										: undefined
								}
							>
								<Table.Td>{contact.firstName}</Table.Td>
								<Table.Td>{contact.lastName}</Table.Td>
								<Table.Td>{contact.emails?.[0]}</Table.Td>
								<Table.Td>{contact.phoneNumbers?.[0]?.phoneNumber}</Table.Td>
								<Table.Td>
									<Group gap='xs'>
										<Button
											size='xs'
											variant='subtle'
											leftSection={<IconEdit size={16} />}
											onClick={() => onEdit(contact.id)}
										>
											Edit
										</Button>
										<Button
											size='xs'
											variant='subtle'
											color='red'
											leftSection={<IconTrash size={16} />}
											onClick={() =>
												modals.openConfirmModal({
													title: 'Confirm Deletion',
													centered: true,
													children: (
														<Text className={classes.confirmDelete}>
															Are you sure you want to delete this contact? This
															action cannot be undone.
														</Text>
													),
													labels: { confirm: 'Delete', cancel: 'Cancel' },
													confirmProps: { color: 'red' },
													onConfirm: async () => {
														try {
															await deleteContact.mutateAsync(
																contact.id.toString()
															);
															reloadList();
															notifications.show({
																title: 'Contact Deleted',
																message: `${contact.firstName} ${contact.lastName} has been deleted.`,
																color: 'green',
															});
														} catch (error) {
															notifications.show({
																title: 'Error',
																message:
																	'Failed to delete contact. Please try again.',
																color: 'red',
															});
															console.error('Failed to delete contact:', error);
														}
													},
												})
											}
										>
											Delete
										</Button>
									</Group>
								</Table.Td>
							</Table.Tr>
						))
					)}
				</Table.Tbody>
			</Table>
		</>
	);
}
