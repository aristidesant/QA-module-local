import { useMemo } from 'react';
import { Text } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import type { Prompt } from '~/models/PromptModel';
import { StatusBadge } from './StatusBadge';
import { ActionsMenu } from './ActionsMenu';

export const usePromptHistoryColumns = (): ColumnDef<Prompt>[] => {
	return useMemo<ColumnDef<Prompt>[]>(() => {
		return [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Text fw={500} size='sm'>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => (
					<Text size='xs' c='dimmed'>
						{row.original.createdAt
							? new Date(row.original.createdAt).toLocaleDateString()
							: 'Unknown'}
					</Text>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => <ActionsMenu prompt={row.original} />,
			},
		];
	}, []);
};

export default usePromptHistoryColumns;
