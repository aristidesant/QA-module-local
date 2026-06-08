import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Group, Menu, Text, Tooltip } from '@mantine/core';
import type { ToolModel } from '~/models/ToolModel';
import { useTranslation } from 'react-i18next';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { timeAgo } from '~/utils/dateUtils';
import styles from '../ToolsList/ToolsList.module.css';

interface UseToolsListColumnsProps {
	onDelete: (tool: ToolModel) => void;
	onEdit: (tool: ToolModel) => void;
}

function dateTooltip(iso?: string | null) {
	if (!iso) return '-';
	return new Date(iso).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function useToolsListColumns({
	onDelete,
	onEdit,
}: UseToolsListColumnsProps): ColumnDef<ToolModel>[] {
	const { t } = useTranslation('tools');

	return useMemo<ColumnDef<ToolModel>[]>(() => {
		return [
			{
				accessorKey: 'name',
				header: t('columns.name'),
				cell: ({ row }) => {
					const tool = row.original;
					return (
						<div className={styles.nameCell}>
							<Text fz='sm' fw={600} className={styles.nameText}>
								{tool.name}
							</Text>
							<Text
								fz='xs'
								c='dimmed'
								className={styles.nameDescription}
								fs={tool.description ? undefined : 'italic'}
							>
								{tool.description || t('columns.noDescription')}
							</Text>
						</div>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ row }) => {
					const statusKey = row.original.status.toLowerCase();
					const cls =
						statusKey === 'active'
							? styles.statusActive
							: styles.statusInactive;
					return (
						<span className={cls}>
							<span className={styles.statusDot} />
							{t(`status.${statusKey}`, { defaultValue: row.original.status })}
						</span>
					);
				},
			},
			{
				id: 'creator',
				header: t('columns.createdBy'),
				cell: ({ row }) => (
					<Text fz='sm' c='dimmed'>
						{row.original.config?.accessInfo?.creatorName ||
							t('columns.unknownCreator')}
					</Text>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('columns.created'),
				cell: ({ getValue }) => {
					const value = getValue() as string;
					return (
						<Tooltip label={dateTooltip(value)} withArrow withinPortal>
							<Text fz='sm'>{timeAgo(value)}</Text>
						</Tooltip>
					);
				},
				size: 100,
			},
			{
				accessorKey: 'updatedAt',
				header: t('columns.updated'),
				cell: ({ getValue }) => {
					const value = getValue() as string;
					return (
						<Tooltip label={dateTooltip(value)} withArrow withinPortal>
							<Text fz='sm'>{timeAgo(value)}</Text>
						</Tooltip>
					);
				},
				size: 100,
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsCell,
				},
				cell: ({ row }) => (
					<Group justify='flex-end' onClick={(e) => e.stopPropagation()}>
						<Menu shadow='sm' position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									size='sm'
									aria-label={t('columns.actions')}
								>
									<IconDotsVertical size={15} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEdit size={15} stroke={1.5} />}
									onClick={() => onEdit(row.original)}
								>
									{t('actions.saveChanges')}
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconTrash size={15} stroke={1.5} />}
									color='red'
									onClick={() => onDelete(row.original)}
								>
									{t('actions.delete')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				),
				size: 60,
			},
		];
	}, [onDelete, onEdit, t]);
}

export default useToolsListColumns;
