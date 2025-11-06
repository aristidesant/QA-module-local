import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Badge } from '@mantine/core';

interface PhoneNumber {
	phoneNumber: string;
	type?: string;
	status?: string;
	retries?: number;
}

export function usePhoneNumbersColumns() {
	return useMemo<ColumnDef<PhoneNumber>[]>(
		() => [
			{
				accessorKey: 'phoneNumber',
				header: 'Phone Number',
				cell: (info) => (
					<Text size='xs' ff='monospace'>
						{info.getValue() as string}
					</Text>
				),
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
