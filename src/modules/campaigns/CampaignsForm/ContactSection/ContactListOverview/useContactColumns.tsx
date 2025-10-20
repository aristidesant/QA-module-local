import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Group, Text, Badge, Avatar, Tooltip } from '@mantine/core';
import { IconMail, IconPhone } from '@tabler/icons-react';
import type { Contact } from '~/models/ContactsModel';
import {
	getStatusColor,
	getContactStatus,
	getInitials,
	getUniquePhones,
	getFullName,
} from './contactHelpers';
import styles from './ContactListOverview.module.css';

/**
 * Custom hook that returns column definitions for the contacts table
 * Memoized to prevent unnecessary recalculations
 */
export const useContactColumns = (): ColumnDef<Contact, any>[] => {
	return useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'Contact',
				cell: ({ row }) => {
					const contact = row.original;
					const fullName = getFullName(contact);
					const hasEmail = contact.emails?.[0];
					const hasPhone = getUniquePhones(contact).length > 0;

					return (
						<Group gap={12} wrap='nowrap' align='center'>
							<Avatar
								size={'sm'}
								color={
									hasEmail && hasPhone ? 'blue' : hasPhone ? 'cyan' : 'gray'
								}
								radius='xl'
								className={styles.avatar}
							>
								{getInitials(contact.firstName || '', contact.lastName || '')}
							</Avatar>
							<Text size='xs' fw={500}>
								{fullName}
							</Text>
						</Group>
					);
				},
				size: 220,
			},
			{
				accessorKey: 'phones',
				header: 'Phone',
				cell: ({ row }) => {
					const contact = row.original;
					const uniquePhones = getUniquePhones(contact);

					if (uniquePhones.length === 0) {
						return (
							<Text size='xs' c='dimmed' fw={400} className={styles.emptyState}>
								—
							</Text>
						);
					}

					const primaryPhone = uniquePhones[0];
					const additionalCount = uniquePhones.length - 1;

					return (
						<Group gap={8} wrap='nowrap' align='center'>
							<Group
								gap={4}
								wrap='nowrap'
								align='center'
								className={styles.valueWrapper}
							>
								<IconPhone
									size={14}
									stroke={1.6}
									className={styles.columnIcon}
								/>
								<Text size='xs' className={styles.phoneText} fw={500}>
									{primaryPhone}
								</Text>
							</Group>
							{additionalCount > 0 && (
								<Tooltip
									label={
										<div className={styles.phoneTooltip}>
											{uniquePhones.slice(1).map((phone, idx) => (
												<div key={idx}>{phone}</div>
											))}
										</div>
									}
									multiline
									maw={220}
								>
									<Badge
										variant='outline'
										size='xs'
										radius='xl'
										color='gray'
										className={styles.countBadge}
									>
										+{additionalCount}
									</Badge>
								</Tooltip>
							)}
						</Group>
					);
				},
				size: 180,
			},
			{
				accessorKey: 'emails',
				header: 'Email',
				cell: ({ row }) => {
					const contact = row.original;
					const email = contact.emails?.[0] || '';
					const additionalEmails = contact.emails
						? contact.emails.length - 1
						: 0;

					if (!email) {
						return (
							<Text size='xs' c='dimmed' fw={400} className={styles.emptyState}>
								—
							</Text>
						);
					}

					return (
						<Group gap={8} wrap='nowrap' align='center'>
							<Group
								gap={4}
								wrap='nowrap'
								align='center'
								className={styles.valueWrapper}
							>
								<IconMail
									size={14}
									stroke={1.6}
									className={styles.columnIcon}
								/>
								<Tooltip label={email} multiline maw={300}>
									<Text size='xs' className={styles.emailText} truncate>
										{email}
									</Text>
								</Tooltip>
							</Group>
							{additionalEmails > 0 && (
								<Badge
									variant='outline'
									size='xs'
									radius='xl'
									color='gray'
									className={styles.countBadge}
								>
									+{additionalEmails}
								</Badge>
							)}
						</Group>
					);
				},
				size: 200,
			},
			{
				id: 'status',
				accessorFn: (contact) => getContactStatus(contact),
				header: 'Status',
				cell: ({ row }) => {
					const contact = row.original;
					const status = getContactStatus(contact);
					const color = getStatusColor(contact);

					return (
						<Group gap={8} wrap='nowrap'>
							<Badge
								variant='light'
								color={color}
								size='sm'
								radius='sm'
								className={styles.statusBadge}
							>
								{status}
							</Badge>
						</Group>
					);
				},
				size: 160,
			},
		],
		[]
	);
};
