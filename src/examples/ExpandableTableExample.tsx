import React from 'react';
import BaseTable from '~/components/BaseTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Text } from '@mantine/core';

// Example data type
type Contact = {
	id: string;
	name: string;
	email: string;
	phone: string;
	phoneNumbers?: { phoneNumber: string; type: string }[];
};

// Example: Inner table component for phone numbers
const PhoneNumbersTable: React.FC<{
	phoneNumbers: { phoneNumber: string; type: string }[];
}> = ({ phoneNumbers }) => {
	const phoneColumns: ColumnDef<{ phoneNumber: string; type: string }>[] = [
		{
			accessorKey: 'type',
			header: 'Type',
			cell: (info) => (
				<Badge variant='light'>{info.getValue() as string}</Badge>
			),
		},
		{
			accessorKey: 'phoneNumber',
			header: 'Phone Number',
			cell: (info) => <Text size='sm'>{info.getValue() as string}</Text>,
		},
	];

	return (
		<div style={{ padding: '8px 0' }}>
			<Text size='sm' fw={600} mb='xs'>
				Phone Numbers
			</Text>
			<BaseTable data={phoneNumbers} columns={phoneColumns} density='compact' />
		</div>
	);
};

// Example usage of expandable rows
const ExpandableTableExample: React.FC = () => {
	// Sample data
	const contacts: Contact[] = [
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			phone: '+1 234-567-8900',
			phoneNumbers: [
				{ phoneNumber: '+1 234-567-8900', type: 'Mobile' },
				{ phoneNumber: '+1 234-567-8901', type: 'Home' },
				{ phoneNumber: '+1 234-567-8902', type: 'Work' },
			],
		},
		{
			id: '2',
			name: 'Jane Smith',
			email: 'jane@example.com',
			phone: '+1 234-567-8903',
			phoneNumbers: [
				{ phoneNumber: '+1 234-567-8903', type: 'Mobile' },
				{ phoneNumber: '+1 234-567-8904', type: 'Work' },
			],
		},
	];

	// Main table columns
	const columns: ColumnDef<Contact>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
		},
		{
			accessorKey: 'email',
			header: 'Email',
		},
		{
			accessorKey: 'phone',
			header: 'Primary Phone',
		},
	];

	return (
		<div style={{ padding: '20px' }}>
			<h2>Expandable Table Example</h2>
			<p>Click on any row to expand and see additional phone numbers</p>

			<BaseTable
				data={contacts}
				columns={columns}
				enableExpanding={true}
				renderExpandedRow={(contact) =>
					contact.phoneNumbers && contact.phoneNumbers.length > 0 ? (
						<PhoneNumbersTable phoneNumbers={contact.phoneNumbers} />
					) : (
						<Text size='sm' c='dimmed'>
							No additional phone numbers
						</Text>
					)
				}
				onExpandedChange={(expandedIds) => {
					console.log('Expanded rows:', expandedIds);
				}}
			/>
		</div>
	);
};

export default ExpandableTableExample;
