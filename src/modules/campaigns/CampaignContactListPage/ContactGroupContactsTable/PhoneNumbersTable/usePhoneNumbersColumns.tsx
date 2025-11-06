import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Badge, Group, Tooltip } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { PhoneValidationError } from '~/models/ContactsModel';

interface PhoneNumber {
	phoneNumber: string;
	type?: string;
	status?: string;
	retries?: number;
	validationError?: PhoneValidationError;
}

export function usePhoneNumbersColumns() {
	return useMemo<ColumnDef<PhoneNumber>[]>(
		() => [
			{
				accessorKey: 'phoneNumber',
				header: 'Phone Number',
				cell: (info) => {
					const phoneNumber = info.getValue() as string;
					const phoneEntry = info.row.original;
					const hasError = phoneEntry.validationError;

					return (
						<Group gap={8} wrap='nowrap'>
							<Text
								size='xs'
								ff='monospace'
								c={hasError ? 'red' : undefined}
								fw={hasError ? 600 : 400}
							>
								{phoneNumber}
							</Text>
							{hasError && (
								<Tooltip
									label={phoneEntry.validationError?.message}
									multiline
									w={220}
									withArrow
								>
									<Badge
										color='red'
										variant='light'
										size='xs'
										leftSection={<IconAlertCircle size={12} />}
									>
										{phoneEntry.validationError?.code}
									</Badge>
								</Tooltip>
							)}
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: (info) => {
					const status = info.getValue() as string;
					return status ? (
						<Badge variant='light' size='xs'>
							{status}
						</Badge>
					) : (
						<Text size='xs' c='dimmed'>
							N/A
						</Text>
					);
				},
			},
			{
				accessorKey: 'retryCounter',
				header: 'Retries',
				cell: (info) => {
					const retries = info.getValue() as number;
					return <Text size='xs'>{retries ?? 0}</Text>;
				},
			},
		],
		[]
	);
}
