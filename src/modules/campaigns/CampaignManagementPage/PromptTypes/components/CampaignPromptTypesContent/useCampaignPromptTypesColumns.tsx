import { useMemo } from 'react';
import { Badge, Button, Group, Text, Tooltip } from '@mantine/core';
import {
	IconEdit,
	IconTrash,
	IconClock,
	IconListNumbers,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import styles from './CampaignPromptTypesContent.module.css';

interface UseCampaignPromptTypesColumnsProps {
	onEdit: (promptType: CampaignPromptTypeModel) => void;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

export const useCampaignPromptTypesColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
}: UseCampaignPromptTypesColumnsProps) => {
	return useMemo<ColumnDef<CampaignPromptTypeModel>[]>(
		() => [
			{
				accessorKey: 'order',
				header: 'Order',
				size: 90,
				cell: ({ row }) => (
					<Group gap='xs'>
						<IconListNumbers size={14} stroke={1.5} />
						<Text size='sm' fw={600} className={styles.orderValue}>
							{row.original.order ?? '--'}
						</Text>
					</Group>
				),
			},
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Text className={styles.typeName} size='sm'>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'icon',
				header: 'Icon',
				cell: ({ row }) => (
					<Badge variant='outline' size='sm' className={styles.iconBadge}>
						{row.original.icon || 'Not set'}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => (
					<Group gap='xs'>
						<IconClock size={14} stroke={1.5} />
						<Text size='xs' className={styles.createdAt}>
							{row.original.createdAt
								? new Date(row.original.createdAt).toLocaleDateString(
										undefined,
										{
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										}
									)
								: 'Not available'}
						</Text>
					</Group>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap='xs' className={styles.actionsGroup}>
						<Tooltip label='Edit prompt type' withArrow>
							<Button
								size='xs'
								variant='light'
								onClick={() => onEdit(row.original)}
								className={styles.actionButton}
							>
								<IconEdit size={14} />
							</Button>
						</Tooltip>
						<Tooltip label='Delete prompt type' withArrow>
							<Button
								size='xs'
								variant='light'
								color='red'
								onClick={() => onDelete(row.original.id)}
								loading={isDeletePending}
								className={styles.actionButton}
							>
								<IconTrash size={14} />
							</Button>
						</Tooltip>
					</Group>
				),
			},
		],
		[isDeletePending, onDelete, onEdit]
	);
};
