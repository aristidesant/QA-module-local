import { Group, Text, Badge, Tooltip, Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
	CampaignObjective,
	CampaignObjectiveWithCategoryName,
} from '~/models/CampaignObjectiveModel';
import styles from './CampaignObjectivesContent.module.css';

export type EnrichedObjective = CampaignObjectiveWithCategoryName;

interface UseCampaignObjectivesColumnsProps {
	onEdit: (objective: CampaignObjective) => void;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

export const useCampaignObjectivesColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
}: UseCampaignObjectivesColumnsProps): ColumnDef<EnrichedObjective>[] => {
	return [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Text fw={600} className={styles.objectiveName}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'categoryName',
			header: 'Category',
			cell: ({ row }) => (
				<Badge size='xs' color='indigo' variant='light'>
					{row.original.categoryName}
				</Badge>
			),
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<Text size='sm' c='dimmed' className={styles.objectiveDescription}>
					{row.original.description || 'No description'}
				</Text>
			),
		},
		{
			accessorKey: 'active',
			header: 'Status',
			cell: ({ row }) => (
				<Badge
					variant='dot'
					color={row.original.active ? 'green' : 'gray'}
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
					<Tooltip label='Edit objective' withArrow>
						<Button
							size='xs'
							variant='light'
							onClick={() => onEdit(row.original)}
							className={styles.actionButton}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label='Delete objective' withArrow>
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
	];
};
