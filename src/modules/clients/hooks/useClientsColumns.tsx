import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClientModel } from '~/models/ClientModel';
import {
	getClientDisplayLabel,
	getClientSecondaryLabel,
} from '~/utils/clientDisplay';

interface UseClientsColumnsProps {
	onEdit: (id: number) => void;
	onDelete: (client: ClientModel) => void;
}

const useClientsColumns = ({
	onEdit,
	onDelete,
}: UseClientsColumnsProps): ColumnDef<ClientModel>[] => {
	const { t } = useTranslation('clients');
	const columns = useMemo<ColumnDef<ClientModel>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('table.columns.client'),
				cell: ({ row }) => {
					const primaryLabel = getClientDisplayLabel(row.original);
					const secondaryLabel = getClientSecondaryLabel(row.original);

					return (
						<>
							<Text size='sm' fw={500}>
								{primaryLabel}
							</Text>
							{secondaryLabel && (
								<Text size='xs' c='dimmed'>
									{secondaryLabel}
								</Text>
							)}
						</>
					);
				},
			},
			{
				accessorKey: 'email',
				header: t('table.columns.email'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.email || '-'}
					</Text>
				),
			},
			{
				accessorKey: 'phone',
				header: t('table.columns.phone'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.phone || '-'}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('table.columns.actions'),
				cell: ({ row }) => (
					<Group gap={4} justify='flex-end' wrap='nowrap'>
						<Tooltip label={t('actions.edit', { ns: 'common' })}>
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
						<Tooltip label={t('actions.delete', { ns: 'common' })}>
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
		[onEdit, onDelete, t]
	);

	return columns;
};

export default useClientsColumns;
