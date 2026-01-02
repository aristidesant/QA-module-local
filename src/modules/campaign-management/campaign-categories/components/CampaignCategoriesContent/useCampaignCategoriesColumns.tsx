import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Badge, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign-management');
	const columns = useMemo<ColumnDef<CampaignCategory>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('setup.categories.table.headers.name'),
				cell: ({ row }) => (
					<Text fw={500} size='sm' className={styles.categoryName}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'code',
				header: t('setup.categories.table.headers.code'),
				cell: ({ row }) => (
					<Badge tt={'none'} variant='outline' color='green' size='sm'>
						{row.original.code}
					</Badge>
				),
			},
			{
				accessorKey: 'description',
				header: t('setup.categories.table.headers.description'),
				cell: ({ row }) => (
					<Tooltip
						label={row.original.description}
						disabled={!row.original.description}
						multiline
						w={300}
					>
						<Text size='sm' c='dimmed' className={styles.categoryDescription}>
							{row.original.description ||
								t('setup.categories.table.empty.description')}
						</Text>
					</Tooltip>
				),
			},
			{
				accessorKey: 'active',
				header: t('setup.categories.table.headers.status'),
				cell: ({ row }) => (
					<Badge
						variant='dot'
						color={row.original.active ? 'teal' : 'gray'}
						size='sm'
						className={styles.statusBadge}
					>
						{t(
							row.original.active
								? 'setup.categories.table.status.active'
								: 'setup.categories.table.status.inactive'
						)}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: t('setup.categories.table.headers.actions'),
				cell: ({ row }) => (
					<Group gap='xs' className={styles.actionsGroup}>
						<Tooltip label={t('setup.categories.table.actions.edit')} withArrow>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip
							label={t('setup.categories.table.actions.delete')}
							withArrow
						>
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
		[onEdit, onDelete, isDeletePending, t]
	);

	return columns;
};
