import { ActionIcon, Group, Menu, Text } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import type { ClientModel } from '~/models/ClientModel';
import {
	getClientDisplayLabel,
	getClientSecondaryLabel,
} from '~/utils/clientDisplay';

interface UseClientsColumnsProps {
	onEdit: (id: number) => void;
	onDelete: (client: ClientModel) => void;
}

function dateTooltip(iso?: string | Date | null) {
	if (!iso) return '—';
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
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
				accessorKey: 'createdAt',
				header: t('table.columns.created'),
				cell: ({ getValue }) => {
					const value = getValue<string | Date>();
					return (
						<Text size='sm' title={dateTooltip(value)}>
							{timeAgo(value)}
						</Text>
					);
				},
				size: 100,
			},
			{
				accessorKey: 'updatedAt',
				header: t('table.columns.updated'),
				cell: ({ getValue }) => {
					const value = getValue<string | Date>();
					return (
						<Text size='sm' title={dateTooltip(value)}>
							{timeAgo(value)}
						</Text>
					);
				},
				size: 100,
			},
			{
				id: 'actions',
				header: t('table.columns.actions'),
				cell: ({ row }) => (
					<Group justify='flex-end' onClick={(e) => e.stopPropagation()}>
						<Menu shadow='sm' position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									size='sm'
									aria-label={t('table.columns.actions')}
								>
									<IconDotsVertical size={15} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEdit size={15} stroke={1.5} />}
									onClick={() => onEdit(row.original.id)}
								>
									{t('actions.edit', { ns: 'common' })}
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconTrash size={15} stroke={1.5} />}
									color='red'
									onClick={() => onDelete(row.original)}
								>
									{t('actions.delete', { ns: 'common' })}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				),
				size: 60,
			},
		],
		[onEdit, onDelete, t]
	);

	return columns;
};

export default useClientsColumns;
