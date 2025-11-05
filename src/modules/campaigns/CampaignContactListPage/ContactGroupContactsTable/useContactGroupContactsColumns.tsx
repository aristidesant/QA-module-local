import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import type { Contact } from '~/models/ContactsModel';
import { timeAgo } from '~/utils/dateUtils';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: 'green',
	INACTIVE: 'gray',
	DO_NOT_RESPOND: 'red',
	CONTACTED: 'blue',
	VOICE_MAIL: 'yellow',
	ON_CALL: 'blue',
	INICATIVE: 'orange',
	DECEASED: 'gray',
};

const getStatusColor = (status: string) =>
	STATUS_COLOR[status] ?? STATUS_COLOR.INACTIVE;

const formatFullName = (contact: Contact) => {
	const parts = [contact.firstName, contact.lastName].filter(Boolean);
	return parts.length > 0 ? parts.join(' ') : 'Unnamed contact';
};

const useContactGroupContactsColumns = (): ColumnDef<Contact>[] =>
	useMemo(
		() => [
			{
				id: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const contact = row.original;
					return (
						<Stack gap={2}>
							<Text size='sm' fw={500}>
								{formatFullName(contact)}
							</Text>
							{contact.emails && contact.emails.length > 0 && (
								<Text size='xs' c='dimmed'>
									{contact.emails[0]}
								</Text>
							)}
						</Stack>
					);
				},
			},
			{
				id: 'identifier',
				header: 'Identifier',
				cell: ({ row }) => {
					const contact = row.original;
					if (!contact.identifier) {
						return <Text size='sm'>—</Text>;
					}
					return (
						<Stack gap={2}>
							<Text size='sm'>{contact.identifier}</Text>
							<Text size='xs' c='dimmed'>
								{contact.identifierType}
							</Text>
						</Stack>
					);
				},
			},
			{
				id: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const contact = row.original;
					return (
						<Badge
							variant='light'
							color={getStatusColor(contact.status)}
							size='sm'
						>
							{contact.status}
						</Badge>
					);
				},
			},
			{
				id: 'phone',
				header: 'Primary phone',
				cell: ({ row }) => {
					const contact = row.original;
					const primaryPhone =
						contact.phones?.[0] ||
						contact.phoneNumbers?.[0]?.phoneNumber ||
						contact.phone ||
						'—';
					return <Text size='sm'>{primaryPhone}</Text>;
				},
			},
			{
				id: 'updatedAt',
				header: 'Last updated',
				cell: ({ row }) => {
					const contact = row.original;
					const rawDate = contact.updatedAt ?? contact.createdAt;
					if (!rawDate) {
						return <Text size='sm'>—</Text>;
					}
					return (
						<Stack gap={2}>
							<Text size='sm'>{timeAgo(rawDate)}</Text>
							<Text size='xs' c='dimmed'>
								{dayjs(rawDate).format('MMM D, YYYY')}
							</Text>
						</Stack>
					);
				},
			},
		],
		[]
	);

export default useContactGroupContactsColumns;
