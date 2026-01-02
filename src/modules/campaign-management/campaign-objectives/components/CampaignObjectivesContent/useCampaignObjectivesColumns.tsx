import { Group, Text, Badge, Tooltip, Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign-management');
	return [
		{
			accessorKey: 'name',
			header: t('setup.objectives.table.headers.name'),
			cell: ({ row }) => (
				<Text fw={600} className={styles.objectiveName}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'categoryName',
			header: t('setup.objectives.table.headers.category'),
			cell: ({ row }) => (
				<Badge size='xs' color='indigo' variant='light'>
					{row.original.categoryName}
				</Badge>
			),
		},
		{
			accessorKey: 'description',
			header: t('setup.objectives.table.headers.description'),
			cell: ({ row }) => (
				<Text size='sm' c='dimmed' className={styles.objectiveDescription}>
					{row.original.description ||
						t('setup.objectives.table.empty.description')}
				</Text>
			),
		},
		{
			accessorKey: 'active',
			header: t('setup.objectives.table.headers.status'),
			cell: ({ row }) => (
				<Badge
					variant='dot'
					color={row.original.active ? 'green' : 'gray'}
					size='sm'
					className={styles.statusBadge}
				>
					{t(
						row.original.active
							? 'setup.objectives.table.status.active'
							: 'setup.objectives.table.status.inactive'
					)}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: t('setup.objectives.table.headers.actions'),
			cell: ({ row }) => (
				<Group gap='xs' className={styles.actionsGroup}>
					<Tooltip label={t('setup.objectives.table.actions.edit')} withArrow>
						<Button
							size='xs'
							variant='light'
							onClick={() => onEdit(row.original)}
							className={styles.actionButton}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label={t('setup.objectives.table.actions.delete')} withArrow>
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
