import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Badge, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import styles from './CampaignCategoriesContent.module.css';

interface UseCampaignCategoriesColumnsProps {
	onEdit: (category: CampaignCategory) => void;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

export const useCampaignCategoriesColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
}: UseCampaignCategoriesColumnsProps) => {
	const columns = useMemo<ColumnDef<CampaignCategory>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<Text fw={500} size='sm' className={styles.categoryName}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'code',
				header: 'Code',
				cell: ({ row }) => (
					<Badge tt={'none'} variant='outline' color='green' size='sm'>
						{row.original.code}
					</Badge>
				),
			},
			{
				accessorKey: 'description',
				header: 'Description',
				cell: ({ row }) => (
					<Tooltip
						label={row.original.description}
						disabled={!row.original.description}
						multiline
						w={300}
					>
						<Text size='sm' c='dimmed' className={styles.categoryDescription}>
							{row.original.description || 'No description'}
						</Text>
					</Tooltip>
				),
			},
			{
				accessorKey: 'active',
				header: 'Status',
				cell: ({ row }) => (
					<Badge
						variant='dot'
						color={row.original.active ? 'teal' : 'gray'}
						size='sm'
						className={styles.statusBadge}
					>
						{row.original.active ? 'Active' : 'Inactive'}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap='xs' className={styles.actionsGroup}>
						<Tooltip label='Edit category' withArrow>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Delete category' withArrow>
							<ActionIcon
								variant='subtle'
								color='red'
								onClick={() => onDelete(row.original.id)}
								loading={isDeletePending}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, isDeletePending]
	);

	return columns;
};
