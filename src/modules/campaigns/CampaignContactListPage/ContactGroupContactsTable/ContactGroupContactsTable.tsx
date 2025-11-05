import { useMemo } from 'react';
import { Alert, Stack } from '@mantine/core';
import BaseTable from '~/components/BaseTable';
import type { Contact } from '~/models/ContactsModel';
import useContactGroupContactsColumns from './useContactGroupContactsColumns';

export interface ContactGroupContactsTableProps {
	contacts: Contact[];
	isLoading?: boolean;
	error?: string;
}

const ContactGroupContactsTable = ({
	contacts,
	isLoading = false,
	error,
}: ContactGroupContactsTableProps) => {
	const columns = useContactGroupContactsColumns();

	const data = useMemo(() => contacts ?? [], [contacts]);

	return (
		<Stack gap='sm'>
			{error && (
				<Alert color='red' variant='light' title='Failed to load contacts'>
					{error}
				</Alert>
			)}
			<BaseTable<Contact>
				data={data}
				columns={columns}
				isLoading={isLoading}
				emptyMessage='No contacts available for this list.'
				density='compact'
			/>
		</Stack>
	);
};

export default ContactGroupContactsTable;
