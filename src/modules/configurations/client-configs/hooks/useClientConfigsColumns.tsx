import { useMemo } from 'react';
import { Badge, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ClientConfig } from '~/models/ClientConfig';
import { useTranslation } from 'react-i18next';
import styles from '../ClientConfigsContent/ClientConfigsContent.module.css';

export function useClientConfigsColumns(
	onEdit: (config: ClientConfig) => void,
	onDelete: (config: ClientConfig) => void
): ColumnDef<ClientConfig>[] {
	const { t } = useTranslation('client-configs');

	return useMemo(
		() => [
			{
				accessorKey: 'name',
				header: t('table.columns.name'),
				cell: ({ row }) => (
					<Text className={styles.configName} fw={500}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'description',
				header: t('table.columns.description'),
				cell: ({ row }) => (
					<Text className={styles.description}>{row.original.description}</Text>
				),
			},
			{
				accessorKey: 'type',
				header: t('table.columns.type'),
				cell: ({ row }) => (
					<Badge variant='light' size='sm'>
						{row.original.type}
					</Badge>
				),
			},
			{
				accessorKey: 'value',
				header: t('table.columns.value'),
				cell: ({ row }) => (
					<Text className={styles.value} lineClamp={1}>
						{row.original.value}
					</Text>
				),
			},
			{
				accessorKey: 'updatedAt',
				header: t('table.columns.updatedAt'),
				cell: ({ row }) => (
					<Text className={styles.dateText}>
						{new Date(row.original.updatedAt).toLocaleDateString()}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('table.columns.actions'),
				cell: ({ row }) => (
					<Group gap='xs' className={styles.actionsGroup}>
						<Tooltip label={t('table.tooltips.edit')} withArrow>
							<Button
								size='xs'
								variant='subtle'
								onClick={() => onEdit(row.original)}
								className={styles.actionButton}
							>
								<IconEdit size={14} />
							</Button>
						</Tooltip>
						<Tooltip label={t('table.tooltips.delete')} withArrow>
							<Button
								size='xs'
								variant='subtle'
								color='red'
								onClick={() => onDelete(row.original)}
								className={styles.actionButton}
							>
								<IconTrash size={14} />
							</Button>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, t]
	);
}
