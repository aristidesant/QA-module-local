import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { ClientModel } from '~/models/ClientModel';

interface UseClientsColumnsProps {
	onEdit: (id: number) => void;
	onDelete: (client: ClientModel) => void;
}

const useClientsColumns = ({
	onEdit,
	onDelete,
}: UseClientsColumnsProps): ColumnDef<ClientModel>[] => {
	const columns = useMemo<ColumnDef<ClientModel>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Text size='sm' fw={500}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.email || '-'}
					</Text>
				),
			},
			{
				accessorKey: 'phone',
				header: 'Phone',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.phone || '-'}
					</Text>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap={4} justify='flex-end' wrap='nowrap'>
						<Tooltip label='Edit'>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={(e) => {
									e.stopPropagation();
									onEdit(row.original.id);
								}}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Delete'>
							<ActionIcon
								variant='subtle'
								color='red'
								onClick={(e) => {
									e.stopPropagation();
									onDelete(row.original);
								}}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
				meta: {
					headerClassName: 'w-[100px]',
				},
			},
		],
		[onEdit, onDelete]
	);

	return columns;
};

export default useClientsColumns;
